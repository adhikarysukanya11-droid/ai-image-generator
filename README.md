# 🎨 AI Image Generator

An AI-powered image generation web application that transforms text prompts into high-quality images using **Hugging Face Inference Providers** and the **FLUX.1-dev** model.

The application is built with **Python, Flask, HTML, CSS, and JavaScript** and provides a simple and user-friendly interface for generating AI images from text descriptions.

---

## 🚀 Features

- 📝 Generate images from text prompts
- 🤖 Powered by FLUX.1-dev
- ☁️ Uses Hugging Face Inference Providers
- 🎨 Custom image width and height
- ⚙️ Adjustable inference steps
- 🖥️ Simple and responsive web interface
- 🔐 Secure API token management using `.env`
- ⚡ Flask-based backend
- 🔄 Real-time communication between frontend and backend
- 🖼️ Generated images displayed directly in the browser

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS

### AI & API
- Hugging Face Inference Providers
- FLUX.1-dev
- `huggingface_hub`

### Other Libraries
- python-dotenv
- Pillow
- Requests

---

## 📂 Project Structure

```text
AI Image Generator/
│
├── static/
│   ├── script.js
│   └── styles.css
│
├── templates/
│   └── index.html
│
├── .env
├── .env.example
├── app.py
└── requirements.txt
