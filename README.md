# FamilyLedger - Family Expense Tracker

A professional-grade full-stack Progressive Web App (PWA) built with React, Vite, and Firebase. Features AI-powered receipt scanning using Google Gemini, with support for modern deployment platforms.

## Features
- **Admin Dashboard**: Overview of family spending, budget allocation, and analytics.
- **Member Dashboard**: Personal spending tracking and pocket money balance management.
- **AI Receipt Scanner**: Snap photos of receipts and automatically extract item name, price, and date.
- **Monthly Reports**: Visual analytics of family spending per member and category with export capabilities.
- **Family Management**: Invite family members, manage permissions, and set monthly pocket money limits.
- **Secure Authentication**: Email/password and Google Sign-in with role-based access control.

## Tech Stack
- **Frontend Framework**: React 19 with Vite for optimized builds
- **Styling**: Tailwind CSS 4 with Vite plugin
- **Database**: Firebase Cloud Firestore (NoSQL, real-time sync)
- **Authentication**: Firebase Auth (Email, Google OAuth)
- **File Storage**: Firebase Cloud Storage (receipt images)
- **UI Components**: Lucide React Icons, Recharts for analytics, Framer Motion animations
- **AI/ML**: Google Gemini API for receipt OCR and data extraction
- **Deployment**: Vercel (Frontend) + Firebase (Database & Auth)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project (free tier supported)
- Google Gemini API key
- Vercel account (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd familyexpansetracker
   npm install
   ```

2. **Configure Firebase**
   - Create a project on [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication**: Google Sign-in & Email/Password
   - Create **Firestore Database** (start in test mode for development)
   - Create **Cloud Storage** bucket
   - Download web app credentials and update `firebase-applet-config.json`

3. **Set Environment Variables**
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

## Production Deployment

### Option 1: Vercel + Firebase (Recommended)

**Why this setup?**
- Vercel: Fast, global CDN, automatic deployments from Git
- Firebase: Fully managed database, real-time sync, built-in security rules

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure Vercel Environment Variables**
   Add all environment variables in Vercel project settings

4. **Firestore Security Rules**
   Update `firestore.rules` for production:
   ```
   rules_version = '3';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /families/{familyId}/expenses/{expenseId} {
         allow read: if request.auth.uid in resource.data.allowedUsers;
         allow write: if request.auth.uid == resource.data.createdBy;
       }
     }
   }
   ```

5. **Firebase Console**
   - Switch Firestore to production mode
   - Enable backups and monitoring
   - Set up alerts for quota usage

### Option 2: Firebase Hosting

```bash
firebase deploy --only hosting,firestore:rules
```

## Environment Requirements

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Receipt OCR processing | ✅ Yes |
| `VITE_FIREBASE_*` | Database & auth connection | ✅ Yes |

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # TypeScript type checking
npm run clean    # Remove build artifacts
```

## Security Best Practices

- ✅ Enable Firestore on-device persistence for offline support
- ✅ Use Firebase Security Rules to restrict data access
- ✅ Keep API keys in environment variables (never commit `.env`)
- ✅ Enable 2FA on Firebase & Vercel accounts
- ✅ Regular backups enabled in Firebase
- ✅ Monitor quota usage and set up billing alerts

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── firebase/           # Firebase configuration
├── lib/                # Utility functions
├── pages/              # Page components (routing)
├── services/           # External API integrations (Gemini)
├── App.tsx             # Main app component
├── main.tsx            # React entry point
└── types.ts            # TypeScript type definitions
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance
- Built with Vite for optimized build sizes (~150KB gzipped)
- Real-time Firestore sync for instant updates
- Firebase CDN for global content delivery
- Progressive image loading for receipts

## Troubleshooting

**Build fails with Firebase errors**
- Ensure `firebase-applet-config.json` is in the project root
- Verify all environment variables are set

**Firestore quota exceeded**
- Check firestore.rules for efficient queries
- Monitor usage in Firebase Console
- Consider upgrading to Blaze pricing if needed

**Images not loading**
- Verify Firebase Storage bucket is configured
- Check CORS settings in Firebase Console

## Contributing
Steps for contributing to this project coming soon.

## License
MIT License - See LICENSE file for details.
