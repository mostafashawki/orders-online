
let dbConfig = {};

dbConfig.mongoURI = {
  //development db
  development: 'mongodb://mshawki:secretPass123456@ds125331.mlab.com:25331/orders-online-db',
  //testing db 
  test: 'mongodb://xyztestuser:secretPass123456@ds125241.mlab.com:25241/orders-online-db-test'
   
};

module.exports = dbConfig;
