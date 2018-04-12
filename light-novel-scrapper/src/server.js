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

function loadFromDisk(fileName) {
  const fs = require('fs');
  return JSON.parse(fs.readFileSync(`./data/${fileName}`, 'utf8'));
}

function addNovelIds() {
  let validation = new Set();
  const novels = loadFromDisk('novels')
    .map(novel => {
      let id = novel.url.replace('https://www.novelupdates.com/series/', '');
      id = id.replace('/', '');
      id = id.replace(/\%[0-9a-z]+/ig, '');
      validation.add(id);
      novel.id = id;
      return novel;
    });
  if (validation.size === novels.length) {
    saveToDisk('novels-with-id', novels);
  }
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

async function scrapeAllChapters(novel) {
  try {
    let chapters = [];
    let count = 1;
    while (count < 1000) {
      const newChapters = await scrapeChapters(novel.url, count);
      if (newChapters.length === 0 || (chapters.length > 0 && newChapters[newChapters.length - 1].url === chapters[chapters.length - 1].url)) {
        count = 1000;
      } else {
        chapters = [...chapters, ...newChapters];
        count++;
      }
    }
    saveToDisk(`chapters/${novel.id}`, chapters);
  } catch(err) {
    console.error(err);
  }
}

async function main() {
  //await scrapeAllNovels();
  //await scrapeAllChapters();
  /*
  await scrapeAllPublishers([
    {
      name: 'LMSnovel',
      url: 'https://www.novelupdates.com/group/japtem/'
    }
  ]);
  */
  //addNovelIds();
  let count = 0;
  const novels = loadFromDisk('novels-with-id');
  const from = 50;
  let to = from + 50;
  to = to > novels.length ? novels.length : to;
  for (let i = from; i < to; i++) {
    if (!fs.existsSync(`./data/chapters/${novels[i].id}`)) {
      await scrapeAllChapters(novels[i]);
      count++;
    } 
  }
  console.log(`Processed ${count} novels`);
}

main();