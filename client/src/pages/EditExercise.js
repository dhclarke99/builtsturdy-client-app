import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FIND_EXERCISE_BY_ID } from '../utils/queries';
import { UPDATE_EXERCISE } from '../utils/mutations';
import '../utils/css/EditForms.css'

const EditExercise = () => {
  const { id: exerciseId } = useParams();
  const { loading, error, data } = useQuery(FIND_EXERCISE_BY_ID, {
    variables: { exerciseId },
  });
 

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tag, setTag] = useState('');

  const [updateExercise] = useMutation(UPDATE_EXERCISE);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setName(data.exercise.name || '');
      setNotes(data.exercise.notes || '');
      setAdminNotes(data.exercise.adminNotes || '');
      setVideoUrl(data.exercise.videoUrl || '');
      setTag(data.exercise.tag || '');
    }
  }, [data]);
console.log(data)
  useEffect(() => {
    if (data) {
      const dataExercise = data.exercise;
      
      setFormData(dataExercise);
    }
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
console.log(formData)
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error?.message}</p>;


  const handleUpdate = async () => {
    try {
      console.log(formData)
      const { __typename, _id,  ...cleanedFormData } = formData; // Remove __typename

      const formattedData = {
          ...cleanedFormData,
         
        };
        
    await updateExercise({
      variables: { exerciseId: exerciseId, input: formattedData },
    });
   
    window.location.href = '/admin/admindashboard';
    
  } catch (err) {
    console.error('Failed to update exercise:', err);
  }
  };
  


  return (
    <div className='edit-form-container'>
      <h1 className="form-title">Edit Exercise</h1>
      <h2 className='element-name'>{data.exercise.name}</h2>
      <form id="exercise-edit-form">
      <label className="form-label">
        Name:
        <input className="form-input" type="text" name="name" value={formData.name || ''} onChange={handleChange} />
        
      </label>
      <label className="form-label">
        Notes:
        <input className="form-input" type="text"  name="notes" value={formData.notes || ''} onChange={handleChange} />
        
      </label>
      <label className="form-label">
        Admin Notes:
        <input className="form-input" type="text"  name="adminNotes" value={formData.adminNotes || ''} onChange={handleChange} />
        
      </label>
      <label className="form-label">
        Video:
        <input className="form-input" type="text"  name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} />
        
      </label>
      <label className="form-label">
        Tag:
        <select type="text"
                name="tag"
                placeholder="Tag"
                value={formData.tag || ''}
                onChange={handleChange}>
                  <option value='' disabled>Select One</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Abs">Abs</option>
                <option value="Plyometric">Plyometric</option>
                <option value="Warm Up">Warm Up</option>
              </select>
        
      </label>
      <button className="form-button" onClick={handleUpdate}>Update Exercise</button>
      </form>
    </div>
  );
};

export default EditExercise;
