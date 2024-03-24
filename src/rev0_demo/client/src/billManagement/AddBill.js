import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Multiselect from "multiselect-react-dropdown";

const auth = getAuth();

function AddBill({ closeModal }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [billName, setBillName] = useState("");
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [splitUnevenly, setSplitUnevenly] = useState(false);
  const [showUserSelectionError, setShowUserSelectionError] = useState(false);
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
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          console.error("No user currently logged in.");
          return;
        }

        const groupsResponse = await axios.get(
          `http://localhost:5000/api/database/user-groups/${currentUser.uid}`
        );

        if (!groupsResponse) {
          console.error("Failed to fetch user or group data");
          return;
        }

        const groupsData = groupsResponse.data;

        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const fetchGroupParticipants = async (groupId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/database/group-participants/${groupId}/user/${currentUser.uid}`
      );
      if (!response || !response.data) {
        console.error("Failed to fetch group participants:", response);
        return [];
      }

      const groupParticipants = response.data;

      setAllParticipants(groupParticipants);

      return groupParticipants;
    } catch (error) {
      console.error("Error fetching group participants:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchGroupParticipants(selectedGroup);
  }, [selectedGroup]);

  const handleAddExpense = async () => {
    try {
      if (isSubmitting) return; // Prevent multiple submissions
      setIsSubmitting(true); // Set form submission status to true

      if (selectedParticipants.length === 0) {
        // Show the popup
        setShowUserSelectionError(true);
        return;
      } else {
        setShowUserSelectionError(false);
      }
      let expenseData = {
        userID: currentUser.uid,
        amount: amount,
        billName: billName,
        participants: selectedParticipants,
        groupID: selectedGroup,
        category: selectedCategory,
      };

      if (splitUnevenly) {
        const individualAmounts = selectedParticipants.map(
          (participant) => participant.individualAmount
        );
        const totalIndividualAmounts = individualAmounts.reduce(
          (acc, val) => acc + parseFloat(val),
          0
        );
        if (totalIndividualAmounts > parseFloat(amount)) {
          console.error("Individual expense amounts exceed the total amount.");
          return;
        }
        expenseData.individualAmounts = individualAmounts;
      }

      const response = await axios.post(
        "http://localhost:5000/api/billManagement/split-expense",
        expenseData
      );

      if (response.status !== 200) {
        console.error("Unexpected response status:", response.status);
        return;
      }

      const data = response.data;

      if (!data) {
        console.error("Failed to add expense. Data:", data);
        return;
      }

      console.log(data.message);

      fetchGroupParticipants(selectedGroup);

      setAmount("");
      setBillName("");
      setSelectedParticipants([]);
      setSelectedGroup("");
      setSplitUnevenly(false);
      setSelectedCategory("");
      closeModal(); // Close the modal after adding expense
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding expense. Details:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-75 mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddExpense();
        }}
      >
        <div className="mb-3">
          <label className="text-danger">*</label>
          <label className="form-label">Amount:</label>
          <input
            type="text"
            className="form-control"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="text-danger">*</label>
          <label className="form-label">Describe your expense:</label>
          <input
            type="text"
            className="form-control"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="text-danger">*</label>
          <label className="form-label">Group:</label>
          <select
            className="form-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            required
          >
            <option value="">Select a Group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.groupName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="text-danger">*</label>
          <label className="form-label">Participants:</label>
          <Multiselect
            options={allParticipants.map((user) => ({
              value: user._id,
              label: user.email,
            }))}
            selectedValues={selectedParticipants.map((participant) => ({
              value: participant._id,
              label: participant.email,
            }))}
            onSelect={(selectedList) =>
              setSelectedParticipants(
                selectedList.map((user) => ({
                  _id: user.value,
                  email: user.label,
                }))
              )
            }
            onRemove={(selectedList) =>
              setSelectedParticipants(
                selectedList.map((user) => ({
                  _id: user.value,
                  email: user.label,
                }))
              )
            }
            displayValue="label"
            showCheckbox={true}
            closeIcon="cancel"
            placeholder={
              selectedGroup ? "Select participants" : "Select group first"
            }
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Category:</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-check-label">Split Unevenly:</label>
          <input
            type="checkbox"
            className="form-check-input"
            checked={splitUnevenly}
            onChange={() => setSplitUnevenly(!splitUnevenly)}
          />
        </div>
        {splitUnevenly && (
          <div>
            {selectedParticipants.map((participant) => (
              <div key={participant._id} className="mb-3">
                <label className="form-label">
                  {participant.email}:
                  <input
                    type="text"
                    className="form-control"
                    value={participant.individualAmount || ""}
                    onChange={(e) => {
                      const updatedParticipants = selectedParticipants.map(
                        (p) => {
                          if (p._id === participant._id) {
                            return { ...p, individualAmount: e.target.value };
                          }
                          return p;
                        }
                      );
                      setSelectedParticipants(updatedParticipants);
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
        <div className="d-flex justify-content-center pt-3">
          <button type="submit" className="btn btn-primary me-2">
            {isSubmitting ? "Adding Expense..." : "Add Expense"}
          </button>
        </div>
      </form>

      {showUserSelectionError && (
        <div className="alert alert-danger mt-3">
          Please select at least one user.
        </div>
      )}
    </div>
  );
}

export default AddBill;
