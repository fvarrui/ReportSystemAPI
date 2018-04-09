var User = require('../models/user');
var passwordHash = require('password-hash');
var config = require('../../config/index');

/**
 * Find a user by username
 * @param {String} username Username to find
 * @param {Function} callback Function executed after find the user (err, user)
 */
exports.findUserByUsername = function (username, callback) {
    console.log("findUserByUsername " + username);
    User
        .findOne({ username: username })
        .select({ "password" : 0 })
        .exec(callback);
};

/**
 * Find ObjectId of a user
 * @param {String} username Username of the user to find their ObjectId
 * @param {Function} callback Function executed after find the user (err, user)
 */
exports.findObjectIdOfUsername = function (username, callback) {
    console.log("findObjectIdOfUsername " + username);
    User
        .findOne({ username: username })
        .select({ "_id" : 1 })
        .exec(function (err, user) {
            if (err) callback(err, null);
            else callback(null, user._id);
        });
};

/**
 * Get all users
 * @param {Function} callback Function executed after find users (err, users)
 */
exports.getAllUsers = function (callback) {
    console.log("getAllUsers");
    User
        .find()
        .select({ "password": 0 })
        .exec(callback);
};

/**
 * Log in
 * @param {String} username Name of the user to log in
 * @param {String} username Plain password of the user to log in
 * @param {Function} callback Callback function executed after log in (err, token)
 */
exports.login = function (username, password, callback) {
    console.log("login " + username + "/" + password);
    User
        .findOne({ username: username })
        .exec((err, user) => {
            if (err) callback(err, null);
            if (user && user.validPassword(password)) {
                var token = user.generateToken();
                callback(null, token);
            }
            else callback(null, null);
        });
};

/**
 * Create a new user 
 * @param {Object} user User to create
 * @param {Function} callback Callback function executed after insertion
 */
exports.addUser = function (user, callback) {
    console.log("addUser " + user.username);
    user.password = passwordHash.generate(user.password);
    user.save(callback);
};

/**
 * Removes a user by username
 * @param {String} username Name of the user to be removed
 */
exports.removeUser = function (username, callback) {
    console.log("removeUser " + username);
    User
        .findOneAndRemove({ username: username })
        .exec(callback);
};

/**
 * Updates user data
 */
exports.updateUser = function (username, data, callback) {
    console.log("updateUser " + username);
    if (data.password) data.password = passwordHash.generate(data.password);
    User.findOneAndUpdate({ username: username },
        { $set: data },
        { new: true },  // true to return the modified document rather than the original. defaults to false
        callback
    );
};
