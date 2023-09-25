const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const Workout = require('./workout');


const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    firstname: {
        type: String,
        require: true,
        trim: true,
    },
    lastname: {
        type: String,
        require: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Must match an email address!'],
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    schedule: {
        type: Schema.Types.ObjectId,
        ref: 'Schedule',
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
    },
    height: {
        type: Number, // in inches
    },
    currentWeight: {
        type: Number, // in lbs
    },
    estimatedBodyFat: {
        type: Number, // in percentage
    },
    age: {
        type: Number,
    },
    trainingExperience: {
        type: String,
        enum: ['Beginner', 'Intermediate'],
    },
    mainPhysiqueGoal: {
        type: String,
        enum: ['Burn Fat', 'Build Muscle', 'Recomp'],
    },
    startDate: {
        type: Date,
        require: true,
    },
    weeks: {
        type: Number,
        require: true,
    },
    dailyTracking: [
        {
            date: Date,
            weight: Number,
            calorieIntake: Number,
            proteinIntake: Number
        }
    ]
});

userSchema.pre('save', function(next) {
    if (this.isModified('startDate') || this.isModified('weeks')) {
      const startDate = new Date(this.startDate); // Initialize once
      const programLength = this.weeks;
      const dailyTracking = [];
      for (let i = 0; i < programLength * 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dailyTracking.push({
          date,
          weight: null,
          calorieIntake: null,
          proteinIntake: null
        });
      }
      this.dailyTracking = dailyTracking;
    }
    next();
  });

userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};


const User = model('User', userSchema);

module.exports = User; 