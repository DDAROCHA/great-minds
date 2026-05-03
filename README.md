# 🧠 Great Minds

**Great Minds** is an interactive full-stack web app where two AI
personas debate any topic in real time.\
It's designed as a portfolio project to showcase modern web development,
AI integration, and system design.

------------------------------------------------------------------------

## 🚀 Live Demo

👉 *\[Add your deployed URL here\]*

------------------------------------------------------------------------

## ✨ Features

-   🤖 **AI vs AI Conversations**\
    Watch two AI personas debate automatically.

-   💬 **Dynamic Topic Input**\
    Start conversations on any topic instantly.

-   🧠 **Conversation Memory**\
    All conversations are stored and can be revisited.

-   ⚡ **Real-time Interaction**\
    Messages are generated on the fly using AI APIs.

-   🎨 **Smooth UI/UX**\
    Animations powered by Framer Motion.

-   ☁️ **Cloud Deployment**\
    Frontend on Netlify, backend on Render, database on MongoDB Atlas.

-   ⏳ **Cold Start Handling**\
    User-friendly loading state when backend wakes up.

------------------------------------------------------------------------

## 🏗️ Tech Stack

### Frontend

-   React
-   TypeScript
-   Framer Motion
-   CSS Modules / Custom CSS

### Backend

-   Node.js
-   Express

### Database

-   MongoDB Atlas

### AI

-   OpenAI API

### Deployment

-   Netlify (Frontend)
-   Render (Backend)

------------------------------------------------------------------------

## ⚙️ Environment Variables

### Frontend (`.env`)

REACT_APP_API_BASE=https://your-backend-url.onrender.com

### Backend (`.env`)

PORT=10000\
MONGO_URL=your_mongodb_connection_string\
OPENAI_API_KEY=your_openai_key

------------------------------------------------------------------------

## 🧪 Local Development

### 1. Clone the repo

git clone https://github.com/your-username/great-minds.git\
cd great-minds

### 2. Backend setup

cd backend\
npm install\
npm run dev

### 3. Frontend setup

cd frontend\
npm install\
npm start

------------------------------------------------------------------------

## ⚠️ Notes

-   The backend is hosted on a free tier (Render), so it may take
    \~20--30 seconds to wake up on first request.
-   This is expected behavior and handled in the UI.

------------------------------------------------------------------------

## 🎯 Purpose

This project was built to demonstrate:

-   Full-stack architecture\
-   AI integration in real applications\
-   Real-time UI/UX patterns\
-   API orchestration\
-   Cloud deployment workflows

------------------------------------------------------------------------

## 🔮 Future Improvements

-   Streaming responses (real-time typing)\
-   Better prompt engineering\
-   Conversation ranking / analytics\
-   Multi-model comparison\
-   Pre-warming backend to avoid cold starts

------------------------------------------------------------------------

## 👤 Author

Diego Da Rocha\
Full-Stack Engineer

------------------------------------------------------------------------

## 📄 License

MIT
