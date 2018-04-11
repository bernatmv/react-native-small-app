const scrapeIt = require('scrape-it');

async function scrapeNovels(page) {
  return new Promise(resolve => {
    console.log(`Beginning: novels retreive | Page: ${page}`);
    scrapeIt(`https://www.novelupdates.com/novelslisting/?st=1&pg=${page}`, {
      novels: {
        listItem: '#myTable tr.bdrank',
        data: {      
          name: 'td > a',
          image: {
            selector: '.searchpic img',
            attr: 'src'
          },
          url: {
            selector: '.searchpic > a',
            attr: 'href'
          },
          rating: '.lstrate',
          country: '.orgalign > span',
          tags: {
            listItem: '.gennew'
          },
          description: '.noveldesc',
          releases: '.sfstext'
        }
      }
    }).then(({data, response}) => {
      response.statusCode !== 200 && console.log(response.statusCode);
    
      const newNovels = data.novels.map((novel, index) => {
        novel.releases = Number.parseInt(novel.releases.slice(10)); // remove 'Releases: '
        novel.rating = Number.parseFloat(novel.rating.slice(1, -1)); // remove '(' and ')' between rating
        if (novel.tags.length > 0) {
          novel.completed = novel.tags[0] === 'Completed';
          if (novel.completed) {
            novel.tags = novel.tags.slice(1);
          }
        }
        novel.description = novel.description.replace('... more>>','');
        novel.description = novel.description.replace('<<less','');
        novel.description = novel.description.replace(/[^\x00-\xfF]/g, '');
        return novel;
      }).filter(novel => novel.releases !== 0);

      resolve(newNovels);
    }).catch(console.error);  
  });
};
module.exports = scrapeNovels;