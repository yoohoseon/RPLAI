const https = require('https');

https.get('https://www.pinterest.com/search/pins/?q=luxury%20skincare', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('__PWS_DATA__')) {
      console.log('Found __PWS_DATA__');
      const match = data.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
      if (match) {
        console.log('Found JSON data length:', match[1].length);
        const json = JSON.parse(match[1]);
        // Let's print out some keys to see what's inside
        const results = json.props?.initialReduxState?.search?.pins || [];
        console.log('Found pins array? ', Array.isArray(results));
        // Also look in other places
        console.log('Keys in initialReduxState:', Object.keys(json.props?.initialReduxState || {}));
      }
    } else {
      console.log('__PWS_DATA__ not found');
    }
  });
}).on('error', err => console.error(err));
