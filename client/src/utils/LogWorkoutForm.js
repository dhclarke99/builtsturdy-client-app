// LogWorkoutForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import './css/LogWorkoutForm.css'

const LogWorkoutForm = (props) => {

  const userId = props.userData._id
  const exerciseName = props.exercise.exercise.name
  const date = props.date.start
  const setsArray = Array.from({ length: props.exercise.sets }, (_, i) => i + 1);

  // Find the completed workout for the selected exercise and date
  const completedWorkout = props.userData.completedDays.find(day => 
    day.date === props.date.start.getTime().toString() &&
    day.workout.some(w => w.exerciseName === exerciseName)
  );

 // Initialize state based on completedWorkout
 let initialSetData;

 if (completedWorkout) {
   const specificWorkout = completedWorkout.workout.find(w => w.exerciseName === exerciseName);

 
   if (specificWorkout.sets.length === props.exercise.sets) {
     // If the lengths match, use specificWorkout.sets as is
     initialSetData = specificWorkout.sets;
   } else if (specificWorkout.sets.length > props.exercise.sets) {
     // If specificWorkout.sets.length is greater, truncate the end to match expected length
     initialSetData = specificWorkout.sets.slice(0, props.exercise.sets);
   } else {
     // If the lengths don't match, add objects to match the expected length
     initialSetData = [...specificWorkout.sets];
 
     while (initialSetData.length < props.exercise.sets) {
       initialSetData.push({ actualReps: 0, weight: 0 });
     }
   }
 } else {
   initialSetData = setsArray.map(() => ({ actualReps: 0, weight: 0 }));
 }

const [setDetails, setSetDetails] = useState(initialSetData);

const handleChange = (index, event) => {
  const { name, value } = event.target;
  const newSetDetails = [...setDetails];
  const updatedSetDetail = { ...newSetDetails[index] };
  
  // Check if value is null or empty string, if so set it to 0
  const sanitizedValue = value === null || value === '' ? 0 : value;
  
  updatedSetDetail[name] = parseInt(sanitizedValue, 10);
  newSetDetails[index] = updatedSetDetail;
  setSetDetails(newSetDetails);
};


const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanedSetDetails = setDetails.map(set => {
    const {__typename, ...cleanedSet} = set;
    return cleanedSet
  })

  // Prepare the workouts data
  const workouts = [{
    exerciseName: exerciseName,
    sets: cleanedSetDetails // Use the setDetails array here
  }];

  // Call the resolver
  await props.onSubmit(userId, date, workouts);
};


    
  // Form logic here
  return (
    <form className='workout-tracker' onSubmit={handleSubmit}>
  {/* Render form fields for each exercise */}
  <div className="mb-3">
  
    <h4>{exerciseName}</h4> 
  </div>
  {/* Dynamically generate input fields based on the number of sets */}
  {setsArray.map((setNumber, index) => (
        <div key={index} className="set-fields">
          <label className="form-label">Set {setNumber}</label>
          <div className="input-group">
            <div>
            <label className="form-label">Reps Completed</label>
            <input
              type="Number"
              className="form-control"
              placeholder="Reps"
              name="actualReps"
              value={setDetails[index].actualReps}
          onChange={(e) => handleChange(index, e)}
              // add your onChange handler here
            />
            </div>
          <div>
          <label className="form-label">Weight Used</label>
            <input
              type="Number"
              className="form-control"
              placeholder="Weight"
              name="weight"
              value={setDetails[index].weight}
          onChange={(e) => handleChange(index, e)}
              // add your onChange handler here
            />
          </div>
            
          </div>
        </div>
      ))}
 
  <button className='form-button' type="submit">Submit</button> {/* Add this line */}
</form>
  );
};

export default LogWorkoutForm;
