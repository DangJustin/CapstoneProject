// controllers/billController.js
const billManagementService = require('../services/billManagementService');

exports.index = async (req, res, next) => {
  console.log("Bill Management");
  res.status(200).send("This is the index for the bill Management module");
}

exports.splitExpense = async (req, res) => {
  try {
    // Call the service method
    await billManagementService.splitExpense(req.body);

    res.status(200).json({ message: 'Expense split successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
