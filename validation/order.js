const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateOrderInput(data) {
  let errors = {};

  data.currency = !isEmpty(data.currency) ? data.currency : '';

    // checks if value contains any invalid character
    if(/[^A-Z]/.test(data.currency)) {
      errors.text = 'No special characters or numbers allowed (capital letters only) !';
    }

  if (!validator.isLength(data.currency, { min: 3, max: 3 })) {
    errors.text = 'currency must be 3 characters only';
  }


  if (validator.isEmpty(data.currency)) {
    errors.text = 'Currency field is required';
  }

  

 //start validate items
 let myObjItems = JSON.parse(data.items);
  
 for(let i=0;i<myObjItems.length;i++){
    //myObjOrder[0].item
    myObjItems[i].tPrice = !isEmpty(myObjItems[i].tPrice) ? myObjItems[i].tPrice : '';
    myObjItems[i].qty = !isEmpty(myObjItems[i].qty) ? myObjItems[i].qty : '';
    if (myObjItems[i].tPrice < 1 || myObjItems[i].tPrice > 999999999999999) {
        errors.text = 'Total price range between 1 and 999999999999999';
        
      }

      if (validator.isEmpty(myObjItems[i].tPrice.toString())) {
        errors.text = 'Total Price field is required';
        
      }

      if (!validator.isDecimal(myObjItems[i].tPrice.toString())) {
        errors.text = 'Total price not a valid number';
        
      }

      if (myObjItems[i].qty < 1 || myObjItems[i].qty > 99) {
        errors.text = 'Quantity range between 1 and 99';
        
      }

      if (validator.isEmpty(myObjItems[i].qty.toString())) {
        errors.text = 'Quantity field is required';
       
      }

      if (!validator.isDecimal(myObjItems[i].qty.toString())) {
        errors.text = 'Quantity not a valid number';
        
      }

 }
  
  

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
