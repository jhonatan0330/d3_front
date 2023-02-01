import { config } from 'config';

export const environment = {
  production: true,
  appVersion: config.dateCompile,
  apiURL: config.apiUrl,
  endPoint: config.endPointAuth,
  endPointCheck: config.endPointCheck,
  dateCompile: config.dateCompile
};
