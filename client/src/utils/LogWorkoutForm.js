// LogWorkoutForm.jsx
import React from 'react';

const LogWorkoutForm = ({ date, exercises, onSubmit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
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
    </form>
  );
};

export default LogWorkoutForm;
