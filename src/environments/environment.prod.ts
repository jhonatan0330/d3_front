import { config } from 'config';

export const environment = {
  production: true,
  appVersion: config.dateCompile,
  apiURL: config.apiUrl,
  dateCompile: config.dateCompile
};
