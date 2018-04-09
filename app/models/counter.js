var mongoose = require('mongoose');

var counterSchema = mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

var counterModel = mongoose.model('counters', counterSchema);

counterModel.autoIncrement = function (document, idName, incValueName, next) {
    this.findByIdAndUpdate(
            { _id: idName },
            { $inc: { seq: 1 } },
            { upsert: true },       // creates the object if it doesn't exist. defaults to false.
            function (error, counter) {
                if (error) return next(error);
                console.log(counter);
                document[incValueName] = counter.seq;
                next();
            }
        );
};

module.exports = counterModel;