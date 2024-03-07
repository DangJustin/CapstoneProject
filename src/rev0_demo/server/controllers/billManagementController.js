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

exports.deleteExpense = async (req, res) => {
  try {
    const { billId } = req.params;
    // Call the service function to delete the expense
    const deleteResult = await billManagementService.deleteExpense(billId);

    // Check if there was an error during deletion
    if (deleteResult.error) {
      // If there was an error, return a 404 response
      return res.status(404).json({ error: deleteResult.error });
    }

    // If deletion was successful, return a 200 response with a success message
    res.status(200).json({ message: deleteResult.message });
  } catch (error) {
    // If there was an internal server error, return a 500 response
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { userId } = req.params;
    // Call the service function to retrieve the expenses
    const result = await billManagementService.getExpenses(userId);

    // Check if there was an error during retrieval
    if (result.error) {
      // If there was an error, return a 404 response
      return res.status(404).json({ error: result.error });
    }

    // If retrieval was successful, return a 200 response with the bills
    res.status(200).json(result.bills);
  } catch (error) {
    // If there was an internal server error, return a 500 response
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
