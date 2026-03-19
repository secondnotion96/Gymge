import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymge.app',
  appName: 'Gymge',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
