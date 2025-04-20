# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7199d6e0-89c6-4cd7-aa4f-fc83bbcebee8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7199d6e0-89c6-4cd7-aa4f-fc83bbcebee8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7199d6e0-89c6-4cd7-aa4f-fc83bbcebee8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# AROGYA MITRA

AROGYA MITRA is a comprehensive healthcare application designed to assist users with medication management, doctor appointments, emergency services, and more.

## Features

- User authentication (email, phone, Google)
- Medication tracking and reminders
- Doctor appointment scheduling
- Emergency contact management
- Mental health support with facial expression analysis
  - Real-time emotion detection during mental health assessments
  - Comprehensive reports based on facial expressions
  - Personalized recommendations based on emotional responses
- Telemedicine services
- Pharmacy locator
- Multiple language support

## Tech Stack

- Frontend: React, React Native, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: Firebase Auth
- Mobile: Capacitor

## Deployment Instructions

### Web Deployment

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_API_KEY=your_firebase_api_key
   ```

3. Build and deploy:
   ```
   npm run deploy:web
   ```

### Mobile Deployment (Android)

1. Install dependencies:
   ```
   npm install
   ```

2. Build for mobile:
   ```
   npm run build:mobile
   ```

3. Run on Android:
   ```
   npm run android
   ```

4. This will open Android Studio where you can:
   - Build the app
   - Run on an emulator
   - Generate a signed APK/AAB for Play Store submission

### Mobile Deployment (iOS)

1. Install dependencies (on a Mac):
   ```
   npm install
   ```

2. Build for mobile:
   ```
   npm run build:mobile
   ```

3. Run on iOS:
   ```
   npm run ios
   ```

4. This will open Xcode where you can:
   - Build the app
   - Run on a simulator
   - Generate an archive for App Store submission

## Deployment Platforms

### Web Hosting Options:
- **Netlify**: Connect your GitHub repository and use the `deploy:netlify` script
- **Vercel**: Import your project and set the build command to `npm run build`
- **Heroku**: Deploy with the Heroku CLI using `heroku create` and `git push heroku main`

### Mobile App Stores:
- **Google Play Store**: Submit your signed AAB from Android Studio
- **Apple App Store**: Submit your archive from Xcode using App Store Connect

## Configuration

Update the Firebase configuration in the following files:
- `src/firebase.ts`
- `App.native.tsx`

## MongoDB Setup

Follow the instructions in `mongodb-compass-guide.md` for setting up remote MongoDB access.

## Deployment on Vercel

### One-Click Deployment
The fastest way to deploy this app to Vercel is to click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fcaring-voice-haven)

### Manual Deployment Steps

1. **Install Vercel CLI** (optional):
   ```
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```
   vercel login
   ```

3. **Deploy from local directory**:
   ```
   vercel
   ```

4. **Alternatively, deploy through the Vercel dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Import your repository
   - Configure the project:
     - Framework Preset: Vite
     - Build Command: `npm run install:models && npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Deploy

5. **Environment Variables**:
   Make sure to add any required environment variables in the Vercel project settings.

### Important Notes

- The app is configured to automatically download face-api.js models during the build process
- The face detection feature requires camera permissions, which should work correctly in production
- All routes are configured to work with React Router client-side routing

## License

[MIT License](LICENSE)
