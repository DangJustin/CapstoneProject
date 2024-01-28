exports.index = async (req, res, next) => {
    console.log("Bill Management");
    res.status(200).send("This is the index for the bill Management module");
  }