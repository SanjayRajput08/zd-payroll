import React from "react";
import { useEffect, useState } from "react";
import Downloadslip from "./Salary_slip/downloadslip";

import { Link, useNavigate, useParams } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import host from "./utils";
function Salary() {
  const { id } = useParams();
  let navigate = useNavigate();
  const [empdata, empdatachange] = useState({});
  const [fields, setFields] = useState({
    arrear: 0,
    // additional: 0,
    // arrear_comment: "",
    // additional_comment: "",
    Comp_Off_Days:0,
    ECSI: 0,
    Bonus: 0,
    overwrite_payslip: false,
  });
  const [switchToAdvance, setSwitchToAdvance] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [salaryYear, setSalaryYear] = useState(0);
  const [salaryMonthNumber, setSalaryMonthNumber] = useState(0);
  const [prevMonths, setPrevMonths] = useState([]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    let salaryMonth = event.target.value;
    let yearStr = salaryMonth.substring(0, 4);
    let monthStr = salaryMonth.substring(4);
    setSalaryYear(yearStr);
    setSalaryMonthNumber(monthStr);
  };
  function handleChange(e) {
    let fieldObj = { ...fields };
    if (e.target.name == "overwrite_payslip") {
      fieldObj["overwrite_payslip"] = !fieldObj["overwrite_payslip"];
    } else {
      fieldObj[e.target.name] = e.target.value;
    }
    console.log("fieldObj", fieldObj);
    setFields(fieldObj);
  }
  const handleToggleAdvance = (e) => {
    setSwitchToAdvance((prev) => !prev);
  };

  const getPreviousMonths = (empDetailObject) => {
    const dateOfJoining = new Date(empDetailObject.base_salary[0].effective_date);
    const doj = dateOfJoining;
    const current = new Date();
    const startMonth = new Date(doj).getMonth();
    const startYear = new Date(doj).getFullYear();
    const endMonth = new Date(current).getMonth();
    const endYear = new Date(current).getFullYear();
    const months = [];

    for (let year = endYear; year >= startYear; year--) {
      const monthStart = year === endYear ? endMonth - 1 : 11;
      const monthEnd = year === startYear ? startMonth : 0;
      for (let month = monthStart; month >= monthEnd; month--) {
        const format1 = new Date(year, month).toLocaleString("en-us", {
          month: "short",
          year: "numeric",
        });
        const monthNumber = month + 1;
        months.push({ format1, year, monthNumber });
        if (months.length >= 12) {
          break;
        }
      }
      if (months.length >= 12) {
        break;
      }
    }
    console.log("months", months);
    setPrevMonths(months);
    return months;
  };

  function handlesubmit(e) {
    e.preventDefault();
    navigate("/download/" + id, {
      state: {
        salaryYear: salaryYear,
        salaryMonthNumber: salaryMonthNumber,
        fields: fields,
      },
    });
  }

  useEffect(() => {
    fetch(`${host}/emp/emp_1/` + id)
      .then((res) => {
        return res.json();
      })
      .then((resp) => {
        let obje = {
          Employee_name: resp.First_Name,
          Last_Name: resp.Last_Name,
          userid: resp._id,
          Employee_code: resp.Employee_Code,
          designation: resp.Position,
          Date_of_Joining: resp.date_of_joining,
          Employee_PAN: resp.PAN_No,
          Employee_Adhar: resp.ADHAR,
          Bank_Account_Number: resp.Bank_No,
          Bank_IFSC_Code: resp.Bank_IFSC,
          base_salary: resp.base_salary_list,
        };
        getPreviousMonths(obje);
        empdatachange(obje);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);
  
  return(
    <div className="pt-5">
      <div>
        <div className="offset-lg-2 col-lg-8">
          {empdata && (
            <form className="container" onSubmit={(e) => handlesubmit(e)}>
              <div className="card m-5 p-3 ">
                <Link to="/employee/manageprofile">
                  <TiArrowBack size={25} />
                </Link>
                <div className="card-title" style={{ textAlign: "center" }}>
                  <h2 className="text-red-900">Generate Salary Receipt</h2>
                </div>
                <div className="row text-center pt-3">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <div className="form-group">
                      <div className="col-md-12">
                        <div>
                          {" "}
                          <span className="fw-bolder text-lg">Name :</span>{" "}
                          <small className="ms-3 text-lg fw-bolder">
                            {empdata.Employee_name + " " + empdata.Last_Name}
                          </small>{" "}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div>
                      {" "}
                      <span className="fw-bolder text-lg">EMP Code :</span>{" "}
                      <small className="ms-3 text-lg fw-bolder">
                        {empdata.Employee_code}
                      </small>{" "}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pt-4">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customSwitches"
                        onChange={(e) => handleToggleAdvance(e)}
                      />
                      <label
                        className="custom-control-label px-3"
                        htmlFor="customSwitches"
                      >
                        advance options
                      </label>
                    </div>
                  </div>
                </div>
                {switchToAdvance ? (
                  <div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">ARRS</label>
                          <input
                            type="number"
                            style={{ textTransform: "capitalize" }}
                            name="arrear"
                            minLength="2"
                            maxLength="50"
                            className="form-control"
                            placeholder="ARRS"
                            value={fields.arrear}
                            onChange={(e) => handleChange(e)}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">Comp off Days</label>
                          <input
                            type="number"
                            style={{ textTransform: "capitalize" }}
                            name="Comp_Off_Days"
                            minLength="2"
                            maxLength="50"
                            className="form-control"
                            placeholder="Comp off Days"
                            value={fields.Comp_Off_Days}
                            onChange={(e) => handleChange(e)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">
                            ARRS Comment
                          </label>
                          <textarea
                            className="form-control"
                            name="arrear_comment"
                            rows="3"
                            cols="35"
                            placeholder="Write Comment Here"
                            value={fields.arrear_comment}
                            onChange={(e) => handleChange(e)}
                          ></textarea>
                          <div className="errorMsg"></div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">
                            Additional Comment
                          </label>
                          <textarea
                            className="form-control"
                            name="additional_comment"
                            rows="3"
                            cols="35"
                            placeholder="Write Comment Here"
                            value={fields.additional_comment}
                            onChange={(e) => handleChange(e)}
                          ></textarea>
                          <div className="errorMsg"></div>
                        </div>
                      </div>
                    </div> */}
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">ECSI</label>
                          <input
                            type="number"
                            style={{ textTransform: "capitalize" }}
                            name="ECSI"
                            minLength="2"
                            maxLength="50"
                            className="form-control"
                            placeholder="ECSI"
                            value={fields.ECSI}
                            onChange={(e) => handleChange(e)}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="form-group">
                          <label className="profile_details_text">
                            Bonus
                          </label>
                          <input
                            type="number"
                            style={{ textTransform: "capitalize" }}
                            name="Bonus"
                            minLength="2"
                            maxLength="50"
                            className="form-control"
                            placeholder="Bonus"
                            value={fields.Bonus}
                            onChange={(e) => handleChange(e)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 pt-2">
                        <div className="custom-control custom-switch">
                          <input
                            type="checkbox"
                            name="overwrite_payslip"
                            className="custom-control-input"
                            value={fields.overwrite_payslip}
                            onChange={(e) => handleChange(e)}
                          />
                          <label
                            className="custom-control-label px-3"
                            htmlFor="customSwitches"
                          >
                            select for overwrite payslip
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pt-2">
                    <div className="form-group">
                      <label>Select the month</label>
                      <select
                        name="Salary_Slip_Month_Year"
                        className="form-control "
                        value={selectedOption}
                        onChange={handleOptionChange}
                        required
                      >
                        <option selected disabled value="">
                          please select an option
                        </option>
                        {prevMonths.map((month) => {
                          return (
                            <option
                              key={month.format1}
                              value={month.year.toString() + month.monthNumber.toString()}
                            >
                              {month.format1}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="submit pt-8">
                    <div className="form-group">
                      <input
                        type="submit"
                        value="Download Slip"
                        className="col-lg-12 col-md-12 col-sm-12 col-xs-12 btn btn-success"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Salary;
