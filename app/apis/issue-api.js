var Issue = require('../models/issue');
var issueService = require('../services/issue-service');
var userService = require('../services/user-service');
var router = new require('express').Router();
var auth = require('../services/auth-service');

function assertIssue(req, res, issue, username, role, err) {

    // check if it was an internal error
    if (err) {
        res.status(500).json(err);
        return false;
    }

    // check if the issue exists
    if (!issue) {
        res.status(404).json({ message: "Issue not found" });
        return false;
    }

    // if user is not manager, and issue is not assigned or is assigned to other user, accesss forbidden
    if (role !== auth.MANAGER && (!issue.assignedTo || issue.assignedTo.username !== username)) {
        res.status(403).json({ message: "Issue not assigned to " + username });
        return false;
    }

    return true;
}

/**
 * @api {get} /issue Request all issues information
 * @apiName GetIssues
 * @apiGroup Issues
 *
 * @apiParam {Number} number Issue unique ID
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/', auth.isAllowed(auth.ALL), function (req, res) {
    const username = req.decodedToken.username;
    const role = req.decodedToken.role;
    if (role === auth.MANAGER)
        issueService.getAllIssues(function (err, issues) {
            if (err) res.status(500).json(err);
            else res.json(issues);
        });
    else 
        issueService.getAssignedIssues(username, function (err, issues) {
            if (err) res.status(500).json(err);
            else res.json(issues);
        });
});

/**
 * @api {get} /search/:search Search issues for some fields
 * @apiName SearchIssues
 * @apiGroup Issues
 * 
 * @apiParam {String} search Search string
 */
router.get('/search/:search', auth.isAllowed(auth.ALL), function (req, res) {
    var search = req.params.search;
    const username = req.decodedToken.username;
    const role = req.decodedToken.role;    
    if (role === auth.MANAGER)
        issueService.searchIssues(search, null, function (err, issues) {
            if (err) res.status(500).json(err);
            else res.json(issues);
        });
    else
        userService.findObjectIdOfUsername(username, function(err, userId) {
            if (err) res.status(500).json(err);
            else
                issueService.searchIssues(search, userId, function (err, issues) {
                    if (err) res.status(500).json(err);
                    else res.json(issues);
                });
        });
});

/**
 * Add a new issue
 */
router.post('/', auth.isAllowed(auth.MANAGER), function (req, res) {
    var issue = new Issue(req.body);
    var username = req.decodedToken.username;
    issueService.addIssue(username, issue, function (err, createdIssue) { 
        if (err) res.status(500).json(err);
        else res.json(createdIssue);
    });
});

/**
 * Gets issue by number
 */
router.get('/:number', auth.isAllowed(auth.ALL), function (req, res) {
    const number = req.params.number;
    const username = req.decodedToken.username;
    const role = req.decodedToken.role;

    issueService.findIssueByNumber(number, function (err, issue) {
        if (!assertIssue(req, res, issue, username, role, err)) return;
        res.json(issue);
    });
});

/**
 * Updates an issue
 */
router.put('/:number', auth.isAllowed(auth.ALL), function (req, res) {
    const number = req.params.number;
    const username = req.decodedToken.username;
    const role = req.decodedToken.role;
    
    issueService.findIssueByNumber(number, function (err, issue) {

        if (!assertIssue(req, res, issue, username, role, err)) return;

        // if not is manager, delete non modifiable attributes for other roles
        if (role !== auth.MANAGER) {
            if (req.body.assignedTo) delete req.body.assignedTo;
            if (req.body.assignationDate) delete req.body.assignationDate;
        }

        // update the issue
        issueService.updateIssue(number, req.body, function (err, updatedIssue) {
            if (err) res.status(500).json(err);
            else res.json(updatedIssue);
        });

    });


});

/**
 * Remove an issue
 */
router.delete('/:number', auth.isAllowed(auth.MANAGER), auth.isOwnUser, function (req, res) {
    const number = req.params.number;
    const username = req.decodedToken.username;
    const role = req.decodedToken.role;

    issueService.removeIssue(number, function (err, removedIssue) {
        if (err) res.status(500).json(err);
        else if (removedIssue) res.json({ message: "Issue successfully removed" });
        else res.status(404).json({ message: "Issue not found" });
    });

});

module.exports = router;