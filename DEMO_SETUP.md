# Demo Setup & Troubleshooting Guide

## Problem: Unable to Login with Demo Credentials

### Root Causes & Solutions

---

## **Issue 1: Firebase Email/Password Authentication Not Enabled**

### ✅ Fix: Enable in Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Navigate to: **Authentication** → **Sign-in method**
4. Find **Email/Password**
5. **Enable** it (toggle ON)
6. Click **Save**

---

## **Issue 2: Demo User Doesn't Exist**

### ✅ Fix: Create Test User in Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Navigate to: **Authentication** → **Users**
4. Click **Create user** (or **Add user**)
5. Fill in:
   ```
   Email: demo@example.com
   Password: DemoPassword123!
   ```
6. Click **Create**

---

## **Issue 3: Invalid Firebase Credentials in .env**

### ✅ Check Your .env File

Your current `.env` has **placeholder values**. You need **real Firebase credentials**:

```bash
# Current (WRONG - placeholders)
VITE_FIREBASE_API_KEY="AIzaSyDxjqKR5XZN9m7pQ8vK2lN3oP4qR5sT6uV"

# Should be (REAL credentials from your project)
VITE_FIREBASE_API_KEY="AIzaSy[YOUR_REAL_KEY]"
```

### To Get Real Credentials:

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click **Settings** (gear icon) → **Project Settings**
4. Scroll to **Your apps** section
5. Find your **Web App** (or create one)
6. Copy the **firebaseConfig** object
7. Update your `.env` file with these values:

```env
VITE_FIREBASE_API_KEY=[from firebaseConfig.apiKey]
VITE_FIREBASE_AUTH_DOMAIN=[from firebaseConfig.authDomain]
VITE_FIREBASE_PROJECT_ID=[from firebaseConfig.projectId]
VITE_FIREBASE_STORAGE_BUCKET=[from firebaseConfig.storageBucket]
VITE_FIREBASE_MESSAGING_SENDER_ID=[from firebaseConfig.messagingSenderId]
VITE_FIREBASE_APP_ID=[from firebaseConfig.appId]
VITE_FIREBASE_MEASUREMENT_ID=[from firebaseConfig.measurementId]
VITE_FIREBASE_DATABASE_ID="(default)"
```

---

## **Step-by-Step Verification Checklist**

- [ ] Firebase project exists at console.firebase.google.com
- [ ] Email/Password authentication is **ENABLED**
- [ ] Test user `demo@example.com` exists in Authentication → Users
- [ ] `.env` file has **real Firebase credentials** (not placeholders)
- [ ] `.env` file is in the project root directory
- [ ] Dev server restarted after updating `.env`

---

## **Testing Login Flow**

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open: `http://localhost:3000`

3. Click **"Login"** or navigate to `/login`

4. Enter:
   ```
   Email: demo@example.com
   Password: DemoPassword123!
   ```

5. Click **Sign In**

---

## **Debug: Browser Console Errors**

If you still get errors:

1. Open browser: **DevTools** (F12)
2. Go to **Console** tab
3. Take screenshot of any errors
4. Share them for detailed troubleshooting

---

## **Firebase Security Rules**

Make sure your Firestore rules allow registration. Update via:
Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow creation of user documents during registration
    match /users/{uid} {
      allow create: if request.auth.uid == uid;
      allow read: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid;
    }
    
    // Allow creation of family documents
    match /families/{familyId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## **Common Error Messages & Fixes**

| Error | Cause | Fix |
|-------|-------|-----|
| `auth/operation-not-allowed` | Email/Password not enabled | Enable in Authentication → Sign-in method |
| `auth/user-not-found` | User doesn't exist | Create user in Authentication → Users |
| `auth/wrong-password` | Wrong password | Check password is correct |
| `[Firebase Error]` with no code | Invalid credentials in .env | Update `.env` with real Firebase config |
| App won't load | `VITE_FIREBASE_API_KEY` not found | `.env` file missing or not reloaded |

---

## **If Still Having Issues**

1. **Restart Dev Server**: 
   ```bash
   npm run dev
   ```

2. **Clear Browser Cache**: 
   - Press `Ctrl + Shift + Delete`
   - Clear cache/cookies
   - Reload page

3. **Check Firestore Database Exists**:
   - Firebase Console → Firestore Database
   - If gray/disabled, click **Create database**
   - Choose **Test mode** for development

4. **Verify Real Firebase Project**:
   - Is the project actually created and active in Firebase Console?
   - Can you see users and data in the console?
