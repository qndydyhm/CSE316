const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommunityListSchema = new Schema(
    {
        name: { type: String, required: true },
        items: { type: [[String, Number]], required: true },
        likes: { type: [String], require: true},
        dislikes: { type: [String], require: true},
        views: { type: Number, require: true},
        comments: { type: [[String, String]], required: false},
        publishedAt: { type: [Number, Number, Number], require: true }
    },
    { timestamps: true },
)

module.exports = mongoose.model('CommunityList', CommunityListSchema)
