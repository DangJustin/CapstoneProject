import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Layout from "../Layout";
import AddBill from "./AddBill"; // Import AddBill component

const auth = getAuth();

function BillManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [debts, setDebts] = useState([]);
  const [userAmount, setUserAmount] = useState(0);
  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [updatedUserAmount, setUpdatedUserAmount] = useState(userAmount);
  const [showModal, setShowModal] = useState(false); // State variable for modal visibility
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [userInfo, setUserInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!currentUser) {
          return;
        }

        // Make a GET request to the route to grab current user info
        const response = await axios.get(
          `http://localhost:5000/api/database/user/${currentUser.uid}`
        );

        if (!response) {
          console.error("Failed to fetch user data");
          return;
        }

        setUserInfo(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    // Call the fetchUserInfo function
    fetchUserInfo();
  }, [currentUser]);

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/database/userDebts/${currentUser.uid}`
        );

        const newDebts = {};
        // Modify the loop to fetch usernames instead of emails
        for (const [email, amount] of Object.entries(response.data.netDebts)) {
          const userResponse = await axios.get(
            `http://localhost:5000/api/database/userEmail/${email}`
          );
          if (userResponse.data.username) {
            newDebts[userResponse.data.username] = amount;
          }
        }

        setDebts(newDebts);
        console.log(newDebts);
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
    setShowModal(true); // Show modal instead of navigating
  };

  const goToViewExpenses = () => {
    navigate("viewExpenses");
  };

  const handleSettle = async (user, amount) => {
    try {
      setSettlementAmount(amount);
      setSettlingDebt(user);
      setShowSettlementModal(true);
    } catch (error) {
      console.error("Error Settling", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  const handleSettleExpense = async () => {
    try {
      if (settlingDebt && settlementAmount) {
        const updatedDebts = { ...debts };
        if (updatedUserAmount >= 0) {
          updatedDebts[settlingDebt] -= settlementAmount;
        } else {
          updatedDebts[settlingDebt] += settlementAmount;
        }
        setDebts(updatedDebts);
        if (updatedUserAmount >= 0) {
          setUpdatedUserAmount(updatedUserAmount - settlementAmount);
        } else {
          setUpdatedUserAmount(updatedUserAmount + settlementAmount);
        }
      }
      const updatedDebt = {
        owedUserEmail: currentUser.email,
        settlementAmount: settlementAmount,
        owingUserEmail: settlingDebt,
      };
      setSettlingDebt(null);
      setShowSettlementModal(false);
      // setSettlementAmount(0);

      await axios.put(
        `http://localhost:5000/api/database/updateUserAmount/${currentUser.uid}`,
        updatedDebt
      );
    } catch (error) {
      console.error("Error settling expense:", error);
    }
  };

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center pt-3">Bill Management Page</h1>
        <hr></hr>

        <button
          className="btn btn-primary mt-3"
          data-bs-toggle="modal"
          data-bs-target="#addExpenseModal"
          onClick={goToAddExpense}
        >
          Add Expense
        </button>
        <button
          className="btn btn-secondary mt-3 mx-3"
          onClick={goToViewExpenses}
        >
          View Expense
        </button>
        {/* Bootstrap Modal for Add Expense */}
        <div
          className="modal fade"
          id="addExpenseModal"
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title exo-bold">Add Expense</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* Render the AddTask component */}
                <AddBill closeModal={closeModal} />
              </div>
            </div>
          </div>
        </div>
        <h1 className="mt-3">
          {updatedUserAmount < 0
            ? `Overall, you owe $${Math.abs(updatedUserAmount).toFixed(2)}`
            : `Overall, you are owed $${updatedUserAmount.toFixed(2)}`}
        </h1>
        <h2>Bill split summary:</h2>

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {Object.entries(debts)
            .filter(([user, amount]) => user !== currentUser.email)
            .map(([user, amount]) => (
              <div key={user} className="col">
                <div
                  className={`card ${
                    amount < 0 ? "bg-danger" : "bg-success"
                  } text-white`}
                >
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title">
                        {amount < 0
                          ? `You owe ${user}`
                          : `${user} owes you`}
                      </h5>
                      <p className="card-text">
                        {amount < 0
                          ? `$${Math.abs(amount).toFixed(2)}`
                          : `$${Math.abs(amount).toFixed(2)}`}
                      </p>
                    </div>
                    <button
                      className="btn btn-outline-light"
                      onClick={() => handleSettle(user, amount)}
                    >
                      Settle
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Modal for settlement amount */}
        {settlingDebt && showSettlementModal && (
          <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            style={{ display: "block" }}
          >
            <div className="modal-backdrop fade show"></div>
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              style={{ zIndex: 1050 }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Settle Expense</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setShowSettlementModal(false)}
                  >
                    {/* <span aria-hidden="true">&times;</span> */}
                  </button>
                </div>
                <div className="modal-body">
                  <input
                    type="number"
                    value={settlementAmount}
                    onChange={(e) =>
                      setSettlementAmount(parseFloat(e.target.value))
                    }
                    className="form-control"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSettlementModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSettleExpense}
                    disabled={settlementAmount > Math.abs(debts[settlingDebt])}
                  >
                    Settle Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

  // return (
  //   <Layout>
  //     <div className="container">
  //       <h1 className="text-center pt-3">Bill Management Page</h1>
  //       <hr></hr>
  //       <button className="btn btn-primary mt-3" onClick={goToAddExpense}>Add Expense</button>
  //       <button className="btn btn-secondary mt-3 mx-3" onClick={goToViewExpenses}>View Expense</button>

  //       <h1 className="mt-3">
  //         {updatedUserAmount < 0 ? `Overall, you owe $${updatedUserAmount.toFixed(2)}` : `Overall, you are owed $${updatedUserAmount.toFixed(2)}`}
  //       </h1>
  //       <h2>Interpersonal Debt Relations:</h2>

  //       <div className="row row-cols-1 row-cols-md-2 g-4">
  //         {Object.entries(debts).filter(([user, amount]) => user !== currentUser.email).map(([user, amount]) => (
  //           <div key={user} className="col">
  //             <div className={`card ${amount < 0 ? "bg-warning" : "bg-success"} text-white`}>
  //               <div className="card-body d-flex justify-content-between align-items-center">
  //                 <div>
  //                   <h5 className="card-title">
  //                     {amount < 0 ? `You owe user ${user}` : `User ${user} owes you`}
  //                   </h5>
  //                   <p className="card-text">
  //                     {amount < 0 ? `$${Math.abs(amount).toFixed(2)}` : `$${Math.abs(amount).toFixed(2)}`}
  //                   </p>
  //                 </div>
  //                 <button className="btn btn-outline-light" onClick={() => handleSettle(user, amount)}>Settle</button>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>

  //       {/* Input for settlement amount */}
  //       {settlingDebt && (
  //         <div className="mt-3">
  //           <input
  //             type="number"
  //             value={settlementAmount}
  //             onChange={(e) => setSettlementAmount(parseFloat(e.target.value))}
  //             className="form-control"
  //           />
  //           <button className="btn btn-success mt-2" onClick={handleSettleExpense} disabled={settlementAmount > Math.abs(debts[settlingDebt])}>Settle Expense</button>
  //         </div>
  //       )}
  //     </div>
  //   </Layout>
  // );

  // return (
  //   <Layout>
  //     <div className="container">
  //       <h1 className="text-center pt-3">Bill Management Page</h1>
  //       <hr></hr>
  //       <button className="btn btn-primary mt-3" onClick={goToAddExpense}>Add Expense</button>
  //       <button className="btn btn-secondary mt-3 mx-3" onClick={goToViewExpenses}>View Expense</button>

  //       <h1 className="mt-3">
  //         {updatedUserAmount < 0 ? `Overall, you owe $${updatedUserAmount.toFixed(2)}` : `Overall, you are owed $${updatedUserAmount.toFixed(2)}`}
  //       </h1>
  //       <h2>Interpersonal Debt Relations:</h2>
  //       <ul className="list-group">
  //         {Object.entries(debts).filter(([user, amount]) => user !== currentUser.email).map(([user, amount]) => (
  //           <li key={user} className="list-group-item d-flex justify-content-between align-items-center">
  //             {amount < 0
  //               ? `You owe user ${user} $${Math.abs(amount).toFixed(2)}`
  //               : `User ${user} owes you $${Math.abs(amount).toFixed(2)}`}
  //             <button className="btn btn-outline-danger" onClick={() => handleSettle(user, amount)}>Settle</button>
  //           </li>
  //         ))}
  //       </ul>

  //       {/* Input for settlement amount */}
  //       {settlingDebt && (
  //         <div className="mt-3">
  //           <input
  //             type="number"
  //             value={settlementAmount}
  //             onChange={(e) => setSettlementAmount(parseFloat(e.target.value))}
  //             className="form-control"
  //           />
  //           <button className="btn btn-success mt-2" onClick={handleSettleExpense} disabled={settlementAmount > Math.abs(debts[settlingDebt])}>Settle Expense</button>
  //         </div>
  //       )}
  //     </div>
  //   </Layout>
  // );
}
export default BillManagement;
