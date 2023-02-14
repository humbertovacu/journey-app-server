// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");
mongoose.set('strictQuery', false)

// ℹ️ Sets the MongoDB URI for our app to have access to it.
// If no env has been set, we dynamically set it to whatever the folder name was upon the creation of the app

const MONGO_URI =
'mongodb+srv://journeyApp:cnQsaxHe3dP7S6KG@cluster0.heehrgi.mongodb.net/' || "mongodb://127.0.0.1:27017/journey-app-server";

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    const dbName = 'journey-app-server';
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });
