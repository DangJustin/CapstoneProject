import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Layout from "../Layout";

const auth = getAuth();

function BillManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [debts, setDebts] = useState([]);
  const [userAmount, setUserAmount] = useState(0);
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [updatedUserAmount, setUpdatedUserAmount] = useState(userAmount);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => { 
    const fetchDebts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/database/userDebts/${currentUser.uid}`
        );
        setDebts(response.data.netDebts);
        setUserAmount(response.data.userAmount);
        setUpdatedUserAmount(response.data.userAmount);
      } catch (error) {
        console.error("Error fetching debts:", error);
      }
    };
    if (currentUser) {
      fetchDebts();
    }
  }, [currentUser]);

  const goToAddExpense = () => {
    navigate("addExpense");
  };

  const goToViewExpenses = () => {
    navigate("viewExpenses");
  };

  const handleSettleExpense = async () => {
    try {
    
      if (settlingDebt && settlementAmount) {
        const updatedDebts = { ...debts };
        updatedDebts[settlingDebt] -= settlementAmount;
        setDebts(updatedDebts);
        setUpdatedUserAmount(updatedUserAmount - settlementAmount);
        setSettlingDebt(null);
        setSettlementAmount(0);
      }
      const updatedDebt = {
        userId: currentUser.userId,
        amount: updatedUserAmount, 
      };

      await axios.put(`http://localhost:5000/api/database/updateUserAmount/${currentUser.uid}`,
      updatedDebt);

      } catch (error) {
        console.error("Error settling expense:", error);
      }

  };

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center pt-3">Bill Management Page</h1>
        <hr></hr>
        <button className="btn btn-primary mt-3" onClick={goToAddExpense}>Add Expense</button>
        <button className="btn btn-secondary mt-3 mx-3" onClick={goToViewExpenses}>View Expense</button>

        <h1 className="mt-3">
          {updatedUserAmount < 0 ? `Overall, you owe $${updatedUserAmount.toFixed(2)}` : `Overall, you are owed $${updatedUserAmount.toFixed(2)}`}
        </h1>
        <h2>Interpersonal Debt Relations:</h2>
        <ul className="list-group">
          {Object.entries(debts).map(([user, amount]) => (
            <li key={user} className="list-group-item d-flex justify-content-between align-items-center">
              {amount < 0
                ? `You owe user ${user} $${Math.abs(amount).toFixed(2)}`
                : `User ${user} owes you $${Math.abs(amount).toFixed(2)}`}
              <button className="btn btn-outline-danger" onClick={() => setSettlingDebt(user)}>Settle</button>
            </li>
          ))}
        </ul>

        {/* Input for settlement amount */}
        {settlingDebt && (
          <div className="mt-3">
            <input
              type="number"
              value={settlementAmount}
              onChange={(e) => setSettlementAmount(parseFloat(e.target.value))}
              className="form-control"
            />
            <button className="btn btn-success mt-2" onClick={handleSettleExpense}>Settle Expense</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
export default BillManagement;
