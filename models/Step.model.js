const { Schema, model } = require("mongoose");

const stepSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    description: {
      type: String,
      required: true
    },

    links: {
      type: [String],
      required: true
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"]
    },
    importance:{
        type: String,
        required: true,
        enum:["Recommended", "Critical", "Optional - Bonus knowledge"]
    },

    notes: {
        type: [String],
        required: false
    },

    image: {
      type: String,
      required: false
    }
  }, 
  {
    timestamps: true,
  }
);

const Step = model("Step", stepSchema);

module.exports = Step;