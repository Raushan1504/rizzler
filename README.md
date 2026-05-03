# Rizzler - AI-Powered Dating App

A full-stack, cross-platform mobile dating application built with React Native, Express, and MongoDB. Rizzler features a modern swipe-to-match interface, real-time messaging, and AI-generated bios to help users make better connections.

## 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/49a322b3-3536-48f0-98cd-f5450b7fed76" width="250"/>
  <img src="https://github.com/user-attachments/assets/2d511b03-2a34-4c1a-8c06-0383525d3c58" width="250"/>
  <img src="https://github.com/user-attachments/assets/fc716ce4-e324-4dbe-b215-688896a61d6e" width="250"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/a1ffbb43-5f01-4bf6-8646-8ee88301e3cd" width="250"/>
  <img src="https://github.com/user-attachments/assets/d667b058-cd79-45a8-a945-70324fc68092" width="250"/>
</p>
<br>

## 🚀 Features

- **Swipe & Match:** Fluid Tinder-style card swiping powered by React Native Reanimated.
- **Real-Time Chat:** Instant messaging with your matches using WebSockets (Socket.IO).
- **AI Integration:** Automatically generate catchy bios and personalized icebreakers using the Anthropic Claude API.
- **Media Management:** Secure and optimized profile picture uploads hosted on Cloudinary.
- **Authentication:** Secure user login and registration workflow using JWT.

## 🛠️ Tech Stack

**Frontend**
- React Native (Expo)
- React Navigation
- Zustand (State Management)
- React Native Reanimated & Gesture Handler

**Backend**
- Node.js & Express.js
- Socket.IO (WebSockets)
- MongoDB & Mongoose
- Cloudinary (Image Storage)
- Anthropic Claude AI SDK

## 💻 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Raushan1504/rizzler
cd dating-app-project
```

### 2. Start the Backend
```bash
cd backend
npm install
# Ensure your .env file is set up with MongoDB, Cloudinary, and AI API keys
npm run dev
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npx expo start
```
