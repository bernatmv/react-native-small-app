const scrapeIt = require('scrape-it');
const fs = require('fs');

const MAX_PAGES = 0;
//const MAX_PAGES = 143;
let novels = [];

async function scrapeNovels(page) {
  return new Promise(resolve => {
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
      console.log(response.statusCode);
    
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
  
      novels = [...novels, ...newNovels];

      resolve();
    }).catch(console.error);  
  });
};

function saveToDisk(fileName, content) {
  fs.writeFile(`./data/${fileName}`, JSON.stringify(content), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log('File completed!');
  });
}

async function main() {
  try {
    for (let i = 1; i < MAX_PAGES; i++) {
      await scrapeNovels(i);
    }
    saveToDisk('novels', novels);
  } catch(err) {
    console.error(err);
  }
}

main();

/*
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

https://www.novelupdates.com/novelslisting/?st=1&pg=1
https://www.novelupdates.com/series/the-legendary-moonlight-sculptor/?pg=1
*/