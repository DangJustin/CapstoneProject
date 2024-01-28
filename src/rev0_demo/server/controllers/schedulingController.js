exports.index = async (req, res, next) => {
    console.log("Scheduling");
    res.status(200).send("This is the index for the scheduling module");
  }