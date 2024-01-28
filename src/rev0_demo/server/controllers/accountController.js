exports.index = async (req, res, next) => {
    console.log("Account");
    res.status(200).send("This is the index for the account module");
  }