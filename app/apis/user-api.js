var User = require('../models/user');
var userService = require('../services/user-service');
var router = new require('express').Router();
var auth = require('../services/auth-service');

/**
 * Initialize the API creating a 'Manager' user 
 */
router.get('/init', /*auth.isDev, */ function (req, res) {
    var user = new User({
        username: "fvarrui",
        password: "1234",
        role: "Manager"
    });
    userService.addUser(user, function (err) {
        if (err) {
            res.status(500).json(err);
        } else {
            user.password = undefined;
            res.json(user);
        }
    });
});

/**
 * Log in (unauthorized access)
 */
router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    userService.login(username, password, function (err, token) {
        if (err) res.status(500).json(err);
        else if (token) res.json({ success: true, message: "Login successfully", token: token });
        else res.json({ success: false, message: "Invalid credentials" });
    });
});

/**
 * Get all users
 */
router.get('/', auth.isAllowed(["Manager"]), function (req, res) {
    userService.getAllUsers(function (err, users) {
        if (err) res.status(500).json(err);
        else res.json(users);
    });
});

/**
 * Add a new user
 */
router.post('/', auth.isAllowed(["Manager"]), function (req, res) {
    var user = new User(req.body);
    userService.addUser(user, function (err) {
        if (err) {
            res.status(500).json(err);
        } else {
            user.password = undefined;
            res.json(user);
        }
    });
});

/**
 * Get user by username
 */
router.get('/:username', auth.isAllowed(['Manager', 'Employee']), auth.isOwnUser, function (req, res) {
    var username = req.params.username;
    userService.findUserByUsername(username, function (err, user) {
        if (err) res.status(500).json(err);
        else if (user) {
            user.password = undefined;
            res.json(user);
        } else
            res.status(404).json({ message: "User not found" });
    });
});

/**
 * Update a user
 */
router.put('/:username', auth.isAllowed(['Manager', 'Employee']), auth.isOwnUser, function (req, res) {
    var username = req.params.username;
    var data = {};
    if (req.body.realname) data.realname = req.body.realname;
    if (req.body.password) data.password = req.body.password;
    if (req.body.email) data.email = req.body.email;
    if (req.body.role) data.role = req.body.role;
    userService.updateUser(username, data, function (err, user) {
        if (err) res.status(500).json(err);
        else if (user) {
            user.password = undefined;
            res.json(user);
        } else
            res.status(404).send({ message: "User not found" });
    });
});

/**
 * Remove a user
 */
router.delete('/:username', auth.isAllowed(['Manager', 'Employee']), auth.isOwnUser, function (req, res) {
    var username = req.params.username;
    userService.removeUser(username, function (err, user) {
        if (err) res.status(500).json(err);
        else if (user) res.json({ message: "User successfully removed" });
        else res.status(404).send({ message: "User not found" });
    });
});

module.exports = router;