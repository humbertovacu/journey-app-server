const { Schema, model } = require("mongoose");

const journeySchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    blocks: [{ type : Schema.Types.ObjectId, ref: 'Block' }],

    author: { 
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
     },

    usersCopying: [{ type : Schema.Types.ObjectId, ref: 'User'}],
    
    tags: {
        type: [String]
    },
    
    image: {
      type: String,
    },

    upvoteUsers: [{ type : Schema.Types.ObjectId, ref: 'User' }],

    isPublic: {
        type: Boolean,
        default: false
    }
  }, 
  {
    timestamps: true,
  }
);

const Journey = model("Journey", journeySchema);

module.exports = Journey;