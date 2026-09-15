# 📚 Bookly - Full Stack eBook Platform

Bookly is a full-stack eBook platform that allows users to browse digital books, securely authenticate using Google Sign-In, purchase eBooks through Razorpay, and download purchased books securely.

## 🚀 Live Demo

Frontend: https://ebook-frontend-3.vercel.app

---

## 📖 Project Overview

This project was built to gain hands-on experience in Full Stack Web Development by integrating frontend development, backend APIs, authentication systems, database management, and payment gateway services into a single real-world application.

Users can:

* Browse available eBooks
* Sign in securely using Google Authentication
* Purchase eBooks through Razorpay
* Receive secure download access after successful payment
* Access purchased content through protected download links

---

## ✨ Features

### User Features

* Google Authentication using Firebase
* Browse eBook collection
* Responsive and modern UI
* Secure payment processing
* Protected eBook downloads
* Mobile-friendly design

### Admin Features

* Add new eBooks
* Store eBook details in MongoDB
* Manage eBook inventory
* Secure backend API endpoints

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Firebase Authentication
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* Firebase Google Authentication

### Payment Gateway

* Razorpay

### Deployment

* Vercel (Frontend)
* Render / Railway (Backend)
* MongoDB Atlas (Database)

---

## 🏗️ System Architecture

User
↓
React Frontend
↓
Firebase Authentication
↓
Express Backend API
↓
MongoDB Atlas
↓
Razorpay Payment Gateway
↓
Secure eBook Download

---

## 🔒 Authentication Flow

1. User clicks "Continue with Google"
2. Firebase authenticates the user
3. User information is retrieved
4. Access is granted to the platform
5. Protected routes are enabled

---

## 💳 Payment Flow

1. User selects an eBook
2. Frontend sends purchase request
3. Backend creates Razorpay order
4. User completes payment
5. Razorpay returns payment details
6. Backend verifies payment signature
7. Secure download token is generated
8. User downloads the purchased eBook

---


## 📦 Installation

### Clone Repository

git clone https://github.com/yourusername/bookly.git

### Frontend Setup

cd frontend

npm install

npm run dev

### Backend Setup

cd backend

npm install

npm start

---

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

* Full Stack Application Development
* React Component Architecture
* REST API Development
* MongoDB Database Integration
* Firebase Authentication
* Razorpay Payment Gateway Integration
* Secure File Download Implementation
* Deployment and Environment Management
* Production-Level Debugging

---

## 🔮 Future Improvements

* User Dashboard
* Purchase History
* Wishlist System
* Admin Panel
* eBook Search & Filtering
* PDF Preview
* Email Notifications
* Dark Mode

---
