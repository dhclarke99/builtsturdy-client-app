// LogWorkoutForm.jsx
import React from 'react';

const LogWorkoutForm = (props) => {
    console.log("LogWorkoutForm rendered"); // Debugging line
    console.log(props)
  console.log(props.selectedExercise)
  const exerciseName = props.exercise.exercise.name
  const date = props.date.start

console.log("Date: ", date)
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("form contacted")
        // Your logic here, then call onSubmit
        props.onSubmit(/* your data here */);
      };
    
  // Form logic here
  return (
    <form onSubmit={handleSubmit}>
  {/* Render form fields for each exercise */}
  <div className="mb-3">
    <label className="form-label">Exercise</label>
    <input type="text" className="form-control" id="exampleInputEmail1" value={exerciseName} readOnly/>
  </div>
  <div>

  </div>
  <button type="submit">Submit</button> {/* Add this line */}
</form>
  );
};

export default LogWorkoutForm;
