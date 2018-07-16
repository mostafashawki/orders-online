const express = require('express');
const router = express.Router();

// Load Input Validation
const validateCustomerInput = require('../validation/customer');

//Load Customer model
const Customer = require('../models/Customer');


// @route   GET /customers
// @desc    Get all customers
router.get('/customers/index', (req, res) => {
  const errors = {};

  Customer.find()
    .then(customers => {
      if (!customers) {
        errors.nocustomer = 'There are no customers';
        res.render('customers/index',{customers:[],errors});

      }
        //res.json(customers);
        console.log(customers);
        res.render('customers/index',{errors,customers});

    })
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(errors, res.statusCode);
      res.render('customers/index',{customers:[],errors});
    });
});

// @route   GET /customers/create
// @desc    get Create customer page
router.get(
  '/customers/create',
  (req,res) => {
    res.render('customers/create',{errors:{}});

  }
);
// @route   POST /customer
// @desc    Create customer
  router.post(
    '/customers/create',
    (req, res) => {
      const { errors, isValid } = validateCustomerInput(req.body);
  
      // Check Validation
      if (!isValid) {
        res.status(400);
        console.log(errors, errors.statusCode);
        res.render('customers/create',{errors});
        return false;
      }
    
      // Get fields
      const Newcustomer = new Customer({
        email: req.body.email,
        name: req.body.name,
        address: req.body.address,
        currency: req.body.currency
      });

   
      Customer.findOne({ email: req.body.email }).then(customer => {
        if (customer) {
          errors.exist = 'Email Already Exist!';
          res.status(400);
          console.log(errors, errors.statusCode);
          res.render('customers/create',{errors});
          return false;
        } 
        else {
          // Create
          Newcustomer
            .save()
            .then((customer) => {
              //res.json(customer);
              res.redirect('/customers/index');
            })
            .catch(err => {
              errors.err = err;
              res.status(404);
               console.log(errors, res.statusCode);
              res.render('errorsPage',{errors});
      
            });
          
        }
      });
    }
  );


// @route   GET ظcustomers/update/:urlId'
// @desc    Get customer to edit
router.get(
  '/customers/update/:urlId',
    (req, res) => {
    const errors = {};

    Customer.findOne({ urlId: req.params.urlId })
      .then(customer => {
        if (!customer) {
          errors.nocustomer = 'There are no customer';
          res.render('customers/update',{customer:[],errors});
          return false;
        }
          
          res.render('customers/update',{customer,errors});

  
      })
      .catch(err => {
        errors.err = err;
        res.status(404);
         console.log(errors, res.statusCode);
        res.render('errorsPage',{errors});

      });
  });
  


// @route   POST /customers/update
// @desc    Update customer
router.post(
  '/customers/update',
  (req, res) => {
    
    // // Get fields
    const customerEdited = {};
    customerEdited.name = req.body.name;
    customerEdited.address = req.body.address;
    //console.log('edit is:', customerEdited);
    // Update
    Customer.findOneAndUpdate(
      { email: req.body.email },
      { $set: customerEdited }
      
    ).then(() => res.redirect('/customers/index'))
    .catch(err => {
      errors.err = err;
      res.status(404);
       console.log(errors, res.statusCode);
      res.render('errorsPage',{errors});
    });

  }
);



// @route   DELETE /customer-delete
// @desc    Delete customer

router.post(
  '/customer-delete',
  (req, res) => {
    let errors = {};
    let cId = '';
    console.log('the id is',req.body.urlId);
    Customer.findOne({urlId: req.body.urlId}).then(customer =>{
      if(customer){
          console.log('the user is', customer.id);
          cId = customer.id;
        //check orders for this user first
            Order.findOne({customer: cId})
            .then(order => {
              if(order){
                  errors.cannotdelete = 'Cannot delete, this customer already has order(s).';
                  res.render('errorsPage',{errors});
                  return false;
              }
              else{
                Customer.findOneAndRemove({ _id: cId }).then(() => {             
                  //res.json({ success: true });
                  res.redirect('/customers/index');
                
                  });
              }
            })
            .catch(err => {
              errors.err = err;
              res.status(404);
               console.log(errors, res.statusCode);
              res.render('errorsPage',{errors});

            });
            


      }//end if user

    })//end customer find

    
});




module.exports = router;
