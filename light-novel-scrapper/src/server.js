const scrapeIt = require('scrape-it');
const fs = require('fs');
const scrapeNovels= require('./novels');
const scrapePublisher= require('./publishers');
const scrapeChapters = require('./chapters');

function saveToDisk(fileName, content) {
  fs.writeFile(`./data/${fileName}`, JSON.stringify(content), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log('File completed!');
  });
}

async function scrapeAllNovels() {
  try {
    const MAX_PAGES = 143;
    let novels = [];
    for (let i = 1; i < MAX_PAGES; i++) {
      const newNovels = await scrapeNovels(i);
      novels = [...novels, ...newNovels];
    }
    saveToDisk('novels', novels);
  } catch(err) {
    console.error(err);
  }
}

async function scrapeAllPublishers(dto) {
  try {
    let publishers = [];
    for (let i = 0; i < dto.length; i++) {
      const url = await scrapePublisher(dto[i].url);
      publishers.push({
        name: dto[i].name,
        url: url
      });
    }
    saveToDisk('publishers', publishers);
  } catch(err) {
    console.error(err);
  }
}

async function scrapeAllChapters() {
  try {
    let chapters = [];
    let count = 1;
    while (count < 10) {
      const newChapters = await scrapeChapters('https://www.novelupdates.com/series/the-legendary-moonlight-sculptor/', count + 33);
      if (newChapters.length === 0 || (chapters.length > 0 && newChapters[newChapters.length - 1].url === chapters[chapters.length - 1].url)) {
        count = 1000;
      } else {
        chapters = [...chapters, ...newChapters];
        count++;
      }
    }
    saveToDisk('chapters', chapters);
  } catch(err) {
    console.error(err);
  }
}

async function main() {
  //await scrapeAllNovels();
  //await scrapeAllChapters();
  await scrapeAllPublishers([
    {
      name: 'LMSnovel',
      url: 'https://www.novelupdates.com/group/japtem/'
    }
  ])
}

main();