import React from 'react';
import { useNavigate } from 'react-router-dom';

function BillManagement() {
  const navigate = useNavigate();
  const goToAddExpense = () => {
    navigate('addExpense');
  };
  const goToViewExpenses = () => {
    navigate('viewExpenses');
  };
  return (
    <div>
      <h1>Bill Management Page</h1>
      <button onClick={goToAddExpense}>Add Expense</button>
      <br />
      <button onClick={goToViewExpenses}>View Expense</button>
    </div>
  );
}

export default BillManagement;
