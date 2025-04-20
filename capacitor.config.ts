import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7199d6e089c64cd7aa4ffc83bbcebee8',
  appName: 'AROGYA MITRA',
  webDir: 'dist',
  server: {
    url: 'https://7199d6e0-89c6-4cd7-aa4f-fc83bbcebee8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6C63FF",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
    },
  },
};

export default config;
