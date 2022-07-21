import { config } from 'config';

export const environment = {
  production: false,
  appVersion: '2030.03.09' + '-dev',
  apiURL: config.apiUrl,
  endPoint: config.endPointAuth,
  endPointCheck: config.endPointCheck,
  dateCompile: config.dateCompile
};
