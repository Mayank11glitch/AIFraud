import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scamdetect.ai',
  appName: 'ScamDetect AI',
  webDir: 'dist',
  server: {
    // Uncomment below for local development (replace with your IP):
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,

    // Production: app loads from bundled dist/
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#111111',
      showSpinner: true,
      spinnerColor: '#f2f2f2',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#f2f2f2',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
