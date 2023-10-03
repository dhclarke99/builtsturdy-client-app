// LogWorkoutForm.jsx
import React from 'react';

const LogWorkoutForm = (props) => {
    console.log("LogWorkoutForm rendered"); // Debugging line
    console.log(props)
  console.log(props.selectedExercise)

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
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Exercise</label>
    <input type="text" class="form-control" id="exampleInputEmail1" value={props.exercise.exercise.name}readOnly/>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1"/>
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit">Submit</button> {/* Add this line */}
</form>
  );
};

export default LogWorkoutForm;
