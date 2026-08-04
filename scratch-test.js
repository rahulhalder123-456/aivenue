const { search, SafeSearchType } = require('duck-duck-scrape');

async function test() {
  const searchResults = await search('rust programming basics tutorial free', {
    safeSearch: SafeSearchType.OFF
  });
  console.log("Web Results:");
  console.log(searchResults.results.slice(0, 3).map(r => ({ title: r.title, url: r.url })));
}

test();
