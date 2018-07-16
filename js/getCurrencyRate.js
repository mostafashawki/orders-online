const axios       = require('axios');
const parseString = require('xml2js').parseString;

//function with callback to get today currency prices
const getCurrencyRate = (currency, callback) =>{
    //=========axios setup
      const url = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
      const options = {
        method: 'GET',
        url,
      };
      //because EUR is our base
      if(currency === "EUR"){
        callback(1);
        return false;
      }
      //==========start axios request
      console.log('get data called');
      axios(options)
      .then(axiosRes => {
       let dataString ='';
       let dataJson = {};
       parseString(axiosRes.data,(error, result) => dataString = JSON.stringify(result));
  
       let parsedData = JSON.parse(dataString);
       dataJson = parsedData['gesmes:Envelope'].Cube[0].Cube[0].Cube;
        //console.log('data json is: ',dataJson);
        
        let filteredCurrency = dataJson
            .filter( obj =>  obj.$.currency === currency);
            let rate = filteredCurrency[0].$.rate;
  
        
        
        callback(rate) ;
        
  })
  .catch( (error) => {
   if (error.response) {
     console.log(error.response.data);
     res.send(error.message, error.response.status);
   } else if (error.request) {
     console.log(error.request);
   } else {
     // Something happened in setting up the request that triggered an Error
     console.log('Error', error.message);
   }
   console.log(error.config);
  });
  
   //============end axios
  }

  module.exports = getCurrencyRate;