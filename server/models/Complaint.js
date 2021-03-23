const mongoose = require('mongoose');
const { userSchema } = require("./User");

const Schema = mongoose.Schema;

const complaintSchema = mongoose.Schema({
  checked : {
    type: Number,
    default: 0
  },
  title : {
    type: String,
    maxlength: 100
  },
  description : {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sceneId: {
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  },
  gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
  },
}, {timestamps: true})

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = { Complaint }