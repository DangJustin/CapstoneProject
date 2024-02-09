import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import EditBill from "./EditBill";
import Layout from "../Layout";

const auth = getAuth();

function ViewBill() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [editBill, setEditBill] = useState(null);

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

  const handleEditBill = (billId) => {
    const billToEdit = bills.find((bill) => bill._id === billId);
    setEditBill(billToEdit);
  };

  const handleDeleteBill = async (billId) => {
    try {
      // Send a DELETE request to delete the bill
      await axios.delete(`http://localhost:5000/api/database/bills/${billId}`);

      // Remove the deleted bill from the bills array
      const updatedBills = bills.filter((bill) => bill._id !== billId);
      setBills(updatedBills);
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const handleSaveBill = (updatedBill) => {
    // Update the bill in the bills array
    const updatedBills = bills.map((bill) =>
      bill._id === updatedBill._id ? updatedBill : bill
    );
    setBills(updatedBills);
    setEditBill(null); // Clear the editBill state
  };

  return (
    <Layout>
      <div>
        {editBill ? (
          <EditBill bill={editBill} onSave={handleSaveBill} />
        ) : (
          <>
            <h1>View Expenses</h1>
            <h2>Bills</h2>
            <table className="bill-table" border="1">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Payer</th>
                  <th>Participants</th>
                  <th>Group</th>
                  <th>Action</th>
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
                    <td>{bill.group ? bill.group.groupName : "None"}</td>
                    <td>
                      <button onClick={() => handleEditBill(bill._id)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteBill(bill._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ViewBill;
