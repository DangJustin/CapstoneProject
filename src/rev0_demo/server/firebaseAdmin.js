var admin = require("firebase-admin");

var serviceAccount = require("./housemates-59de1-firebase-adminsdk-kyqfq-8765b4a504.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin
