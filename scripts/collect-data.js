import axios from 'axios';
import fs from 'fs';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    const sparkAPI = axios.create({
      baseURL:
        "https://sparkapi.com/Reso/OData/Property?$filter=(PropertyType eq 'Residential')",
    });
    sparkAPI.defaults.headers.common['Authorization'] =
      'Bearer c5qvzvp4h2esdln6wrh4t0mts';
    sparkAPI.defaults.headers.common['Content-Type'] = 'application/json';
    
    sparkAPI.get("").then(async res => {
      const propertyArr = res.data.value;
  
      propertyArr.map((item ) => {
        const listingID = item['ListingId'];
        const data = "{\"" + listingID + "\": " + JSON.stringify(item) + "}";
        const fileName = './' + filePath + '/' + listingID + ".json";
        fs.writeFile(fileName, data, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(fileName + ' has been written successfully.');
        });
      })
    })
    
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
})();
