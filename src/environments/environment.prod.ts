import { config } from 'config';

export const environment = {
  production: true,
  appVersion: '2030.03.09',
  apiURL: config.apiUrl,
  endPoint: config.endPointAuth,
  endPointCheck: config.endPointCheck,
  dateCompile: config.dateCompile
};
