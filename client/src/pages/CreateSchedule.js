import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SCHEDULE } from '../utils/mutations';

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
    <div>
      <h1>Create Schedule</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Schedule Name:
          <input type="text" name="name" value={scheduleData.name} onChange={handleInputChange} />
        </label>
        <button type="submit">Create Schedule</button>
      </form>
    </div>
  );
};

export default CreateSchedule;
