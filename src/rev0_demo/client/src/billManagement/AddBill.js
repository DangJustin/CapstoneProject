import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Layout from "../Layout";
import Multiselect from "multiselect-react-dropdown";

const auth = getAuth();

function AddBill() {
  const [currentUser, setCurrentUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [billName, setbillName] = useState("");
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [splitUnevenly, setSplitUnevenly] = useState(false); // State variable for uneven split
  const [categories] = useState(["Food", "Groceries", "Transportation", "Household", "Entertainment", "Healthcare", "Education", "Personal Care", "Debts", "Miscellaneous"]); // Predefined categories
  const [selectedCategory, setSelectedCategory] = useState("");

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
      let expenseData = {
        userID: currentUser.uid,
        amount: amount,
        billName,
        participants: selectedParticipants,
        groupID: selectedGroup,
        category: selectedCategory, // Include selected category
      };

      // If split unevenly, include individual expense amounts
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

      if (!data || data.success !== true) {
        console.error("Failed to add expense. Data:", data);
        return;
      }

      console.log(data.message);

      fetchGroupParticipants(selectedGroup);

      setAmount("");
      setbillName("");
      setSelectedParticipants([]);
      setSelectedGroup("");
      setSplitUnevenly(false); // Reset splitUnevenly state
      setSelectedCategory(""); // Reset selectedCategory state
    } catch (error) {
      console.error("Error adding expense. Details:", error);
    }
  };

  return (
    <Layout>
      {currentUser ? (
        <div className="w-75 mx-auto">
          <h1 className="text-center pb-3 pt-3">Add a new expense</h1>
          <div className="mb-3">
            <label className="text-danger">*</label>
            <label className="form-label">Amount:</label>
            <input
              type="text"
              className="form-control"
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
              onChange={(e) => setbillName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="text-danger">*</label>
            <label className="form-label">Group:</label>
            <select
              className="form-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
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
            <label className="text-danger">*</label>
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
            <button onClick={handleAddExpense} className="btn btn-primary me-2">
              Add Expense
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Bill Management Page</h1>
          <p>No user currently logged in.</p>
        </div>
      )}
    </Layout>
  );
}

export default AddBill;
