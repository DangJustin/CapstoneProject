import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const auth = getAuth();

function BillManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [debts, setDebts] = useState([]);
  const [userAmount, setUserAmount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch the interpersonal debt relations between users
    const fetchDebts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/database/userDebts/${currentUser.uid}`
        );
        setDebts(response.data.netDebts);
        setUserAmount(response.data.userAmount);
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

  return (
    <div>
      <h1>Bill Management Page</h1>
      <button onClick={goToAddExpense}>Add Expense</button>
      <br />
      <button onClick={goToViewExpenses}>View Expense</button>

      <h1>
        {userAmount < 0 ? `Overall, you owe $${userAmount}` : `Overall, you are owed $${userAmount}`}
      </h1>
      <h2>Interpersonal Debt Relations:</h2>
      <ul>
        {Object.entries(debts).map(([user, amount]) => (
          <li key={user}>
            {amount < 0
              ? `You owe user ${user} $${Math.abs(amount)}`
              : `User ${user} owes you $${Math.abs(amount)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default BillManagement;
