// LogWorkoutForm.jsx
import React from 'react';

const LogWorkoutForm = ({ date, exercises, onSubmit }) => {
    console.log("LogWorkoutForm rendered"); // Debugging line
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("form contacted")
        // Your logic here, then call onSubmit
        onSubmit(/* your data here */);
      };
    
  // Form logic here
  return (
    <form onSubmit={handleSubmit}>
  {/* Render form fields for each exercise */}
  <input
    className="form-input" 
    placeholder="Your username"
    name="username"
    type="text"
    value="get"
    onChange={exercises}
  />
  <button type="submit">Submit</button> {/* Add this line */}
</form>
  );
};

export default LogWorkoutForm;
