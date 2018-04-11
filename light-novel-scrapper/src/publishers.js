const scrapeIt = require('scrape-it');

async function scrapePublisher(url) {
  return new Promise(resolve => {
    console.log(`Beginning: publisher retreive | ${url}`);
    scrapeIt(`${url}`, {
      url: {
        selector: '.groupinfo a[rel=nofollow]',
        attr: 'href'
      }
    }).then(({data, response}) => {
      response.statusCode !== 200 && console.log(response.statusCode);
      console.log(data);//debug only
      resolve(data.url);
    }).catch(console.error);
  }).catch(console.error);
};
module.exports = scrapePublisher;