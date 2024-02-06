import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from "axios";

const auth = getAuth();

function ViewBill() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserBills = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/database/user-bills/${currentUser.uid}`
        );
        setBills(response.data);
      } catch (error) {
        console.error("Error fetching user bills:", error);
      }
    };

    if (currentUser) {
      fetchUserBills();
    }
  }, [currentUser]);

  return (
    <div>
      <h1>View Expenses</h1>
      <h2>Bills</h2>
      <table className="bill-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Payer</th>
            <th>Participants</th>
            <th>Group</th> {/* New column for group name */}
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill._id}>
              <td>{new Date(bill.date).toLocaleDateString()}</td>
              <td>${bill.totalAmount}</td>
              <td>{bill.users[0].user.username}</td>
              <td>
                <ul>
                  {bill.users.slice(1).map((participant) => (
                    <li key={participant.user._id}>
                      {participant.user.username}: ${participant.amountOwed}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{bill.group ? bill.group.groupName : 'None'}</td> {/* Show group name or 'None' if no group */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewBill;
