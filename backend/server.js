const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdf = require('pdf-parse');
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const apiToken = process.env.LLAMA_AI_API_TOKEN;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: '*' }));

app.post('/file', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    let text = await parsePdf(file.path);
    let md = await sendQuery(text);
    console.log(md);
    res.send(md);
});

app.listen(3500, () => {
  console.log('Server running on http://localhost:3500');
});


async function parsePdf(pdfPath) {
    try {
        const data = await pdf(pdfPath);
        return data.text;
    } catch (err) {
        console.log(err);
    }
}

async function sendQuery(message) {
    message = "You are a text summarizer. Summarize the following text: " + message;
    const apiRequest = {
        "inputs": message,
        "parameters": {
            "max_length": 2000,
            "temperature": 0.5
        },
        "options": {
            "use_cache": false
        }
    };

    const retryDelay = 20000; // 20 seconds

    for (let attempt = 0; attempt < 3; attempt++) {  // Retry 3 times
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-hf",
                apiRequest,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HF_API_TOKEN}`
                    }
                }
            );
            return response.data.generated_text;

        } catch (error) {
            if (error.response && error.response.status === 503) {
                console.error("Model is still loading. Retrying...");
                await new Promise(res => setTimeout(res, retryDelay));
            } else {
                console.error("Error querying Hugging Face API:", error);
                throw new Error("Failed to retrieve summary.");
            }
        }
    }
       throw new Error("Model is unavailable after multiple attempts.");
}