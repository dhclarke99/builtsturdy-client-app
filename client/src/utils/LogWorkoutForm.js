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
const initialSetData = setsArray.map(() => ({ actualReps: 0, weight: 0 }));

const [setDetails, setSetDetails] = useState(initialSetData);

console.log("Date: ", date)

const handleChange = (index, event) => {
  const { name, value } = event.target;
  const newSetDetails = [...setDetails];
  newSetDetails[index][name] = value;
  setSetDetails(newSetDetails);
};


const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("form contacted");

  // Prepare the workouts data
  // const workouts = [{
  //   exerciseName: exerciseName,
  //   sets: [
  //     {
  //       actualReps: actualReps,/* get this value from the form */
  //       weight: weight /* get this value from the form */
  //     }
  //     // Add more sets if needed
  //   ]
  // }];

  // Call the resolver
  // await props.onSubmit(userId, date, workouts);
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
