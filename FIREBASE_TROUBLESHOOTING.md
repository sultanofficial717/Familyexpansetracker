# Firebase Authentication Troubleshooting

## Your Firebase Project: `gcs-skill`

### Step 1: Verify Firebase Project Setup

**Check if your Firebase project exists:**
- Go to: https://console.firebase.google.com/
- Look for project: **`gcs-skill`** 
- If you see it, projects are properly configured

---

## **Step 2: Enable Email/Password Authentication**

1. Open: https://console.firebase.google.com/project/gcs-skill/authentication/providers
2. Look for **Email/Password** provider
3. Click on it
4. Toggle **ENABLE** (switch should be ON/blue)
5. Click **SAVE**

**Screenshot reference:**
- Provider should show "Email/Password" with a checkmark ✅

---

## **Step 3: Create Demo User in Firebase**

1. Go to: https://console.firebase.google.com/project/gcs-skill/authentication/users
2. Click **Create user** button (top right)
3. Fill in:
   ```
   Email: demo@example.com
   Password: DemoPassword123!
   ```
4. Click **Create**

---

## **Step 4: Restart Dev Server**

The app now loads Firebase config from:
1. **Environment Variables** (from `.env` file) - preferred
2. **JSON file** (fallback) - if env vars not available

**Restart the server:**
```bash
# Stop the current server (Ctrl+C)
# Then run:
npm run dev
```

**Watch for this in console:**
```
Firebase Config Project: gcs-skill
Config Source: Environment Variables
```

If you see "JSON File", it means `.env` is not being loaded properly.

---

## **Step 5: Test Login Again**

1. Open: `http://localhost:3000`
2. Click **Register** or **Login**
3. Use credentials:
   ```
   Email: demo@example.com
   Password: DemoPassword123!
   ```

---

## **Advanced Debugging**

### Open Browser DevTools Console (F12)

Look for these messages:

✅ **Success (you should see):**
```
Firebase Config Project: gcs-skill
Config Source: Environment Variables
Login successful: user-id-here
```

❌ **Error (troubleshoot these):**

| Error Message | Cause | Fix |
|---|---|---|
| `auth/operation-not-allowed` | Email/Password not enabled | Enable in Authentication → Sign-in method |
| `auth/user-not-found` | User doesn't exist | Create demo user in Authentication → Users |
| `auth/wrong-password` | Password incorrect | Double-check password |
| `Error initializing Firebase` | Invalid API key | Check `.env` file values |

---

## **File Locations & Configuration**

Your `.env` file is now synced with `gcs-skill` project:

```
File: d:\Familyexpansetracker\.env

VITE_FIREBASE_PROJECT_ID="gcs-skill"
VITE_FIREBASE_API_KEY="AIzaSyA9ySVD-rMT16lp3L0qDm94vF1fiPRoBDQ"
VITE_FIREBASE_AUTH_DOMAIN="gcs-skill.firebaseapp.com"
```

---

## **Check Firestore Database**

Also verify your Firestore database is created:

1. Go to: https://console.firebase.google.com/project/gcs-skill/firestore
2. If no database exists, click **Create database**
3. Choose **Test mode** (for development)
4. Click **Create**

---

## **Next Steps if Still Not Working**

1. **Check Firebase account** - Can you log into https://console.firebase.google.com/ ?
2. **Check Email/Password toggle** - Is it definitely ENABLED (blue/on)?
3. **Check User Exists** - Do you see `demo@example.com` in Authentication → Users?
4. **Browser Cache** - Clear cache: `Ctrl + Shift + Delete` → Clear all
5. **Check Console Errors** - Open DevTools (F12) → Console tab, share exact error message

---

## **Quick Checklist**

- [ ] Firebase project `gcs-skill` exists and is active
- [ ] Email/Password authentication is **ENABLED**
- [ ] Demo user `demo@example.com` exists in Authentication → Users
- [ ] Firestore database is created (shows real database, not disabled)
- [ ] `.env` file is in project root: `d:\Familyexpansetracker\.env`
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (`Ctrl + Shift + Delete`)
