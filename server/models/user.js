const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const Workout = require('./workout');
const crypto = require('crypto');


const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: false,
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
    mealPlanTemplate: {
        type: String,
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
            date: {
                type: Date,
                default: function () {
                    // Initialize the date with timestamp at 4 am
                    const currentDate = new Date();
                    currentDate.setHours(4, 0, 0, 0);
                    return currentDate;
                },
            },
            completed: Boolean,
            workout: [
                {
                    exerciseName: String,
                    sets: [
                        {
                            actualReps: Number,
                            weight: Number,
                        },
                    ],
                },
            ],
        },
    ],
    isEmailVerified: {
        type: Boolean,
        default: false,
      },
      emailVerificationToken: {
        type: String,
        default: function() {
          return crypto.randomBytes(20).toString('hex');
        }
      }
});

userSchema.pre('save', function (next) {
    if (this.isModified('startDate') || this.isModified('weeks')) {
        const startDate = new Date(this.startDate);
        const programLength = this.weeks;
        const dailyTracking = [];
        const completedDays = [];
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
                date, // No need to set the timestamp here
                completed: false,
            });
        }
        this.dailyTracking = dailyTracking;
        this.completedDays = completedDays;
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
    // Validate that caloricTarget and currentWeight are set and not zero
    if (!this.caloricTarget || !this.currentWeight || this.caloricTarget === 0 || this.currentWeight === 0) {
        return next(new Error('Caloric target and current weight must be set and non-zero'));
    }

    let proteinPerc;

    // Calculate protein target based on 25% of caloric target or current weight, whichever is larger
    if ((this.caloricTarget * 0.25) / 4 >= this.currentWeight) {
        proteinPerc = 25;
        this.proteinTarget = (this.caloricTarget * 0.25) / 4;
    } else {
        proteinPerc = Math.round(((this.currentWeight * 4) / this.caloricTarget) * 100);
        this.proteinTarget = this.currentWeight;
    }

    // Calculate percentage for carbs and fats
    const carbsPerc = Math.round((100 - proteinPerc) / 2 + 5);
    const fatPerc = 100 - proteinPerc - carbsPerc;

    // Calculate target in grams for carbs and fats
    this.carbohydrateTarget = Math.round((this.caloricTarget * (carbsPerc / 100)) / 4);
    this.fatTarget = Math.round((this.caloricTarget * (fatPerc / 100)) / 9);

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