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
    caloricTarget: {
        type: Number,
    },
    proteinTarget: {
        type: Number,
    },
    carbohydrateTarget: {
        type: Number,
    },
    fatTarget: {
        type: Number,
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
    ],
    completedDays: [
        {
            date: Date,
            completed: Boolean,
            workout: [
                {
                    exerciseName: String,
                    sets: [{
                        actualReps: Number,  // Actual reps set by user
                        weight: Number
                    }]
                }
            ]
        },
    ]
});

userSchema.pre('save', function (next) {
    if (this.isModified('startDate') || this.isModified('weeks')) {
        // Logic for dailyTracking
        const startDate = new Date(this.startDate);
        const programLength = this.weeks;
        const dailyTracking = [];
        const completedDays = []; // Initialize completedDays array
        for (let i = 0; i < programLength * 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dailyTracking.push({
                date,
                weight: null,
                calorieIntake: null,
                proteinIntake: null,
            });
            completedDays.push({
                date,
                completed: false, // Initialize as not completed
            });
        }
        this.dailyTracking = dailyTracking;
        this.completedDays = completedDays; // Update completedDays field
    }
    next();
});

userSchema.pre('save', function (next) {
    let BMR;
    let calories;
    let caloriesRounded;

    if (!this.$isEmpty('gender') && !this.$isEmpty('age') && !this.$isEmpty('currentWeight') && !this.$isEmpty('height') && !this.$isEmpty('trainingExperience') && !this.$isEmpty('mainPhysiqueGoal')) {
        
        const mass = this.currentWeight * 0.453592;
        
        if (!this.$isEmpty('estimatedBodyFat')) {
            const LBM = (mass * (100 - this.estimatedBodyFat)) / 100;
            BMR = 370 + (21.6 * LBM);
        } else {
            const h = this.height * 2.53;
            const s = this.gender === "Male" ? 5 : -151;
            BMR = (10 * mass + 6.25 * h - 5 * this.age) + s;
        }

        const BMRWithActivity = BMR * 1.55;

        if (this.trainingExperience === "Beginner") {
            calories = this.mainPhysiqueGoal === "Burn Fat" ? BMRWithActivity - 500 : BMRWithActivity + 500;
        } else {
            calories = this.mainPhysiqueGoal === "Burn Fat" ? BMRWithActivity - 300 : BMRWithActivity + 300;
        }

        caloriesRounded = Math.round(calories);
        this.caloricTarget = caloriesRounded;
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