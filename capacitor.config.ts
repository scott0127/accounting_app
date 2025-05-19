import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.simpleaccount.app',
  appName: 'SimpleAccount',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
