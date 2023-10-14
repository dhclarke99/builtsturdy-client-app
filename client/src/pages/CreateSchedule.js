import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SCHEDULE } from '../utils/mutations';
import '../utils/css/EditForms.css'

const CreateSchedule = () => {
  const [scheduleData, setScheduleData] = useState({ name: '' });
  const [createSchedule] = useMutation(CREATE_SCHEDULE);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createSchedule({ variables: { name: scheduleData.name } });
      // Redirect or show success message
      window.location.href = '/admin/admindashboard';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='edit-form-container'>
      <h1 className="form-title">Create Schedule</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          Schedule Name:
          <input className="form-input" type="text" name="name" value={scheduleData.name} onChange={handleInputChange} />
        </label>
        <button className="form-button" type="submit">Create Schedule</button>
      </form>
    </div>
  );
};

export default CreateSchedule;
