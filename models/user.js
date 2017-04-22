var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


var userSchema = new Schema({
    email   : {type: String,required: true},
    password: {type: String,required: true}
});

userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5));
}
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}


module.exports = mongoose.model('User',userSchema);