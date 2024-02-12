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

  const handleSettleExpense = () => {
    // Perform the settlement action here
    if (settlingDebt && settlementAmount) {
      // Update debts and userAmount accordingly
      const updatedDebts = { ...debts };
      updatedDebts[settlingDebt] += settlementAmount;
      setDebts(updatedDebts);
      setUpdatedUserAmount(updatedUserAmount + settlementAmount);
      // Reset settlingDebt and settlementAmount
      setSettlingDebt(null);
      setSettlementAmount(0);
    }
  };

  return (
    <Layout>
      <div>
        <h1>Bill Management Page</h1>
        <button onClick={goToAddExpense}>Add Expense</button>
        <br />
        <button onClick={goToViewExpenses}>View Expense</button>

        <h1>
          {updatedUserAmount < 0 ? `Overall, you owe $${updatedUserAmount}` : `Overall, you are owed $${updatedUserAmount}`}
        </h1>
        <h2>Interpersonal Debt Relations:</h2>
        <ul>
          {Object.entries(debts).map(([user, amount]) => (
            <li key={user}>
              {amount < 0
                ? `You owe user ${user} $${Math.abs(amount)}`
                : `User ${user} owes you $${Math.abs(amount)}`}
              <button onClick={() => setSettlingDebt(user)}>Settle</button>
            </li>
          ))}
        </ul>

        {/* Input for settlement amount */}
        {settlingDebt && (
          <div>
            <input
              type="number"
              value={settlementAmount}
              onChange={(e) => setSettlementAmount(parseFloat(e.target.value))}
            />
            <button onClick={handleSettleExpense}>Settle Expense</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
export default BillManagement;
