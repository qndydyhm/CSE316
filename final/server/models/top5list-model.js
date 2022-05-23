const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Top5ListSchema = new Schema(
    {
        name: { type: String, required: true },
        items: { type: [String], required: true },
        owner: { type: String, require: true },
        likes: { type: [String], require: true},
        dislikes: { type: [String], require: true},
        views: { type: Number, require: true},
        comments: { type: [[String, String]], required: false},
        published: { type: Boolean, required: true},
        publishedAt: { type: [Number,Number,Number], require: false }
    },
    { timestamps: true },
)

module.exports = mongoose.model('Top5List', Top5ListSchema)
