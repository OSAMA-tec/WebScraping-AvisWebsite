const axios = require('axios');
const cheerio = require('cheerio');

const scrapeWebsite = async () => {
  const websiteUrl = 'https://www.avis.com/en/locations/us';
  try {
    const response = await axios.get(websiteUrl);
    const $ = cheerio.load(response.data);
    const states = $('.location-list.section ul li a');
    const state = {};
    const locationCodes = {};
    const allLocationCodes = [];
    for (let i = 0; i < states.length; i++) {
      const stateUrl = `https://www.avis.com${states[i].attribs.href}`;
      const stateName = states[i].attribs.title;
      state[stateName] = {};
      console.log(stateName);
      const stateResponse = await axios.get(stateUrl);
      const state$ = cheerio.load(stateResponse.data);
      const cities = state$('.location-list.section ul li a');
      const cityCodes = {};
      const stateCities = [];
      for (let j = 0; j < cities.length; j++) {
        const cityUrl = `https://www.avis.com${cities[j].attribs.href}`;
        const cityResponse = await axios.get(cityUrl);
        const city$ = cheerio.load(cityResponse.data);
        const locationCodeArray = city$('.location-page-g h2').text().trim().split('(');
        let locationCode = '';
        if (locationCodeArray.length >= 2) {
          locationCode = locationCodeArray[1].split(')')[0];
        }
        // console.log(locationCode);

        const cityName = cities[j].attribs.title;
        stateCities.push(cityName);
        cityCodes[cityName] = locationCode;
        allLocationCodes.push(locationCode);
      }
      state[stateName] = cityCodes;
      locationCodes[stateName] = stateCities;
    }
    console.log('State Object:', JSON.stringify(state, null, 2));
    // console.log('Location Codes Object:', JSON.stringify(locationCodes, null, 2));
    console.log('All Location Codes:', allLocationCodes);
  } catch (error) {
    console.error(error);
  }
};

scrapeWebsite();
