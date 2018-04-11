const scrapeIt = require('scrape-it');

async function scrapeChapters(url, page) {
  return new Promise(resolve => {
    console.log(`Beginning: ${url} | Page: ${page}`);
    scrapeIt(`${url}?pg=${page}`, {
      chapters: {
        listItem: '#myTable tr',
        data: {
          name: '.chp-release',
          url: {
            selector: '.chp-release',
            attr: 'href'
          },
          date: {
            selector: 'td',
            closest: 'td',
            convert: x => new Date(x),
            how: 'html'
          },
          publisherName: {
            selector: 'td:nth-child(2) > a',
            how: 'html'
          },
          publisherUrl: {
            selector: 'td:nth-child(2) > a',
            attr: 'href'
          }
        }
      }
    }).then(async ({data, response}) => {
      response.statusCode !== 200 && console.log(response.statusCode);
      //console.log(data);//debug only
      console.log(`Beginning chapter retrieval: ${url} | Page: ${page}`);

      const chapters = await Promise.all(data.chapters
        .filter(el => !!el.name.trim())
        .map(async (chapter) => {
          // get the chapter true link (the publisher link)
          return new Promise(resolve => {
            scrapeIt(`https:${chapter.url}`, {
              link: {
                selector: 'link[rel=prev]',
                attr: 'href'
              }
            }).then(({data, response}) => {
              response.statusCode !== 200 && console.log(response.statusCode);
              //console.log(data, response);//debug only
              chapter.url = response.fetchedUrls[0];
              resolve(chapter);
            }).catch(console.error);
          });
        })
      );

      resolve(chapters);
    }).catch(console.error);
  });
};
module.exports = scrapeChapters;