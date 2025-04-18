var _domain = 'wzrkt.com';
let customDomain = 'clevertap-prod.com';

export default {
  domain: _domain,
  customDomain, 
  protocol: 'https:',
  enablePersonalization: true,
  eventUploadInterval: 1 * 1000, // 1s
  eventUploadThreshold: 50,
  maxSavedEventCount: 1000,
  uploadBatchSize: 50,
  sendPages: false,
  sendPings: false,
};
