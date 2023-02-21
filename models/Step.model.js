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
      type: [Object],
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
        enum:["Recommended", "Critical", "Optional"]
    },

    notes: {
        type: [String],
        required: false
    },

    image: {
      type: String,
      required: false,
      default: 'https://res.cloudinary.com/djwmauhbh/image/upload/v1677010979/journey-app-assets/pexels-caio-46274_sxtpog.jpg'
    }
  }, 
  {
    timestamps: true,
  }
);

const Step = model("Step", stepSchema);

module.exports = Step;