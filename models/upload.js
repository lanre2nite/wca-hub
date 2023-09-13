const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    date_created: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    file: {
        type: String,
        required: true
    },

    remark: {
        type: String,
        required: true
    }
}, {timestamps: true });

const Upload = mongoose.model('Upload', uploadSchema);
module.exports = Upload;