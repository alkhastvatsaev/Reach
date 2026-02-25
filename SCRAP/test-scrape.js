const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  const url = 'https://www.linkedin.com/jobs/search?keywords=Alternance%20Developpeur&location=Strasbourg';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const jobs = [];
    $('.base-card').each((i, el) => {
      const title = $(el).find('.base-search-card__title').text().trim();
      const company = $(el).find('.base-search-card__subtitle').text().trim();
      const link = $(el).find('.base-card__full-link').attr('href');
      if (title && company) {
        jobs.push({ title, company, link });
      }
    });
    console.log(JSON.stringify(jobs, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
scrape();
