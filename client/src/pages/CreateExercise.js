// pages/CreateExercise.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_EXERCISE } from '../utils/mutations';  // You'll need to define this mutation

const CreateExercise = () => {
  const [exerciseData, setExerciseData] = useState({ name: '', notes: '', adminNotes: '', videoUrl: '', tag: '' });
  const [createExercise] = useMutation(CREATE_EXERCISE);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setExerciseData({ ...exerciseData, [name]: value });
    console.log("Exercise Data: ", exerciseData)
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const variables = {
        ...exerciseData
      };
      console.log(variables)
      await createExercise({ variables });
      window.location.href = ('/admin/admindashboard')
      // Redirect or show success message
    } catch (err) {
      console.error(err);
    }
  };
  
  

  return (
    <div>
      <h1>Create Exercise</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Exercise Name:
          <input type="text" name="name" value={exerciseData.name} onChange={handleInputChange} />
        </label>
        <label>
          Notes:
          <input type="text" name="notes" value={exerciseData.notes} onChange={handleInputChange} />
        </label>
        <label>
          Admin Notes:
          <input type="text" name="adminNotes" value={exerciseData.adminNotes} onChange={handleInputChange} />
        </label>
        <label>
          Video URL:
          <input type="text" name="videoUrl" value={exerciseData.videoUrl} onChange={handleInputChange} />
        </label>
        <label>
        Tag:
        <select type="text"
                name="tag"
                placeholder="Tag"
                value={exerciseData.tag || ''}
                onChange={handleInputChange}>
                  <option value='' disabled>Select One</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Abs">Abs</option>
                <option value="Plyometric">Plyometric</option>
              </select>
        
      </label>
        
        <button type="submit">Create Exercise</button>
      </form>
    </div>
  );
};

export default CreateExercise;
