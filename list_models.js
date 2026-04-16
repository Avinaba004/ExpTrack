require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    // Not directly documented, wait, we can just use REST API to list models
    // Or just try fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
    const data = await response.json();
    console.log(data);
}
listModels();