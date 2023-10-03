// LogWorkoutForm.jsx
import React, { useEffect, useState, useRef } from 'react';

const LogWorkoutForm = (props) => {
    console.log("LogWorkoutForm rendered"); // Debugging line
    console.log(props)
  console.log(props.selectedExercise)
  const userId = props.userData._id
  const exerciseName = props.exercise.exercise.name
  const date = props.date.start
  const setsArray = Array.from({ length: props.exercise.sets }, (_, i) => i + 1);
  // Find the completed workout for the selected exercise and date
  const completedWorkout = props.userData.completedDays.find(day => 
    day.date === props.date.start.getTime().toString() &&
    day.workout.some(w => w.exerciseName === exerciseName)
  );

  console.log(props.userData.completedDays)
  console.log(props.date.start.getTime().toString())
  console.log(exerciseName)
  console.log(completedWorkout)
 // Initialize state based on completedWorkout
 let initialSetData;
if (completedWorkout) {
  const specificWorkout = completedWorkout.workout.find(w => w.exerciseName === exerciseName);
  initialSetData = specificWorkout ? specificWorkout.sets : setsArray.map(() => ({ actualReps: 0, weight: 0 }));
} else {
  initialSetData = setsArray.map(() => ({ actualReps: 0, weight: 0 }));
}

const [setDetails, setSetDetails] = useState(initialSetData);
console.log(setDetails)
console.log("Date: ", date)

const handleChange = (index, event) => {
  const { name, value } = event.target;
  const newSetDetails = [...setDetails];
  const updatedSetDetail = { ...newSetDetails[index] };
  updatedSetDetail[name] = parseInt(value);
  newSetDetails[index] = updatedSetDetail;
  setSetDetails(newSetDetails);
};


const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("form contacted");

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
    <form onSubmit={handleSubmit}>
  {/* Render form fields for each exercise */}
  <div className="mb-3">
    <label className="form-label">Exercise</label>
    <input type="text" className="form-control" id="exampleInputEmail1" value={exerciseName} readOnly/>
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
 
  <button type="submit">Submit</button> {/* Add this line */}
</form>
  );
};

export default LogWorkoutForm;
