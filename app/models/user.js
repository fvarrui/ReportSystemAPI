var mongoose        = require('mongoose');
var passwordHash    = require('password-hash');
var jwt             = require('jsonwebtoken');
var config          = require('../../config/index');

var userSchema = mongoose.Schema({
    username:   { type: String, required: true, unique: true },
    realname:   { type: String },
    password:   { type: String, default:'' },
    email:      { type: String },
    role:       { type: String, enum: ['Employee', 'Manager'], required: true }
});

userSchema.methods.validPassword = function(password) {
    console.log('checking password ' + password + ' with ' + this.password);
    return passwordHash.verify(password, this.password);
}

userSchema.methods.generateToken = function() {
    var data = {
        username:   this.username,
        role:       this.role
    }
    var token = jwt.sign(data, config.auth.token.secret, {
        expiresIn: config.auth.token.expiresIn
    });
    return token;
}

module.exports = mongoose.model('users', userSchema);