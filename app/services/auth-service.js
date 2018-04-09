var jwt = require('jsonwebtoken');
var config = require('../../config/index');

exports.MANAGER   = 'Manager';
exports.EMPLOYEE  = 'Employee';
exports.ALL       = [exports.MANAGER,exports.EMPLOYEE];

function checkRole (req, res, neededRoles) {
    if (neededRoles.indexOf(req.decodedToken.role) != -1) {
        return true;
    } else {
        res.status(403).json({ message: 'Insufficient privileges (required roles: ' + neededRoles + ')' });
        return false;
    }
}

function verifyToken (req, res) {
    console.log('verifying token');
    // check if the token was sent (body, query and/or headers)
    var token = req.body.token || req.query.token || req.headers['auth-token'];
    if (token) {
        try {
            // decode the token to check if it's valid and store decoded data into the request
            req.decodedToken = jwt.verify(token, config.auth.token.secret);; 
            return true;
        } catch (err) {
            res.status(403).json({ success: false, message: 'Failed to authenticate token', description: err.message });
        }
    } else {
        // if there is no token return an error
        res.status(403).json({ success: false, message: 'No token provided' });
    }
    return false;
};

exports.isOwnUser = function (req, res, next) {
    var username = req.params.username;
    // check if the user is the owner of the resource or is an admin (has rootRole)
    if (username !== req.decodedToken.username && config.auth.rootRole !== req.decodedToken.role) {
        res.status(403).json({ message: 'Insufficient privileges. You can only access to your own resources' });
    } else {
        next();
    }
}

exports.isDev = function (req, res, next) {
    if (!process.env.NODE_ENV) next();
    else res.status(403).json({ success: false, message: 'Resource ' + req.path + ' not available in production mode' });
}

exports.isAllowed = function (roles) {
    return function(req, res, next) { 
        console.log('Allowed roles: ' + roles);
        if (verifyToken(req, res) && checkRole(req, res, roles)) {
            next();
        }
    };
}