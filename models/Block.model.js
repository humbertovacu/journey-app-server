const { Schema, model } = require("mongoose");

const blockSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
    },

    steps: {
      type: [{ type : Schema.Types.ObjectId, ref: 'Journey' }],
    },

    category: {
      type: String,
      required: true,
    },

    importance:{
        type: String,
        required: true,
        enum:["Recommended", "Critical", "Optional"]
    },
  }, 
  {
    timestamps: true,
  }
);

const Block = model("Block", blockSchema);

module.exports = Block;