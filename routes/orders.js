const express     = require('express');
const router      = express.Router();

// Load Input Validation
const validateOrderInput = require('../validation/order');

//Load needed models
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Item = require('../models/Item');

//import getCurrencyRate function
const getCurrencyRate = require('../js/getCurrencyRate');



// @route   GET /orders/index
// @desc    Get all orders
router.get('/orders/index', 
(req, res) => {
    
  const errors = {};

    //get items
    Order.find()
    .populate('customer')
    .populate('items.item')
    .then(orders => {
      if (!orders) {
        errors.noitem = 'There are no items';
        res.render('orders/index',{errors});
        return false;
      }
      else{
        //res.json(orders);
        //console.log(orders);
        res.render('orders/index',{orders,errors});  
      }
        
    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(errors, res.statusCode);
      res.render('orders/index',{errors});
    });


});

// @route   GET /orders/customer/:urlId
// @desc    Get all orders for one customer, and total money spent
router.get('/orders/customer/:urlId', 
(req, res) => {
  const errors = {};
  let name = '';
  let currency = '';

    Customer.findOne({urlId: req.params.urlId})
    .then(customer =>{
      if(customer){
        name = customer.name;
        currency = customer.currency;
        //get items
        Order.find({customer: customer.id})
        .populate('customer') 
        .populate('items.item')
        .then(orders => {
          if (!orders) {
            errors.noitem = 'There are no items';
            res.render('./orders/customer',{errors});
            return false;
          }
          else{
            //res.json(orders);
            let items = orders.items;            
            res.render('orders/customer',{items,orders,name,currency,errors});
          }
            

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(err, res.statusCode);
      res.render('orders/customer',{errors});
    });//end order find
      }

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(err, res.statusCode);
      res.render('orders/customer',{errors});
    });//end customer find


});



// @route   GET /orders/customer-spent
// @desc    Get the amount of money paid by a customer
router.get('/orders/customer-spent', 
(req, res) => {
  const errors ={};
  Order.aggregate([
    {
      "$lookup": {
          "from": "customers",
          "localField": "customer",
          "foreignField": "_id",
          "as": "customerFields"
      }
  },
  {$unwind: '$items' },
  {$unwind: '$customerFields' },
    
     //we can put currency as: "customerFields.currency" (users collection) (if you will close any future editing for user currency (as we do))
     //if you give the user the ability to change its currency so you can put currency as "currency" (from orders collection)
    {$group: { _id: { cId : "$customer" , name: "$customerFields.name", currency: "$customerFields.currency" },
              total:{$sum:"$items.tPrice"}
             },         
    },
    
    {
      $sort: { total: -1 }
     }
  
  ])
  .then(orders => {
    if (!orders) {
      errors.noitem = 'There are no items';
      res.render('orders/customer-spent',{orders:[],errors});
      return false;
    }
      //console.log('ORDER IS: ',orders);    
      res.render('./orders/customer-spent',{orders,errors});        
    })
        
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(err, res.statusCode);
      res.render('orders/customer-spent',{orders:[],errors});
    });


});



// @route   GET /orders/items-ordered
// @desc    Get item names and how many times they have been ordered
router.get('/orders/items-ordered', 
  (req, res) => {
  const errors = {};
    //get items
    Order.aggregate([
      {
        "$lookup": {
            "from": "items",
            "localField": "items.item",
            "foreignField": "_id",
            "as": "itemFields"
        }
    },
    {$unwind: '$itemFields' },
      
       
      {$group: { _id: { id : "$itemFields.urlId" , name: "$itemFields.name" },
                        count: { $sum: 1 }
               },         
      }
      ,
      {
        $sort: { count: -1 }        
       }
    
    ])
    .then(items=>{
        //res.json(items);
        //console.log('ORDER IS: ',items);

        //sort by name if items with the same amount of occurrences
        items = items.sort((a, b) => {
         
          if(a.count === b.count)
            return a._id.name > b._id.name;       
        });
       //console.log('sorted array: ',items); 
        
        res.render('orders/items-ordered',{items,errors});
    })
        
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(err, res.statusCode);
      res.render('orders/items-ordered',{items:[],errors});
    });


});


// @route   GET /orders/details/:urlId
// @desc    Get one order with its details
router.get('/orders/details/:urlId', 
  (req, res) => {
    const errors = {};
    //get items
    Order.find({urlId: req.params.urlId})
    .populate('customer') 
    .populate('items.item')
    .then(order => {
      if (!order) {
        errors.noitem = 'There are no items';
        res.render('orders/details',{errors});
        return false;
      }
        //res.json(order);
        let items = order[0].items;
        res.render('orders/details',{items,order,errors});

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(err, res.statusCode);
      res.render('orders/details',{errors});
    });


});

// @route   POST /orders/update
// @desc    update order
router.post(
  '/orders/update',
  (req, res) => {
    const { errors, isValid } = validateOrderInput(req.body);

    //Check Validation
    if (!isValid) {
      res.status(400);
      console.log(errors, errors.statusCode);
      res.render('errorsPage',{errors});
      return false;
    }
   //=====================save updated order
   let myObj = JSON.parse(req.body.items);

   let UpdatedItems ={};
   UpdatedItems = myObj;
   //console.log('new Order is: ',UpdatedItems)

      // Update
      Order.findOneAndUpdate(
        { urlId: req.body.urlId },
        { $set: {items: UpdatedItems}  },
        { new: true }
      ).then(order =>{
        //res.json(order);
        res.redirect('/orders/index')
      })
      .catch(err => {
        errors.err = err;
        res.status(404);
         console.log(err, res.statusCode);
        res.redirect('errorsPage',{errors});
      });
   
   //=====================end save edited order
        
    });
  


