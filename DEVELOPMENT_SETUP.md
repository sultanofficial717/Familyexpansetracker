# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Firebase account with project created
- Git installed

---

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/sultanofficial717/Familyexpansetracker.git
cd Familyexpansetracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update with your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project values:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_ID=(default)
GEMINI_API_KEY=your_gemini_key
```

### 4. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Create Firestore Database (Test mode)
5. Create Storage bucket for receipts
6. Create test user: `demo@example.com` / `DemoPassword123!`

---

## Development

### Start Dev Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Run Tests
```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

### Build for Production
```bash
npm run build
```

Output goes to `dist/` directory

---

## Project Structure

```
src/
├── components/        # React components
├── context/          # React Context (Auth)
├── firebase/         # Firebase configuration
├── lib/              # Utility functions
├── pages/            # Page components
├── services/         # External API services
└── App.tsx           # Main app component

test files/
├── __tests__/        # Integration and security tests
├── jest.config.cjs   # Jest configuration
└── jest.setup.cjs    # Global test setup
```

---

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feat/your-feature-name
```

### Commit Changes
```bash
git commit -m "feat: add your feature description"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### Push to Origin
```bash
git push origin feat/your-feature-name
```

### Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Add title and description
4. Request reviewers
5. Merge when approved

---

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in project settings
3. Deploy

### Firebase Hosting (Optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## Troubleshooting

### Firebase Connection Issues
- Check `.env` file has correct credentials
- Verify Firebase project is active
- Check Email/Password authentication is enabled
- See [FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)

### Test Failures
- Clear Jest cache: `npm run test -- --clearCache`
- Check Node version: Should be 18+
- See test configuration in `jest.config.cjs`

### Build Errors
- Clear node_modules: `rm -r node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Rebuild: `npm run build`

---

## Code Style

### ESLint
```bash
npx eslint src/
```

### Format Code
```bash
npx prettier --write src/
```

---

## Performance Tips

1. Use React DevTools Profiler
2. Monitor bundle size with `vite analyze`
3. Enable code splitting for large components
4. Use lazy loading for routes

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if needed
5. Commit with clear messages
6. Create a pull request

---

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review Firebase documentation

