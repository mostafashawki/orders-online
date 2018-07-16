const express     = require('express');
const router      = express.Router();


const Item = require('../models/Item');

// @route   GET /items/index
// @desc    Get all items
router.get('/items/index', (req, res) => {
    const errors = {};
  
        //get items
      Item.find()
      .then(items => {
        console.log('items is: ',items);
        if (!items) {
          errors.noitem = 'There are no items';
          res.render('items/index',{items:[],errors});
          return false;
        }
          //res.json(items);
          res.render('items/index',{items,errors});
          return false;
  
      })
      .catch(err => {
        errors.err = err;
        res.status(404);
         console.log(errors, res.statusCode);
        res.render('errorsPage',{errors});
        return false;
      });//end get items
  
        
      
  
  
  });


 
  

  module.exports = router;