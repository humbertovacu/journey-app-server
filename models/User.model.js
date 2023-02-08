const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    surname: {
      type: String,
    },

    journeysCreated: {
      type: [{ type : Schema.Types.ObjectId, ref: 'Journey' }]
    },

    journeysCopied: {
      type: [{ type : Schema.Types.ObjectId, ref: 'Journey' }]
    },
    
    journeysCompleted: {
      type: [{ type : Schema.Types.ObjectId, ref: 'Journey' }]
    },

    profilePicture: {
      type: String,
      default: 'https://res.cloudinary.com/djwmauhbh/image/upload/v1675875047/journey-app-assets/default-profile-photo_u5nuvj.jpg'
    },

    biography: {
      type: String
    }
  }, 
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
