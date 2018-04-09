const scrapeIt = require('scrape-it');

scrapeIt('https://www.novelupdates.com/series/the-legendary-moonlight-sculptor/?pg=1', {
  chapters: {
    listItem: '#myTable tr',
    data: {
      name: '.chp-release',
      url: {
        selector: '.chp-release',
        attr: 'href'
      }  
    }
  }
}).then(({data, response}) => {
  console.log(response.statusCode);
  console.log(data);
});

scrapeIt('https://www.novelupdates.com/extnu/1400792/', {
  link: {
    selector: 'link[rel=prev]',
    attr: 'href'
  }
}).then(({data, response}) => {
  console.log(response.statusCode);
  console.log(data);
});