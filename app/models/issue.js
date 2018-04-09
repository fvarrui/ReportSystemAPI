var mongoose    = require('mongoose');
var Counter     = require('./counter')

const OPEN      = 'open';
const IN_REVIEW = 'in review';
const CLOSED    = 'closed';
const STATUSES  = [ OPEN, IN_REVIEW, CLOSED]

var issueSchema = mongoose.Schema({
    number:                 { type: Number, unique: true },
    title:                  { type: String, required: true },
    description:            { type: String },
    status:                 { type: String, enum: STATUSES, required: true, default: OPEN },
    reportedBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    reportedDate:           { type: Date, default: Date.now(), required: true },
    assignedTo:             { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    assignationDate:        { type: Date },
    lastModificationDate:   { type: Date, required: true, default: Date.now() },
    tags:                   [ String ]
    // comments: [{
    //     content:        { type: String },
    //     publisher:      { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    //     datePublished:  { type: Date } 
    // }]
});

issueSchema.pre('save', function (next) {
    return Counter.autoIncrement(this, "issueId", "number", next);
});

module.exports = mongoose.model('issues', issueSchema);