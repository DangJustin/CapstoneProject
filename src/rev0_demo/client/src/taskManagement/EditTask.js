import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EditTask({closeModal, inputTask}) {
  const [task,setTask] = useState([]);
  const [form,setForm] = useState([]);

  // Get task data
  useEffect(() => {
    setTask(inputTask)
  },[inputTask]);

  useEffect(() => {
    setForm(inputTask)
  },[inputTask]);




  // Change fields in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  // Change task to edited values
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTask(form);
    await axios.put(`http://localhost:5000/api/taskManagement/tasks/task/${task._id}`,form);
    console.log('Updated Task:', form);
    closeModal();
  };


  return (
      <div>
        {task &&  (<div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 w-100">
                  <label className="form-label">Task Name:</label>
                  <input type="text" name="taskName"  className="form-control" value={form.taskName} onChange={handleInputChange} />
            </div>
            <div className="mb-3 w-100">
                  <label className="form-label">Description:</label>
                  <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleInputChange}
            />
            </div>
            <div className="mb-3 w-100">
                  <label className="form-label">Deadline Date:</label>
                  <input type="date" className="form-control" name="deadlineDate"  value={form.deadlineDate} onChange={handleInputChange} />
            </div>
            
            <div className='d-flex justify-content-center mb-3'>
              <button className="btn btn-primary me-1" type="submit">Save</button>
            </div>
          </form>
        </div>)}
      </div>
  );
}

export default EditTask;