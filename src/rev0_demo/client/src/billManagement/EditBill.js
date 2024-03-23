import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const auth = getAuth();

function EditBill({ bill, onSave }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedBill, setUpdatedBill] = useState(bill);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(bill.group._id);
  const [splitUnevenly, setSplitUnevenly] = useState(false); // State to track uneven split option

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchGroupParticipants(selectedGroup);
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

      // Update state with only the participants of the selected group
      setAllParticipants(groupParticipants);

      return groupParticipants;
    } catch (error) {
      console.error("Error fetching group participants:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBill({ ...updatedBill, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Ensure that the users array is properly formatted with user objects
      const formattedUsers = [
        {
          user: currentUser.uid, // Adding the current user to the list of participants
          amountOwed: 0, // Assuming the current user owes 0 amount
        },
        ...updatedBill.users.map((user) => ({
          user: user._id, // Assuming user._id is the correct user ID field
          amountOwed: splitUnevenly ? user.individualAmount : (updatedBill.totalAmount / (updatedBill.users.length + 1)) || 0, // Defaulting to 0 if amountOwed is missing
        })),
      ];

      // Create the updated bill object with the necessary fields
      const updatedBillData = {
        totalAmount: updatedBill.totalAmount,
        description: updatedBill.description,
        users: formattedUsers,
        group: updatedBill.group, // Assuming group doesn't need modification
      };

      // Send the updated bill data to the server
      const response = await axios.put(
        `http://localhost:5000/api/billManagement/edit-bill/${bill._id}`,
        updatedBillData
      );

      onSave(response.data); // Assuming the API returns the updated bill
    } catch (error) {
      console.error("Error updating bill:", error);
    }
  };

  return (
    <div className="container mt-3">
      <h1>Edit Bill</h1>
      <div className="mb-3">
        <label className="form-label">
          Amount:
          <input
            type="text"
            name="totalAmount"
            value={updatedBill.totalAmount}
            onChange={handleChange}
            className="form-control"
          />
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Description:
          <input
            type="text"
            name="description"
            value={updatedBill.description}
            onChange={handleChange}
            className="form-control"
          />
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Participants:
          <select
            multiple
            value={updatedBill.users.map((participant) => participant._id)}
            onChange={(e) =>
              setUpdatedBill({
                ...updatedBill,
                users: Array.from(e.target.selectedOptions, (option) =>
                  allParticipants.find(
                    (participant) => participant._id === option.value
                  )
                ),
              })
            }
            className="form-select"
          >
            {allParticipants.map((user) => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Group:
          <input
            type="text"
            value={updatedBill.group.groupName || ""}
            disabled
            className="form-control"
          />
        </label>
      </div>
      <div className="mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            checked={splitUnevenly}
            onChange={() => setSplitUnevenly(!splitUnevenly)}
            className="form-check-input"
          />
          <label className="form-check-label">Uneven Split</label>
        </div>
      </div>
      {/* Only show individual amount inputs if split unevenly is selected */}
      {splitUnevenly && (
        <div>
          {updatedBill.users.map((user, index) => (
            <div key={user._id} className="mb-3">
              <label className="form-label">
                {user.email}:
                <input
                  type="text"
                  value={user.individualAmount || ""}
                  onChange={(e) => {
                    const newUser = {
                      ...user,
                      individualAmount: e.target.value,
                    };
                    const newUsers = [...updatedBill.users];
                    newUsers[index] = newUser;
                    setUpdatedBill({ ...updatedBill, users: newUsers });
                  }}
                  className="form-control"
                />
              </label>
            </div>
          ))}
        </div>
      )}
      <button onClick={handleSave} className="btn btn-primary">
        Save
      </button>
    </div>
  );
}

export default EditBill;
