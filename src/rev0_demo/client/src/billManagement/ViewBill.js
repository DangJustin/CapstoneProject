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
          `http://localhost:5000/api/billManagement/user-bills/${currentUser.uid}`
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
      await axios.delete(
        `http://localhost:5000/api/billManagement/bills/${billId}`
      );

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
      <div className="container">
        {editBill ? (
          <EditBill bill={editBill} onSave={handleSaveBill} />
        ) : (
          <>
            <h1 className="text-center pb-3 pt-3">View Expenses</h1>
            <div className="row row-cols-1 row-cols-md-1 g-2">
              {" "}
              {/* Reduce the spacing between rows */}
              {bills.map((bill) => (
                <div className="col">
                  <div className="card">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h4 className="card-title">{bill.billName}</h4>
                        <p>{new Date(bill.date).toLocaleDateString()}</p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="card-text">
                          ${bill.totalAmount.toFixed(2)}
                        </p>
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${bill._id}`}
                          aria-expanded="false"
                          aria-controls={`collapse${bill._id}`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="collapse" id={`collapse${bill._id}`}>
                      <div className="card-body">
                        <p className="card-text">
                          Payer: {bill.users[0].user.username}
                        </p>
                        <p className="card-text">Expensed with:</p>
                        <ul>
                          {bill.users.slice(1).map((participant) => (
                            <li key={participant.user._id}>
                              {participant.user.username}: $
                              {participant.amountOwed.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <p className="card-text">
                          Group: {bill.group ? bill.group.groupName : "None"}
                        </p>
                        <div className="d-flex justify-content-end">
                          {" "}
                          {/* Adjusted position of buttons */}
                          <button
                            onClick={() => handleEditBill(bill._id)}
                            className="btn btn-primary me-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill._id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ViewBill;