// @route   GET /orders/create/:urlId/:name/:currency
// @desc    Get create order page
router.get('/orders/create/:urlId/:name/:currency', (req, res) => {
    const errors = {};
  
    let urlId = req.params.urlId;
    let name = req.params.name;
    let currency = req.params.currency;

    //start to get our currency rate from European Central Bank API
    getCurrencyRate(currency, (rate) => {
      //console.log("callback called of rate is: " + rate);
      
      //get items
    Item.find()
    .then(items => {
      if (!items) {
        errors.noitem = 'There are no items';
        res.render('errorsPage',errors);
         return false;
      }
        //res.json(items);
        res.render('orders/create',{urlId,name,currency,rate,items,errors});

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(errors, res.statusCode);
      res.render('orders/create',{errors});
      return false;
    });//end get items

      
    });


});

// @route   POST /orders/create
// @desc    Create new order
  router.post(
    '/orders/create',
    (req, res) => {
       const { errors, isValid } = validateOrderInput(req.body);
  
      //Check Validation
      if (!isValid) {
        res.status(400);
        console.log(errors, errors.statusCode);
        res.render('errorsPage',{errors});
        return false;
      }
      let myObjItemsBeforeId = JSON.parse(req.body.items);
      
      //find and validate items urlId by calling findItemId function bellow
      findItemId(myObjItemsBeforeId, (myObjItems) => {
      //console.log('callback called!', myObjItems);
      if(myObjItems.length===0){
        errors.noitem = 'Invalid Item Id';
        res.render('errorsPage',{errors});
        return false;
      }
      Customer.findOne({ urlId: req.body.customer })
      .then(customer => {
      if (!customer) {
          errors.nocustomer = 'There are no customer';
          res.render('errorsPage',errors);
          return false;
      }
        customerId = customer._id;
       
        //=====================save order
        const newOrder ={};
        newOrder.customer = customer._id;
        newOrder.currency = req.body.currency;
        newOrder.items = myObjItems;
        
        //console.log('new Order is: ',newOrder)

        
          //Create
          new Order(newOrder)
            .save()
            .then((order) => {
              //res.json(order);
              res.redirect('/orders/index');
            })
            .catch(err => {
              errors.err = err;
              res.status(404);
               console.log(errors, res.statusCode);
              res.render('errorsPage',{errors});
              return false;
            });
        //=====================end save order

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(errors, res.statusCode);
      res.render('errorsPage',{errors});
      return false;
    });
    
      
  });//end findItemId
      

             
     
});

  
  const findItemId = (myObjItems, callback) =>{
   console.log(myObjItems);
   //myObjItems[1].item ='df';
   let selected = 0;
    for(let i = 0; i<myObjItems.length; i++){
      Item.findOne({urlId: myObjItems[i].item})
      .then(item =>{
        if(!item){
          myObjItems = [];
          callback(myObjItems);        
        }
        else{
          //replace urlId with id
          myObjItems[i].item = item._id;
          selected ++;
          //if all are finished, then send or callback
          if(selected == myObjItems.length){
            callback(myObjItems);
          }
        }
        
       
      })
      .catch((err) => {
        console.log('error callback',err);
        //redirect('errorPage');
      });//end find item
      
    }
    
  }


  


// @route   /order-delete
// @desc    Delete order
router.post(
  '/order-delete',
  (req, res) => {
    Order.findOneAndRemove({ urlId: req.body.urlId }).then(() => {
      res.redirect('/orders/index');
    });
  }
);



// @route   GET /orders/item/:urlId
// @desc    Get all customers that bought a certain item
router.get('/orders/item/:urlId', 
(req, res) => {
  let itemName = '';
  const errors = {};
  Item.findOne({urlId: req.params.urlId})
  .then(item => {
    if(!item){
      errors.noitem = 'There are no items';
      res.render('orders/item/',{errors,itemOrdered});
      return false;
    }

    itemName = item.name;
    //get items
  Order.find({'items.item': item._id })
  .populate('customer')
  .populate('items.item')
  .then(orders => {
    if (!orders) {
      console.log('orders is: ', orders)
      errors.noitem = 'There are no items';
      res.render('orders/item',{orders:[],errors});
      return false;
    }
      //res.json(orders);
      //console.log(orders);
      res.render('orders/item',{orders,itemName,errors});
  })
  .catch(err => {
    errors.err = err;
    res.status(404);
     console.log(errors, res.statusCode);
    res.render('orders/item',{orders:[],errors});
  });//end find orders

  })
  .catch(err => {
    errors.err = err;
    res.status(404);
     console.log(errors, res.statusCode);
    res.render('orders/item',{order:[],errors});
  });//end find item
  


});


// // @route   GET /orders/address/:address
// // @desc    Get all orders for a given address
router.get('/orders/address/:address', 
(req, res) => {
  let address = req.params.address;
  const errors = {};
  
    //get items
  Order.find()
  .populate({
    path: 'customer',
    match: { address:  req.params.address}    
  })
  .populate('items.item')
  .then(orders => {
    if (!orders) {  
      errors.noitem = 'There are no items';
      res.render('orders/address',{orders:[],address,errors});
      return false;
    }
      //res.json(orders);
      res.render('orders/address',{orders,address,errors});
  })
  .catch(err => {
    errors.err = err;
    res.status(404);
     console.log(errors, res.statusCode);
    res.render('orders/address',{orders:[],address,errors});
  });//end find orders

  
  


});




module.exports = router;
