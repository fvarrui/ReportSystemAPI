var Issue = require('../models/issue');
var User = require('../models/user');
var userService = require('../services/user-service');
var config = require('../../config/index');
var moment = require('moment');

/**
 * Find a issue by number
 * @param {String} nunber ID number of the issue
 * @param {Function} callback Callback function executed to return finded issue (err, issue)
 */
exports.findIssueByNumber = function (number, callback) {
    console.log("findIssueByNumber number: " + number);
    Issue
        .findOne({ number: number })
        .populate('reportedBy', '-password')
        .populate('assignedTo', '-password')
        .exec(callback);
};

/**
 * Get all issues
 * @param {Function} callback Callback function executed to return finded issues
 */
exports.getAllIssues = function (callback) {
    console.log("getAllIssues");
    Issue
        .find()
        .sort('-reportedDate')
        .populate('reportedBy', '-password')
        .populate('assignedTo', '-password')
        .exec(callback);
};

/**
 * Get all issues
 * @param {Function} callback Callback function executed to return finded issues
 */
exports.getAssignedIssues = function (username, callback) {
    console.log("getAssignedIssues username:" + username);
    userService.findObjectIdOfUsername(username, function (err, userId) {
        Issue
            .find({assignedTo:userId})
            .sort('-reportedDate')
            .populate('reportedBy', '-password')
            .populate('assignedTo', '-password')
            .exec(callback);
    });
};

/**
 * Find issues by title, description
 * @param {String} search Search string
 * @param {Function} callback Callback function executed to return finded issues
 */
exports.searchIssues = function (search, userId, callback) {
    console.log("searchIssues search: " + search);
    var conditions = {};
    if (userId) conditions.assignedTo = userId;
    console.log(conditions);
    Issue
        .find(conditions)
        .sort('-reportedDate')
        .populate('reportedBy', '-password')
        .populate('assignedTo', '-password')
        .exec((err, issues) => {
            const filteredIssues = issues.filter((issue) => {     
                const searchString = [
                    issue.title, 
                    issue.description, 
                    moment(issue.reportedDate).format("YYYY-MM-DD"),    // reported date
                    moment(issue.reportedDate).format("hh:mm:ss"),      // reported time
                    moment(issue.assignationDate).format("YYYY-MM-DD"), // assignation date
                    moment(issue.assignationDate).format("hh:mm:ss"),   // assignation time
                    issue.reportedBy.realname,
                    issue.reportedBy.username,
                ].concat(issue.tags);
                const regex = new RegExp(search, 'i');
                return regex.test(searchString);
            });
            callback(err, filteredIssues);
        });
};

/**
 * Creates a new issue 
 * @param {String} reportedBy Username of the user who reported the issue
 * @param {Object} issue Issue to create
 * @param {Function} callback Callback function executed after insertion
 */
exports.addIssue = function (reportedBy, issue, callback) {
    console.log("addIssue title: " + issue.title + " reported by: " + reportedBy);
    userService.findUserByUsername(reportedBy, function (err, user) {
        if (err) callback(err, null)
        else if (user) {
            
            const now = Date.now();
            issue.reportedBy = user._id;
            issue.reportedDate = now;
            issue.lastModificationDate = now;
            if (issue.assignedTo) issue.assignationDate = now;

            // adjust specified data to avoid validation problems
            if (issue.status) issue.status = issue.status.toLowerCase();

            issue.save((err) => {
                if (err) callback(err, null);
                else {
                    User.populate(
                        issue, 
                        [{path:'reportedBy', select:'-password', model:'users'},
                        {path:'assignedTo', select:'-password', model:'users'}],
                        callback);
                }
            });

        } else 
            callback({ message : 'Invalid reporter username specified'}, null);
    });
};

/**
 * Removes an issue by number
 * @param {Number} number ID number of the issue
 * @param {Function} callback Callback function executed after deletion
 */
exports.removeIssue = function (number, callback) {
    console.log("removeIssue " + number);
    Issue.findOneAndRemove({ number: number }, callback);
};

/**
 * Updates issue data
 * @param {Number} number ID number of the issue to be updated
 * @param {Object} data Object with data to be upgraded
 * @param {Function} callback Callback function executed after deletion
 */
exports.updateIssue = function (number, data, callback) {
    console.log("updateIssue " + number);

    const now = Date.now();

    // delete non modifiable attributes from data
    if (data.number) delete data.number;
    if (data.reportedBy) delete data.reportedBy;
    if (data.reportedDate) delete data.reportedDate;
    if (data.assignationDate) delete data.assignationDate;
    if (data.assignedTo) data.assignationDate = Date.now();

    // adjust specified data to avoid validation problems
    if (data.status) data.status = data.status.toLowerCase();

    // update last modification date
    data.lastModificationDate = now;    

    Issue.findOneAndUpdate({ number: number },
        { $set: data },
        { 
            new: true,              // true to return the modified document rather than the original. defaults to false
            runValidators: true     // force the schema validation
        },  
        function (err, updatedIssue) {
            if (err) return callback(err, null);
            User.populate(
                updatedIssue, 
                [{path:'reportedBy', select:'-password', model:'users'},
                {path:'assignedTo', select:'-password', model:'users'}],
                callback);
        }
    );
};
