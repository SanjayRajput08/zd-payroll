"use strict"

const { Schema, model } = require('mongoose');

const Salary = Schema({

    Employee_name
        : {
        type: String,
        // required: [true, "Please enter  name!"],
        // trim: [true, "space not allow"],
    },
    userid: {
        type: String,
    },
    Employee_code: {

        type: String,
        // required: [true, "Please enter  name!"],
    },
    designation: {
        type: String,
        // required: [true, "Please enter  name!"],
    },
    Salary_Slip_Month: {
        type: Number,
        // required: true,
    },
    Salary_Slip_Year: {
        type: Number,
        // required: true,
    },
    Date_of_Joining: {
        type: Date,
        // required: true,
    },

    Bank_Account_Number: {
        type: String,
        // required: true
    },
    Bank_IFSC_Code: {
        type: String,
        // required: true
    },

    Total_Work_Days: {
        type: Number,
        // required: true
    },
    Leave_balence: {
        type: Number,
        // required: true
    },
    Leave_taken: {
        type: Number,
        // required: true
    },
    Balence_days: {
        type: Number,
        // required: true
    },
    Present_day: {
        type: Number,
        // required: true
    },
    Total_paid_day: {
        type: Number,
        // required: true
    },
    Gross_Basic_DA: {
        type: Number,
        // required: true
    },
    Gross_HRA: {
        type: Number,
        // required: true
    },
    Gross_RA: {
        type: Number,
        // required: true
    },
    Gross_Flext_benefits: {
        type: Number,
        // required: true
    },
    Gross_total: {
        type: Number,
        required: true
    },
    Earned_Basic_DA: {
        type: Number,
        // required: true
    },
    Earned_HRA: {
        type: Number,
        // required: true
    },
    Earned_RA: {
        type: Number,
        // required: true
    },
    Earned_Flext_benefits: {
        type: Number,
        // required: true
    },
    Total_earn: {
        type: Number,
        // required: true
    }
    ,
    Net_pay_in_words: {
        type: String,
        // required: true
    },
    Net_pay_in_number: {
        type: Number,
        // required: true

    },

    ARRS: {
        type: Number,
        default: 0

    },
    Additional: {
        type: Number,
        default: 0
    },
    ARRS_Comment: {
        type: String,
        default: ""
    },
    Additional_Comment: {
        type: String,
        default: ""
    },
    ECSI: {
        type: Number,
        default: 0,
    },

    Bonus: {
        type: Number,
        default: 0,
    },

    Comp_Off_Days: {
        type: Number,
        default: 0,
    },
},
    {
        timestamps: true
    },

)


// collection creation 
const SalaryModal = model('SALARY', Salary, "salary");





module.exports = SalaryModal;

