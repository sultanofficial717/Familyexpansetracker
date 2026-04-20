# FamilyLedger - Family Expense Tracker

A full-stack Progressive Web App (PWA) built with React, Vite, and Firebase. Features AI-powered receipt scanning using Google Gemini.

## Features
- **Admin Dashboard**: Overview of family spending and budget.
- **Member Dashboard**: Personal spending tracking and pocket money balance.
- **AI Receipt Scanner**: Snap a photo of a receipt and automatically extract the item name, price, and date.
- **Monthly Reports**: Visual analytics of family spending per member and category.
- **Family Management**: Invite family members and manage their monthly pocket money.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: Firebase Auth, Cloud Firestore, Firebase Storage.
- **AI**: Google Gemini AI (via `@google/genai`).

## Setup Instructions

### 1. Firebase Configuration
- Create a project on the [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Google Sign-in and Email/Password).
- Create a **Firestore** database in your preferred region.
- Create a **Storage** bucket.
- Register a web app and copy the configuration to your `.env` file (see `.env.example`).

### 2. Gemini AI Setup
- This app uses your **GEMINI_API_KEY** for receipt scanning.
- Ensure the key is available in your environment.

### 3. Google Cloud Vision API
- While we use Gemini for OCR, you can also enable the **Cloud Vision API** in the Google Cloud Console for alternative processing if needed.

## Deployment
This app is ready to be deployed to **Firebase Hosting**.
Run `npm run build` and follow the Firebase CLI instructions.
