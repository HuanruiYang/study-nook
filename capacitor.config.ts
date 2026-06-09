import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.study.nook',
  appName: '手边书房',
  webDir: 'dist',
  server: {
    url: 'https://huanruiyang.github.io/study-nook/',
    cleartext: false,
  },
};

export default config;
