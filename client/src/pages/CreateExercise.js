// pages/CreateExercise.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_EXERCISE } from '../utils/mutations';  // You'll need to define this mutation
import '../utils/css/EditForms.css'

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
    <div className='edit-form-container'>
      <h1 className="form-title">Create Exercise</h1>
      <form id="exercise-edit-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Exercise Name:
          <input className="form-input" type="text" name="name" value={exerciseData.name} onChange={handleInputChange} />
        </label>
        <label className="form-label">
          Notes:
          <input className="form-input" type="text" name="notes" value={exerciseData.notes} onChange={handleInputChange} />
        </label>
        <label className="form-label">
          Admin Notes:
          <input className="form-input" type="text" name="adminNotes" value={exerciseData.adminNotes} onChange={handleInputChange} />
        </label>
        <label className="form-label">
          Video URL:
          <input className="form-input" type="text" name="videoUrl" value={exerciseData.videoUrl} onChange={handleInputChange} />
        </label>
        <label className="form-label">
        Tag:
        <select className="form-input" type="text"
                name="tag"
                placeholder="Tag"
                value={exerciseData.tag || ''}
                onChange={handleInputChange}>
                  <option value='' disabled>Select One</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Abs">Abs</option>
                <option value="Plyometric">Plyometric</option>
                <option value="Warm Up">Warm Up</option>
              </select>
        
      </label>
        
        <button className="form-button" type="submit">Create Exercise</button>
      </form>
    </div>
  );
};

export default CreateExercise;
