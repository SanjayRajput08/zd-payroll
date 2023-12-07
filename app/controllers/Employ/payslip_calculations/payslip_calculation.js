const convertRupeesIntoWords = require('convert-rupees-into-words');
const calculate_payslip = (base_salary_of_a_emp, total_number_of_leave, working_days, present_days, balanced_leaves, arrear, additional, Comp_Off_Days) =>{
    // console.log('total_number_of_leave',total_number_of_leave);
    // console.log('working_days',working_days);
    // console.log('base_salary_of_a_emp',base_salary_of_a_emp);
    // console.log('present_days',present_days);
    const total_paid_days = present_days + balanced_leaves;
    const balance_days = balanced_leaves - total_number_of_leave;
    var gross_basic_da = Math.round(base_salary_of_a_emp / 2)
    var gross_hra = Math.round((gross_basic_da * 40) / 100)
    var gross_ra = Math.round((gross_basic_da * 15) / 100)
    var gross_flexi_benifits = Math.round(base_salary_of_a_emp - gross_basic_da - gross_hra - gross_ra)
    var earned_basic_da = Math.round((gross_basic_da / working_days) * total_paid_days)
    var earned_hra = Math.round((gross_hra / working_days) * total_paid_days)
    var earned_ra = Math.round((gross_ra / working_days) * total_paid_days)
    var earned_flexi_benifits = Math.round((gross_flexi_benifits / working_days) * total_paid_days)
    var net_pay_in_number = (base_salary_of_a_emp / working_days) * total_paid_days + Number(arrear) + Number(additional)
    net_pay_in_number = Math.round(net_pay_in_number)
    var net_pay_in_word = convertRupeesIntoWords(net_pay_in_number)
    const total_earn = Math.round(earned_basic_da + earned_hra + earned_ra + earned_flexi_benifits)
    // console.log('net_pay_in_number', net_pay_in_number, net_pay_in_word);

const calculated_salary_object = {
    total_number_of_leave,
    balanced_leaves,
    balance_days,
    working_days,
    present_days,
    total_paid_days,
    gross_basic_da,
    gross_hra,
    gross_ra,
    gross_flexi_benifits,
    earned_basic_da,
    earned_hra,
    earned_ra,
    earned_flexi_benifits,
    net_pay_in_number,
    net_pay_in_word,
    total_earn
}
return calculated_salary_object;
}


const calculate_payslip_on_incr_month = (base_salary_of_a_emp, total_number_of_leave_obj, number_of_holidays_in_a_month_obj, total_working_days_obj, total_present_days_obj,balanced_leaves, arrear, additional) =>{
    const {effective_salary, effective_after_salary} = base_salary_of_a_emp;
    const {total_number_of_leave, total_number_of_leave_1, total_number_of_leave_2} = total_number_of_leave_obj;
    const {total_working_days, working_days_1, working_days_2} = total_working_days_obj;
    const {total_present_days, present_days_1, present_days_2} = total_present_days_obj;

    console.log('effective_salary',effective_salary);
    console.log('effective_after_salary',effective_after_salary);
    console.log('total_working_days',total_working_days);
    console.log('working_days_1',working_days_1);
    console.log('working_days_2',working_days_2);
    console.log('present_days_1',present_days_1);
    console.log('present_days_2',present_days_2);
    console.log('balanced_leaves',balanced_leaves);


    const total_paid_days_1 = present_days_1 + balanced_leaves;
    const total_paid_days = present_days_1 + present_days_2 + balanced_leaves;
    const balance_days = balanced_leaves - total_number_of_leave;
    var gross_basic_da = effective_salary / 2;
    var gross_hra = (gross_basic_da * 40) / 100;
    var gross_ra = (gross_basic_da * 15) / 100;
    var gross_flexi_benifits = effective_salary - gross_basic_da - gross_hra - gross_ra;

    var earned_basic_da = Math.round((gross_basic_da / total_working_days) * total_paid_days_1);
    var earned_hra = Math.round((gross_hra / total_working_days) * total_paid_days_1);
    var earned_ra = Math.round((gross_ra / total_working_days) * total_paid_days_1);
    var earned_flexi_benifits = Math.round((gross_flexi_benifits / total_working_days) * total_paid_days_1);
    const total_earn = earned_basic_da + earned_hra + earned_ra + earned_flexi_benifits;

    const total_earn_2 = (effective_after_salary / total_working_days) * present_days_2;

    var net_pay_in_number = ((effective_salary / total_working_days) * total_paid_days_1) + total_earn_2 + Number(arrear) + Number(additional);
    net_pay_in_number = Math.round(net_pay_in_number)
    var net_pay_in_word = convertRupeesIntoWords(net_pay_in_number)
    
    console.log('net_pay_in_number--',net_pay_in_number);
    console.log('net_pay_in_word',net_pay_in_word);

    const calculated_salary_object = {
        total_number_of_leave,
        balanced_leaves,
        balance_days,
        total_working_days,
        total_present_days,
        total_paid_days,
        gross_basic_da,
        gross_hra,
        gross_ra,
        gross_flexi_benifits,
        earned_basic_da,
        earned_hra,
        earned_ra,
        earned_flexi_benifits,
        net_pay_in_number,
        net_pay_in_word,
        total_earn,
        total_earn_2
    }

    return calculated_salary_object

}

module.exports = {calculate_payslip, calculate_payslip_on_incr_month}