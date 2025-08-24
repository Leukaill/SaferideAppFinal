import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saferide.app',
  appName: 'SafeRide',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    hostname: 'app.saferide.local',
    iosScheme: 'saferide'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#007AFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    Geolocation: {
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION']
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#007AFF'
    },
    Toast: {
      duration: 'short'
    }
  }
};

export default config;
