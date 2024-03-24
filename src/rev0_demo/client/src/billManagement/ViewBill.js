import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import EditBill from "./EditBill";
import Layout from "../Layout";
import DatePicker from "react-datepicker";
import EditPng from '../images/edit-icon.png';
import DeletePng from '../images/delete.png';

import "react-datepicker/dist/react-datepicker.css";

const auth = getAuth();

function ViewBill() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [editBill, setEditBill] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // State variable for edit modal visibility
  const [categories] = useState([
    "Food",
    "Groceries",
    "Transportation",
    "Household",
    "Entertainment",
    "Healthcare",
    "Education",
    "Personal Care",
    "Debts",
    "Miscellaneous",
    "Uncategorized",
  ]);

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
    console.log(billToEdit);
    setShowEditModal(true);
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
    setShowEditModal(false);
    window.location.reload();
  };

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    if (value === "") {
      // If the "All" checkbox is checked, clear all selected categories
      setSelectedCategories(checked ? [] : categories);
    } else {
      // If a specific category checkbox is checked or unchecked
      if (checked) {
        setSelectedCategories([...selectedCategories, value]);
      } else {
        setSelectedCategories(
          selectedCategories.filter((category) => category !== value)
        );
      }
    }
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedGroup(null);
    setSelectedUser(null);
  };

  const applyFilters = (bill) => {
    let categoryMatch = true;
    if (selectedCategories.length > 0) {
      categoryMatch = selectedCategories.includes(bill.category);
    }

    let dateMatch = true;
    if (selectedStartDate && selectedEndDate) {
      const billDate = new Date(bill.date);
      dateMatch = billDate >= selectedStartDate && billDate <= selectedEndDate;
    }

    let groupMatch = true;
    if (selectedGroup) {
      groupMatch = bill.group && bill.group._id === selectedGroup;
    }

    let userMatch = true;
    if (selectedUser) {
      userMatch = bill.users[0].user._id === selectedUser;
    }

    return categoryMatch && dateMatch && groupMatch && userMatch;
  };

  const filteredBills = bills.filter(applyFilters);

  // Extract unique groups and users from bills
  const uniqueGroups = [
    ...new Map(bills.map((group) => [group.group._id, group.group])).values(),
  ];
  const usersWithIndex = bills.map((bill) => bill.users[0].user._id);
  const uniqueUserIndices = [...new Set(usersWithIndex)];
  const uniqueUsers = uniqueUserIndices.map(
    (index) =>
      bills.find((bill) => bill.users[0].user._id === index).users[0].user
  );

  return (
    <Layout>
      <div className="container">
        <>
          <h1 className="text-center pb-3 pt-3">View Expenses</h1>
          <div className="d-flex mb-3">
            <div className="me-2">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="categoryDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="categoryDropdown"
                >
                  <li>
                    <label className="dropdown-item">
                      <input
                        type="checkbox"
                        value=""
                        onChange={handleCategoryChange}
                        checked={selectedCategories.length === 0}
                      />{" "}
                      All
                    </label>
                  </li>
                  {categories.map((category) => (
                    <li key={category}>
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          value={category}
                          onChange={handleCategoryChange}
                          checked={selectedCategories.includes(category)}
                        />{" "}
                        {category}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="me-2">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="groupDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Groups
                </button>
                <ul className="dropdown-menu" aria-labelledby="groupDropdown">
                  <li>
                    <label className="dropdown-item">
                      <input
                        type="radio"
                        value=""
                        onChange={handleGroupChange}
                        checked={!selectedGroup}
                      />{" "}
                      All
                    </label>
                  </li>
                  {uniqueGroups.map((group) => (
                    <li key={group._id}>
                      <label className="dropdown-item">
                        <input
                          type="radio"
                          value={group._id}
                          onChange={handleGroupChange}
                          checked={selectedGroup === group._id}
                        />{" "}
                        {group.groupName}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="me-2">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Users
                </button>
                <ul className="dropdown-menu" aria-labelledby="userDropdown">
                  <li>
                    <label className="dropdown-item">
                      <input
                        type="radio"
                        value=""
                        onChange={handleUserChange}
                        checked={!selectedUser}
                      />{" "}
                      All
                    </label>
                  </li>
                  {uniqueUsers.map((user) => (
                    <li key={user._id}>
                      <label className="dropdown-item">
                        <input
                          type="radio"
                          value={user._id}
                          onChange={handleUserChange}
                          checked={selectedUser === user._id}
                        />{" "}
                        {user.username}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ms-auto">
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                Clear Filters
              </button>
            </div>
          </div>
          <div className="my-3">
            <div className="date-range">
              <DatePicker
                selected={selectedStartDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                placeholderText="Start Date"
              />
              <DatePicker
                selected={selectedEndDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                minDate={selectedStartDate}
                placeholderText="End Date"
              />
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-1 g-2">
            {filteredBills.map((bill) => (
              <div key={bill._id} className="col">
                <div className="card" style={{ transform: "none" }}>
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="card-title">{bill.billName}</h4>
                      <p>{new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="card-text m-2">
                        ${bill.totalAmount.toFixed(2)}
                      </p>
                      <button
                        className="btn btn-primary"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${bill._id}`}
                        aria-expanded="false"
                        aria-controls={`collapse${bill._id}`}
                      ><i className="bi bi-chevron-expand"></i>
                        View Details
                      </button>

                    </div>
                  </div>
                  <div className="collapse" id={`collapse${bill._id}`}>
                    <div className="card-body">
                      <h5 className="card-title">Details</h5>
                      <div className="mb-3">
                        <p>
                          <span className="fw-bold">
                            {bill.users[0].user.username}{" "}
                          </span>{" "}
                          paid ${bill.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <ul className="list-unstyled">
                          {bill.users.slice(1).map((participant) => (
                            <li key={participant.user._id}>
                              <span className="fw-bold">
                                {" "}
                                {participant.user.username}{" "}
                              </span>{" "}
                              owes ${participant.amountOwed.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-3">
                        <p>
                          {" "}
                          <span className="fw-bold"> Group: </span>
                          {bill.group ? bill.group.groupName : "None"}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <p>
                            {" "}
                            <span className="fw-bold"> Category: </span>
                            {bill.category}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              data-bs-toggle="modal"
                              data-bs-target="#editExpenseModal"
                              onClick={() => handleEditBill(bill._id)}
                              className="btn btn-warning me-1"
                            >
                          <img src={EditPng} alt="Edit" style={{ width: '20px', height: '20px', marginRight: "4px", marginBottom: "4px" }} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="btn btn-danger pt-2"
                            >
                          <i class="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>

                          {/* Bootstrap Modal for Edit Expense */}
                          <div
                            className="modal fade"
                            id="editExpenseModal"
                            tabIndex="-1"
                            role="dialog"
                          >
                            <div
                              className="modal-dialog modal-dialog-centered modal-lg"
                              role="document"
                            >
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5 className="modal-title exo-bold">
                                    Edit Expense
                                  </h5>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="modal-body">
                                  {/* Pass editBill data to EditBill component */}
                                  {editBill && (
                                    <EditBill
                                      key={editBill._id} // Add key prop to force re-render when editBill changes
                                      bill={editBill}
                                      onSave={handleSaveBill}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      </div>
    </Layout>
  );
}

export default ViewBill;
