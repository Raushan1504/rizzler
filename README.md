# Rizzler - AI-Powered Dating App

A full-stack, cross-platform mobile dating application built with React Native, Express, and MongoDB. Rizzler features a modern swipe-to-match interface, real-time messaging, and AI-generated bios to help users make better connections.

## 📸 Screenshots

*(Add your screenshots below! Simply drag and drop your images into the GitHub editor, or link local files if you create a `screenshots` folder).*

| Discover & Swipe | Real-time Chat | User Profile & AI Bio |
| :---: | :---: | :---: |
| <img src="https://via.placeholder.com/250x500.png?text=Add+Swipe+Screenshot" width="250"/> | <img src="https://via.placeholder.com/250x500.png?text=Add+Chat+Screenshot" width="250"/> | <img src="https://via.placeholder.com/250x500.png?text=Add+Profile+Screenshot" width="250"/> |

<br>

<div align="center">
  <img src="https://via.placeholder.com/600x300.png?text=Add+Match+Screen+or+Any+Other+UI+Here" width="600"/>
</div>

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
git clone <your-github-repo-url>
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
