const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const cors = require("cors");
const app = express();
require('dotenv').config();
const port = 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.static('public'));
app.use(cors());


let api_Key = process.env.BACKEND_ACCESS_API_KEY;

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const allMetadataString = req.body.allMetadata;
        if (file) {
            const formData = new FormData();
            formData.append('file', file.buffer, {filename: file.originalname});
            formData.append('allMetadata', JSON.stringify(allMetadataString));

            // Forward the file to the Flask server along with the filename
            const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${api_Key}`,
                },
            });
            res.json(response.data);
        } else {
            res.status(400).json({error: 'No file received'});
        }
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/overwrite', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const allMetadataString = req.body.allMetadata;
        if (file) {
            const formData = new FormData();
            formData.append('file', file.buffer, {filename: file.originalname});
            formData.append('allMetadata', JSON.stringify(allMetadataString));

            // Forward the file to the Flask server along with the filename
            const response = await axios.post('http://127.0.0.1:8000/overwrite', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${api_Key}`,
                },
            });
            res.json(response.data);
        } else {
            res.status(400).json({error: 'No file received'});
        }
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/update_metadata',upload.single(''),async (req, res) => {
try {
    const allMetadataString = req.body.allMetadata;
    const formData = new FormData();
    formData.append('allMetadata', JSON.stringify(allMetadataString))
    const response = await axios.post('http://127.0.0.1:8000/update_metadata', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${api_Key}`,
        },
    });
    res.json(response.data)
}catch (error) {
    res.status(500).json({error: error.message});
}
});
app.post('/delete-file',upload.single(''),async (req, res) => {
    try {
        const allMetadataString = req.body.allMetadata;
        const formData = new FormData();
        formData.append('allMetadata', JSON.stringify(allMetadataString))
        const response = await axios.post('http://127.0.0.1:8000/overwrite', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization": `Bearer ${api_Key}`,
                'Delete': 'true',
            },
        });
        res.json(response.data)
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});
app.post('/get-answer', upload.single(''), async (req, res) => {

        const userId = req.body.user_id;
        const chatId = req.body.chatId;
        const department = req.body.department;
        const mode = req.body.mode;
        let userMessage = req.body.user_message;
        const formData = new FormData();
        formData.append('user_message', userMessage);
        formData.append('department', department);
        formData.append('mode', mode);
        formData.append('user_id', userId);
        formData.append('chatId', chatId);
    try {
        const response = await axios.post('http://127.0.0.1:8000/get-answer', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization": `Bearer ${api_Key}`,
            },
        });
        res.json(response.data)
    } catch (error) {
        res.status(500).json({error: error.message});
    }

});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
