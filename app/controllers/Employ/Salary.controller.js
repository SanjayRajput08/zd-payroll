"use strict";
const express = require("express");
const SalaryModal = require("../../models/Employ/Salary.modal");
const EmpInfoModal = require("../../models/Employ/Employ.model");
const HolidayModal = require("../../models/Employ/Holiday.modal");
const LeaveModal = require("../../models/Employ/leave.modal");
const yearModal = require("../../models/Employ/Year_Leave.modal");
const {calculate_payslip, calculate_payslip_on_incr_month} = require("./payslip_calculations/payslip_calculation");
const ObjectId = require("mongodb").ObjectId;
const moment = require("moment");
const { request } = require("express");

class Salary {

    async get_salary(req, res, next) {
        try {
            yearModal.findOne({ year: req.query.year })
                .then(function (leave) {
                    res.send(leave);
                }).catch(next);

        }
        catch (err) {
            res.send({ "error": err })
        }
    }
  async salary_(req, res, next) {
    const req_year = req.query.year;
    const req_month = req.query.month;
    const user_id = req.query.userid;
    const overwrite_payslip = req.body.overwrite_payslip;
    const arrear = req.body.arrear; 
    const additional = req.body.additional ? req.body.additional : 0;
    const additional_comment = req.body.additional_comment ? req.body.additional_comment : '';
    const arrear_comment= req.body.arrear_comment ? req.body.arrear_comment : '';
    const Comp_Off_Days= req.body.Comp_Off_Days ? req.body.Comp_Off_Days : 0;
    const months_end_dates = [
      "31",
      "28",
      "31",
      "30",
      "31",
      "30",
      "31",
      "31",
      "30",
      "31",
      "30",
      "31",
    ];
console.log('overwrite_payslip',overwrite_payslip);
console.log('arrear', typeof arrear);
console.log('additional',additional);
    //-----------------------Modals---------------------
    // to get all payslips for a perticular employee
    const all_genrated_salaries = await SalaryModal.find({
      userid: user_id,
    });
    console.log('all_genrated_salaries',all_genrated_salaries);
    const foundObject = all_genrated_salaries.find(obj => obj.Salary_Slip_Month == req_month && obj.Salary_Slip_Year == req_year);
    if (foundObject && !overwrite_payslip) {
      console.log('Object found:', foundObject);
      return res.status(200).send({ success: true, 'salary': foundObject })
    } else {
      console.log('Object not found');
    }

    //get balance leave by year
    var balanced_leaves = await yearModal.findOne({ year: req_year })
    balanced_leaves = balanced_leaves.leave
    console.log('balanced_leaves',balanced_leaves);

    // to get all the information about a perticular employee
    let empinfo_modal = await EmpInfoModal.find({
      _id: user_id,
    });
    empinfo_modal = empinfo_modal[0]
    const effective_salary_list = empinfo_modal?.base_salary_list;
    console.log('effective_salary_list',effective_salary_list);

    // get number of holidays in a month
    const holidays_modal = await HolidayModal.find({
        holiday_date: {
            $gte: req_year + "-" + req_month + '-01',
            $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
        }
    });
    const number_of_holidays_in_a_month = holidays_modal.length;
    // console.log('holidays_modal',holidays_modal);
    // console.log('number_of_holidays_in_a_month',number_of_holidays_in_a_month);

    const compareDates = (year, month, effective_date_emp) => {
        console.log(year, month, '----', effective_date_emp);
        var month_flag = Number(month) < 10 ? "0" : ""
        var to_match_date = year + "-" + month_flag + month + "-" + effective_date_emp.toString().slice(8, 10);
        const effectiveDate = new Date(effective_date_emp);
        const toMatchDate = new Date(`${to_match_date}T00:00:00.000Z`);
        if (toMatchDate <= effectiveDate) {
            return "before";
        } else {
            return "after";
        }

    }
    function countDaysBeforeAndAfter(dateString) {
        const date = moment(dateString);
        const monthStart = moment(date).startOf('month');
        const monthEnd = moment(date).endOf('month');
      
        const daysBefore = date.diff(monthStart, 'days');
        const daysAfter = monthEnd.diff(date, 'days');
      
        return { daysBefore, daysAfter };
    }
      
    // conditions according to the effectives
    var result
    var effective_salary
    var effective_after_salary
    var effective_dates

    for (let i = 0; i < effective_salary_list?.length; i++) {
        console.log(effective_salary_list[i]);
        result = compareDates(req_year, req_month, effective_salary_list[i].effective_date);
        console.log('result',result);
        if (result == "before") {
            if (i === 0) {
                effective_salary = effective_salary_list[i].salary_
                effective_dates = effective_salary_list[i].effective_date
            } else {
                effective_salary = effective_salary_list[i - 1].salary_
                effective_after_salary = effective_salary_list[i].salary_
                effective_dates = effective_salary_list[i].effective_date
            }
            break
        } else {
            effective_salary = effective_salary_list[i].salary_
            effective_dates = effective_salary_list[i].effective_date
        }
        
    }

    // const formated_effective_dates = moment(effective_dates).format("YYYY-MM-DD")
    const eff_month =  moment(effective_dates).month() + 1;
    const eff_year =  moment(effective_dates).year();
    const eff_date =  moment(effective_dates).date();
    console.log('eff_date',eff_date);
    console.log('eff_month',eff_month);
    console.log('eff_year',eff_year);
    console.log('req_month',req_month);
    console.log('req_year',req_year);
    console.log('effective_salary_list?.length',effective_salary_list?.length);

    //salary of normal motnth (not very first month & not effective chages month)
    if((effective_salary_list?.length >= 1 && (eff_month != req_month || eff_year != req_year)) || (eff_month == req_month && eff_year == req_year && eff_date == 1)){
        console.log('-------------**********----------------');
        console.log('eff_date',eff_date);
        var base_salary_of_a_emp = effective_salary;
        if (eff_month == req_month && eff_year == req_year && eff_date == 1 && effective_salary_list.length != 1) {
            base_salary_of_a_emp = effective_after_salary;
        }
        // const pay_start_day = 1;
        // const pay_start_day = moment(effective_salary_list[0].effective_date).date();
    
        // get leaves of a month for a perticular employee
        console.log('req_year',req_year)
        console.log('req_month',req_month)
        console.log('months_end_dates[Number(req_month) - 1]',months_end_dates[Number(req_month) - 1])
        const leaves_in_a_month = await LeaveModal.find({
          userid: user_id,
          from_date: {
            $gte: req_year + "-" + req_month + "-01",
            // $lte: req_year +"-" +req_month +"-" +months_end_dates[Number(req_month) - 1],
            $lte: new Date(req_year, req_month - 1, months_end_dates[Number(req_month) - 1], 23, 59, 59)

          },
          to_date: {
            $gte: req_year + "-" + req_month + "-01",
            // $lte:req_year +"-" +req_month +"-" +months_end_dates[Number(req_month) - 1],
            $lte: new Date(req_year, req_month - 1, months_end_dates[Number(req_month) - 1], 23, 59, 59)
          },
        });
        const total_number_of_leave = leaves_in_a_month
          .map((item) => item.total_number_of_day)
          .reduce((acc, val) => acc + val, 0);
        console.log("leaves_in_a_month", leaves_in_a_month);
        console.log("total_number_of_leave", total_number_of_leave);
        // get total working days in a requested month
        const working_days = Number(months_end_dates[Number(req_month)]) - number_of_holidays_in_a_month; 
        const present_days = working_days - total_number_of_leave;
       const calculated_salary_object = calculate_payslip(base_salary_of_a_emp, total_number_of_leave, working_days, present_days,balanced_leaves, arrear, additional, Comp_Off_Days)
       console.log('calculated_salary_object',calculated_salary_object);
       console.log("193 Bonus =>" , req.body.Bonus, "Comp_off =>" , req.body.Comp_Off_Days)

       const final_salary = new SalaryModal({
        Employee_name: empinfo_modal.First_Name + " " + empinfo_modal.Last_Name,
        userid: empinfo_modal._id,
        Employee_code: empinfo_modal.Employee_Code,
        designation: empinfo_modal.Position,
        Salary_Slip_Month: req_month,
        Salary_Slip_Year: req_year,
        Date_of_Joining: empinfo_modal.date_of_joining,
        Bank_Account_Number: empinfo_modal.Bank_No,
        Bank_IFSC_Code: empinfo_modal.Bank_IFSC,
        Total_Work_Days: calculated_salary_object.working_days,
        Leave_balence: calculated_salary_object.balanced_leaves,
        Leave_taken: calculated_salary_object.total_number_of_leave,
        Balence_days: calculated_salary_object.balance_days,
        Present_day: calculated_salary_object.present_days,
        Total_paid_day: calculated_salary_object.total_paid_days,
        Gross_Basic_DA: calculated_salary_object.gross_basic_da,
        Gross_HRA: calculated_salary_object.gross_hra,
        Gross_RA: calculated_salary_object.gross_ra,
        Gross_Flext_benefits: calculated_salary_object.gross_flexi_benifits,
        Gross_total: base_salary_of_a_emp,
        Earned_Basic_DA: calculated_salary_object.earned_basic_da,
        Earned_HRA: calculated_salary_object.earned_hra,
        Earned_RA: calculated_salary_object.earned_ra,
        Earned_Flext_benefits: calculated_salary_object.earned_flexi_benifits,
        Total_earn: calculated_salary_object.total_earn,
        Net_pay_in_number: calculated_salary_object.net_pay_in_number,
        Net_pay_in_words: calculated_salary_object.net_pay_in_word,
        ARRS: Number(arrear),
        Additional: Number(additional),
        ARRS_Comment: arrear_comment,
        Additional_Comment: additional_comment,
        Bonus: Number(req.body.Bonus),
        ECSI: Number(req.body.ECSI),
        Comp_Off_Days: Number(Comp_Off_Days),
    });

    await final_salary.save();
    console.log({ final_salary });
    res.status(200).send({ success: true, 'salary': final_salary })
        
    }

    const effective_month = moment(effective_salary_list[0].effective_date).month() + 1;
    const effective_year = moment(effective_salary_list[0].effective_date).year();
    // console.log('effective_month', effective_month);
    // console.log('effective_year',effective_year);

    // salary of those months where the effective changes
    if(effective_salary_list?.length > 1 && (eff_month == req_month && eff_year == req_year) && (effective_month != req_month || effective_year != req_year) && eff_date != 1){

        console.log('effective_salary',effective_salary);
        console.log('effective_after_salary',effective_after_salary);
        console.log('effective_dates', effective_dates);
        let base_salary_of_a_emp = {effective_salary, effective_after_salary}

        const leaves_in_this_month = await LeaveModal.find({
            userid: req.query.userid,
            from_date: {
                $gte: req_year + "-" + req_month + '-01',
                $lte: new Date(req_year, req_month - 1, months_end_dates[Number(req_month) - 1], 23, 59, 59)
            },
            to_date: {
                $gte: req_year + "-" + req_month + '-01',
                $lte: new Date(req_year, req_month - 1, months_end_dates[Number(req_month) - 1], 23, 59, 59)
            }
        });
        var leavesBeforeEffective = 0;
        var leavesAfterEffective = 0;
        var leaves_in_this_month_1 = []
        var leaves_in_this_month_2 = []
        console.log('leaves_in_this_month',leaves_in_this_month);
        for (let i = 0; i < leaves_in_this_month.length; i++) {
            const element = leaves_in_this_month[i];
            const fromDate = element.from_date;
            var toDate = element.to_date;
            // console.log('element.from_date',element.from_date);
            // console.log('element.to_date',element.to_date);
            if (fromDate < effective_dates && toDate >= effective_dates) {
                console.log('yes effective comes');  
                console.log('effective_dates', effective_dates);
                const date = moment(effective_dates);
                toDate = moment(toDate)
                leavesBeforeEffective = date.diff(fromDate, 'days');
                leavesAfterEffective = toDate.diff(date, 'days') + 1;
                console.log('leavesBeforeEffective',leavesBeforeEffective);   
                console.log('leavesAfterEffective',leavesAfterEffective);    
            }else{
                console.log('no, not effective comes');   
                leaves_in_this_month_1 = await LeaveModal.find({
                    userid: user_id,
                    from_date: {
                        $gte: req_year + "-" + req_month + '-01',
                        $lte: effective_dates
                    },
                    to_date: {
                        $gte: req_year + "-" + req_month + '-01',
                        $lte: effective_dates
                    }
                });
                leaves_in_this_month_2 = await LeaveModal.find({
                    userid: user_id,
                    from_date: {
                        $gte: effective_dates,
                        $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
                    },
                    to_date: {
                        $gte: effective_dates,
                        $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
                    }
                });  

            }
            
        }

        var total_number_of_leave_1 = leaves_in_this_month_1
        ?.map((item) => item.total_number_of_day)
        .reduce((acc, val) => acc + val, 0);

        var total_number_of_leave_2 = leaves_in_this_month_2
        ?.map((item) => item.total_number_of_day)
        .reduce((acc, val) => acc + val, 0);
        
        total_number_of_leave_1 = total_number_of_leave_1 + leavesBeforeEffective
        total_number_of_leave_2 = total_number_of_leave_2 + leavesAfterEffective
        console.log('total_number_of_leave_1',total_number_of_leave_1);
        console.log('total_number_of_leave_2',total_number_of_leave_2);


        const total_number_of_leave = total_number_of_leave_1 + total_number_of_leave_2
        const total_number_of_leave_obj = {total_number_of_leave, total_number_of_leave_1, total_number_of_leave_2} 

        const holidays_modal_1 = await HolidayModal.find({
            holiday_date: {
                $gte: req_year + "-" + req_month + '-01',
                $lte: effective_dates
            }
        });
        const holidays_modal_2 = await HolidayModal.find({
            holiday_date: {
                $gte: effective_dates,
                $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
            }
        });
        const number_of_holidays_in_a_month_1 = holidays_modal_1.length;
        const number_of_holidays_in_a_month_2 = holidays_modal_2.length;
        const number_of_holidays_in_a_month_obj = {number_of_holidays_in_a_month_1, number_of_holidays_in_a_month_2}

        // get total working days in a requested month
        const { daysBefore, daysAfter } = countDaysBeforeAndAfter(effective_dates);
        const total_working_days = Number(months_end_dates[Number(req_month) - 1]) - number_of_holidays_in_a_month; 
        const working_days_1 = daysBefore - number_of_holidays_in_a_month_1; 
        const working_days_2 = daysAfter - number_of_holidays_in_a_month_2 + 1; 
        const total_working_days_obj = {total_working_days, working_days_1, working_days_2}

        const total_present_days = total_working_days - total_number_of_leave;
        const present_days_1 = working_days_1 - total_number_of_leave_1;
        const present_days_2 = working_days_2 - total_number_of_leave_2;

        const total_present_days_obj = {total_present_days, present_days_1, present_days_2}
        console.log('total_number_of_leave_obj',total_number_of_leave_obj);
        const calculated_salary_object = calculate_payslip_on_incr_month(base_salary_of_a_emp, total_number_of_leave_obj, number_of_holidays_in_a_month_obj, total_working_days_obj, total_present_days_obj, balanced_leaves, arrear, additional)
        console.log('calculated_salary_object',calculated_salary_object);
        console.log('calculated_salary_object',calculated_salary_object.total_working_days);
        // console.log('calculated_salary_object.total_earn_2',calculated_salary_object.total_earn_2, arrear);
        const arrear_plus_additional = Math.round(Number(arrear) + calculated_salary_object.total_earn_2)
        console.log("359 Bonus =>" , req.body.Bonus, "Comp_off =>" , req.body.Comp_Off_Days)

        const final_salary = new SalaryModal({
            Employee_name: empinfo_modal.First_Name + " " + empinfo_modal.Last_Name,
            userid: empinfo_modal._id,
            Employee_code: empinfo_modal.Employee_Code,
            designation: empinfo_modal.Position,
            Salary_Slip_Month: req_month,
            Salary_Slip_Year: req_year,
            Date_of_Joining: empinfo_modal.date_of_joining,
            Bank_Account_Number: empinfo_modal.Bank_No,
            Bank_IFSC_Code: empinfo_modal.Bank_IFSC,
            Total_Work_Days: calculated_salary_object.total_working_days,
            Leave_balence: calculated_salary_object.balanced_leaves,
            Leave_taken: calculated_salary_object.total_number_of_leave,
            Balence_days: calculated_salary_object.balance_days,
            Present_day: calculated_salary_object.total_present_days,
            Total_paid_day: calculated_salary_object.total_paid_days,
            Gross_Basic_DA: calculated_salary_object.gross_basic_da,
            Gross_HRA: calculated_salary_object.gross_hra,
            Gross_RA: calculated_salary_object.gross_ra,
            Gross_Flext_benefits: calculated_salary_object.gross_flexi_benifits,
            Gross_total: effective_salary,
            Earned_Basic_DA: calculated_salary_object.earned_basic_da,
            Earned_HRA: calculated_salary_object.earned_hra,
            Earned_RA: calculated_salary_object.earned_ra,
            Earned_Flext_benefits: calculated_salary_object.earned_flexi_benifits,
            Total_earn: calculated_salary_object.total_earn,
            Net_pay_in_number: calculated_salary_object.net_pay_in_number,
            Net_pay_in_words: calculated_salary_object.net_pay_in_word,
            ARRS: arrear_plus_additional,
            Additional: arrear_plus_additional ,
            ARRS_Comment: arrear_comment,
            Additional_Comment: additional_comment,
            Bonus: Number(req.body.Bonus),
            ECSI: Number(req.body.ECSI),
            Comp_Off_Days: Number(Comp_Off_Days),
        });
    
        await final_salary.save();
        console.log({ final_salary });
        res.status(200).send({ success: true, 'salary': final_salary })

    }

    // salary of very first month
    if (effective_salary_list?.length >= 1 && (effective_month == req_month && effective_year == req_year)) {
        console.log('-----length is one and effective month and year is equal to req month and year');
        const base_salary_of_a_emp = effective_salary_list[0].salary_;
        const pay_start_day = moment(effective_salary_list[0].effective_date).date();
        // get leaves
        const leaves_in_this_month = await LeaveModal.find({
            userid: user_id,
            from_date: {
                $gte: effective_salary_list[effective_salary_list.length - 1].effective_date,
                $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
            },
            to_date: {
                $gte: effective_salary_list[effective_salary_list.length - 1].effective_date,
                $lte: req_year + "-" + req_month + "-" + months_end_dates[Number(req_month) - 1]
            }
        });
        const total_number_of_leave = leaves_in_this_month
        .map((item) => item.total_number_of_day)
        .reduce((acc, val) => acc + val, 0);
        // console.log('leaves_in_this_month',Number(months_end_dates[Number(req_month) - 1]));
        const working_days = Number(months_end_dates[Number(req_month) - 1]) - number_of_holidays_in_a_month; 
        const present_days = Math.abs((working_days - pay_start_day) - total_number_of_leave);

       const calculated_salary_object = calculate_payslip(base_salary_of_a_emp, total_number_of_leave, working_days, present_days, balanced_leaves, arrear, additional)
       console.log('calculated_salary_object',calculated_salary_object);

       console.log("429 Bonus =>" , req.body.Bonus, "Comp_off =>" , req.body.Comp_Off_Days)

       const final_salary = new SalaryModal({
        Employee_name: empinfo_modal.First_Name + " " + empinfo_modal.Last_Name,
        userid: empinfo_modal._id,
        Employee_code: empinfo_modal.Employee_Code,
        designation: empinfo_modal.Position,
        Salary_Slip_Month: req_month,
        Salary_Slip_Year: req_year,
        Date_of_Joining: empinfo_modal.date_of_joining,
        Bank_Account_Number: empinfo_modal.Bank_No,
        Bank_IFSC_Code: empinfo_modal.Bank_IFSC,
        Total_Work_Days: calculated_salary_object.working_days,
        Leave_balence: calculated_salary_object.balanced_leaves,
        Leave_taken: calculated_salary_object.total_number_of_leave,
        Balence_days: calculated_salary_object.balance_days,
        Present_day: calculated_salary_object.present_days,
        Total_paid_day: calculated_salary_object.total_paid_days,
        Gross_Basic_DA: calculated_salary_object.gross_basic_da,
        Gross_HRA: calculated_salary_object.gross_hra,
        Gross_RA: calculated_salary_object.gross_ra,
        Gross_Flext_benefits: calculated_salary_object.gross_flexi_benifits,
        Gross_total: base_salary_of_a_emp,
        Earned_Basic_DA: calculated_salary_object.earned_basic_da,
        Earned_HRA: calculated_salary_object.earned_hra,
        Earned_RA: calculated_salary_object.earned_ra,
        Earned_Flext_benefits: calculated_salary_object.earned_flexi_benifits,
        Total_earn: calculated_salary_object.total_earn,
        Net_pay_in_number: calculated_salary_object.net_pay_in_number,
        Net_pay_in_words: calculated_salary_object.net_pay_in_word,
        ARRS: Number(arrear),
        Additional: Number(additional),
        ARRS_Comment: arrear_comment,
        Additional_Comment: additional_comment,
        Bonus: Number(req.body.Bonus),
        ECSI: Number(req.body.ECSI),
        Comp_Off_Days: Number(Comp_Off_Days),

    });
    await final_salary.save();
    console.log({ final_salary });
    res.status(200).send({ success: true, 'salary': final_salary })
    }

  }
}
module.exports = new Salary();