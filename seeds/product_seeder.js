var Product = require('../models/product')
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/shopping');
var products = [
    new Product({
        imagePath:'http://gapsecuritydirect.co.uk/wp-content/uploads/2011/09/motorbike_security.png',
        title: 'Honda CGV',
        description: 'Awesome Bike',
        price: '150'

    }),
    new Product({
        imagePath:'https://www.honda.com.au/content/dam/honda/cars/models/cr-v-2014/showroom/content-grid/crv-design-style.jpg',
        title: 'Honda CRV',
        description: 'Awesome Car, must have',
        price: '170000'

    }),
    new Product({
        imagePath:'http://gapsecuritydirect.co.uk/wp-content/uploads/2011/09/motorbike_security.png',
        title: 'Honda CGV2',
        description: 'Awesome Bike, must buy',
        price: '190'

    })
]

var done = 0;
for(var i = 0; i < products.length; i++){
    products[i].save((err,result) => {
        done++;
        if(done == products.length){
            exit();
        }
    });
}

function exit(){
    mongoose.disconnect();
}
