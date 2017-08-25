let isDev = /^(192\.168|localhost)/.test(window.location.host);

//isDev = false;

export default {
  production: !isDev,
  host: '',
  hostAPI: isDev ? 'http://192.168.200.75' : 'http://api.lebodev.com',
  tokenName: 'xlz_token',
  expiration: 'xlz_exp',
  tokenExp: 'xlz_exp',
  luck28Id: '1',
  theme: '1'
};


