import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { RotatingLines } from "react-loader-spinner";
import { TiArrowBack } from "react-icons/ti";
import { MdDownload } from "react-icons/md";
import host from "../utils";

const Downloadslip = () => {
  let location = useLocation();
  const salaryYear = Number(location.state.salaryYear);
  const salaryMonthNumber = Number(location.state.salaryMonthNumber);
  const data = location.state.fields;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [fields, setFields] = useState({});
  var allMonthsName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    axios
      .post(
        `${host}/Emp_Salary/salary_?userid=${id}&year=${salaryYear}&month=${salaryMonthNumber}`,
        data
      )
      .then((response) => {
        console.log("response----------------->", response.data);
        if (response.data.success) {
          setFields(response.data.salary);
          setIsLoading(false);
          return response.data.salary;
        } else {
          setFields(response.data);
          setIsLoading(false);
          return response.data;
        }
      })
      .then((response) => {
        if (response) {
          console.log("reponse", response);
          const element = document.getElementById("pdf-download");
          html2pdf(element, {
            margin: 0,
            filename: `${response.Employee_name}_${allMonthsName[response.Salary_Slip_Month - 1]
              }.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 5 },
            jsPDF: { unit: "in", format: "Tabloid", orientation: "Landscape" },
          });
        }
      })
      .catch((err) => {
        console.log("Somthing Went Wrong", err);
      });
  }, []);
  const fromatRupees = (rs) => {
    let str = String(rs);
    if (str.length === 4) {
      return `${str[0]},${str.slice(1)}`;
    } else if (str.length === 5) {
      return `${str.slice(0, 2)},${str.slice(2)}`;
    } else if (str.length === 6) {
      return `${str[0]},${str.slice(1, 3)},${str.slice(3)}`;
    } else if (str.length === 7) {
      return `${str.slice(0, 2)},${str.slice(2, 4)},${str.slice(4)}`;
    } else {
      return str;
    }
  };
  console.log('fields-------------------', fields);
  const Pdfdownload = () => {
    const element = document.getElementById("pdf-download");
    html2pdf(element, {
      margin: 0,
      filename: `${fields.Employee_name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "Tabloid", orientation: "Landscape" },
    });
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    let newDate = `${day}-${month}-${year}`;
    return newDate;
  };

  return (
   <div className="h-100">
      <style>
        {`
          .table>:not(caption)>*>* {
            padding: 0px 4px !important;
          }
          .up_link {
            transform: translate(0px, -7px);
          }
          `}
      </style>
      <div className="pt-4 pb-2 pr-10 d-flex justify-content-end">
        <button
          type="button"
          onClick={Pdfdownload}
          className="btn text-primary border"
        >
          <MdDownload size={30} />
          {/*<button onClick={onDownload}>Excel</button>*/}
        </button>
      </div>
      <TiArrowBack
        onClick={() => {
          navigate("/employee/manageprofile");
        }}
        size={30}
      />
      {isLoading ? (
        <RotatingLines
          className="text-center"
          strokeColor="black"
          strokeWidth="8"
          animationDuration="0.75"
          width="26"
          visible={true}
        />
      ) : (
        <div
          className="d-flex mt-5 container justify-content-center"
          id="pdf-download"
        >
          <div
            className="border border-dark main-element"
            id="for_hide"
            style={{
              fontFamily: "revert",
              width: "70%",
            }}
            // ref={tableRef}
          >
            <div className=" text-center">
              <div
                className="fw-bold border-bottom border-dark d-grid up_link pt-3"
                style={{ color: "rgb(18 82 162)" }}
              >
                <small
                  className="up_link"
                  style={{ fontSize: "20px", fontFamily: "cambria" }}
                >
                  ZECDATA
                </small>
                <small
                  className="up_link"
                  style={{
                    fontSize: "12px",
                    fontFamily: "cambria",
                    marginBottom: "4px",
                  }}
                >
                  INDORE(M.P.)
                </small>
              </div>
              <h6
                className="fw-bolder up_link pt-3"
                style={{ color: "rgb(18 82 162)" }}
              >
                Pay Slip For The Month Of
                {" " + allMonthsName[fields.Salary_Slip_Month - 1]}{" "}
                {fields.Salary_Slip_Year}
              </h6>
            </div>
            <div
              className="text-white d-flex "
              style={{
                backgroundColor: "rgb(77 137 202)",
                borderTop: "1px solid black",
              }}
            >
              <div className="col-md-6 ml-1" style={{ fontFamily: "cambria" }}>
                <div className="d-flex">
                  <div className="col-md-5">
                    <small className="fw-bolder up_link">Name </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-md-7">
                    <small className="fw-bolder up_link">
                      {fields?.Employee_name?.toUpperCase()}
                    </small>
                  </div>
                  <div className="col-md-5">
                    <small className="fw-bolder up_link">Employee Code. </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-md-5">
                    <small className="fw-bolder up_link">
                      {fields.Employee_code}
                    </small>
                  </div>
                </div>
                <div className="d-flex ">
                  <div className="col-md-5">
                    <small className="fw-bolder up_link">Designation </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-md-7">
                    <small className="fw-bolder up_link">
                      {fields.designation}
                    </small>
                  </div>
                  <div className="col-md-5">
                    <small className="fw-bolder up_link">Bank A/c No. </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-md-5">
                    <small
                      className="fw-bolder up_link"
                      style={{ fontSize: "16px" }}
                    >
                      {fields.Bank_Account_Number}
                    </small>
                  </div>
                </div>

                <div className="d-flex">
                  <div className="col-5">
                    <small className="fw-bolder up_link">DOJ </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-7">
                    <small className="fw-bolder up_link">
                      {formatDate(fields?.Date_of_Joining?.substring(0, 10))}
                    </small>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">IFSC</small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-5">
                    <small
                      className="fw-bolder up_link"
                      style={{ fontSize: "16px" }}
                    >
                      {fields.Bank_IFSC_Code}
                    </small>
                  </div>
                </div>

                <div
                  className="border-bottom border-dark mr-2"
                  style={{ width: "200%", marginLeft: "-0.25rem" }}
                ></div>

                <div className="d-flex">
                  <div className="col-5">
                    <small className="fw-bolder up_link">
                      Leave (balance){" "}
                    </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-7">
                    <small className="fw-bolder up_link">
                      {fields.Leave_balence}
                    </small>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">
                      Total Working Days
                    </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">
                      {fields.Total_Work_Days}
                    </small>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="col-5">
                    <small className="fw-bolder up_link">Leaves taken </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-7">
                    <small className="fw-bolder up_link">
                      {fields.Leave_taken}
                    </small>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">Present Days</small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">
                      {fields.Present_day}
                    </small>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="col-5">
                    <small className="fw-bolder up_link">Balance Days </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-7">
                    <small className="fw-bolder up_link">
                      {fields.Balence_days}
                    </small>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">Total Paid Days</small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-5">
                    <small className="fw-bolder up_link">
                      {fields.Total_paid_day}
                    </small>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="col-5">
                    <small className="fw-bolder up_link">Comp Off (balance) </small>
                  </div>
                  <div className="col-1">
                    <span className="fw-bolder up_link"> : </span>
                  </div>
                  <div className="col-7">
                    <small className="fw-bolder up_link">
                      {fields.Comp_Off_Days}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <table
              className="table table-bordered  border-dark m-0 "
              style={{ borderLeft: "hidden", borderRight: "hidden" }}
            >
              <thead>
                <tr style={{ color: "#19536f" }}>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Gross</th>
                  </th>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Amount</th>
                  </th>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Earning</th>
                  </th>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Amount</th>
                  </th>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Deduction</th>
                  </th>
                  <th scope="col">
                    <th className="up_link pt-2 pb-0">Amount</th>
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: "#19536f" }}>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">Basic & DA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Gross_Basic_DA)}
                    </td>
                  </td>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">Basic & DA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Earned_Basic_DA)}
                    </td>
                  </td>
                  <th className="fw-bolder">
                    <th className="up_link pt-2 pb-0">PF</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">0</td>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">HRA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Gross_HRA)}
                    </td>
                  </td>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">HRA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Earned_HRA)}
                    </td>
                  </td>
                  <th className="fw-bolder">
                    <th className="up_link pt-2 pb-0">Professional Tax</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">

                      {fromatRupees(fields.Professional_Tax ? 200 : 0)}
                    </td>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">RA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Gross_RA)}
                    </td>
                  </td>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">RA</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Earned_RA)}
                    </td>
                  </td>
                  <th className="fw-bolder">
                    <th className="up_link pt-2 pb-0">TDS</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">0</td>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">Flexi Benefits</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Gross_Flext_benefits)}
                    </td>
                  </td>
                  <th scope="row">
                    {" "}
                    <th className="up_link pt-2 pb-0">Flexi Benefits</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    {" "}
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields.Earned_Flext_benefits)}
                    </td>
                  </td>
                  <th className="fw-bolder">
                    <th className="up_link pt-2 pb-0">ECIS</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                  <td className="up_link pt-2 pb-0">
                    {fromatRupees(fields?.ECSI)}
                    </td>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0">ARRS</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0">
                    {fromatRupees(fields?.ARRS)}
                    </td>
                  </td>
                  <th scope="row">
                    {" "}
                    <th className="up_link pt-2 pb-0">Bonus</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    {" "}
                    <td className="up_link pt-2 pb-0">
                      {fromatRupees(fields?.Bonus)}
                    </td>
                  </td>
                  <th className="fw-bolder">
            
                    {" "}
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    {" "}
                    <td className="up_link pt-2 pb-0">
                      
                    </td>
                  </td>
                </tr>
                <tr
                  style={{ backgroundColor: "rgb(77 137 202)", color: "white" }}
                >
                  <th scope="row">
                    <th className="up_link pt-2 pb-1">Total Gross</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1">
                      {fromatRupees(fields.Gross_total)}
                    </td>
                  </td>
                  <th>
                    {" "}
                    <th className="up_link pt-2 pb-1">Total Earn</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1">
                      {fromatRupees(fields.Total_earn)}
                    </td>
                  </td>
                  <th>
                    {" "}
                    <th className="up_link pt-2 pb-1">Additional</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1">
                      {(Number(fields?.Bonus) + Number(fields?.ECSI) + Number(fields?.ARRS))}
                    </td>
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <th className="up_link pt-2 pb-0"></th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0"></td>
                  </td>
                  <th>
                    {" "}
                    <th className="up_link pt-2 pb-0"></th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-0"></td>
                  </td>
                  <th>
                    {" "}
                    <th
                      className="up_link pt-2 pb-1"
                      style={{ visibility: "hidden" }}
                    >
                      Additional
                    </th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1"></td>
                  </td>
                </tr>
                <tr
                  style={{ backgroundColor: "rgb(77 137 202)", color: "white" }}
                >
                  <th scope="row">
                    {" "}
                    <th className="up_link pt-2 pb-1">Net pay</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1">
                      &#8377;{fromatRupees(fields.Net_pay_in_number)}
                    </td>
                  </td>
                  <td></td>
                  <td></td>
                  <th>
                    {" "}
                    <th className="up_link pt-2 pb-1">Total Deduction</th>
                  </th>
                  <td className="fw-bolder  float-right border-0">
                    <td className="up_link pt-2 pb-1">{fields.Professional_Tax ? 200 : 0}</td>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              className="border-bottom border-dark d-flex "
              style={{ borderLeft: "hidden", borderRight: "hidden" }}
            >
              <div className="col-md-4 pt-2 pb-1">
                <div className="d-flex fw-bolder">
                  <small
                    className="fw-bolder up_link ml-3"
                    style={{ color: "rgb(18 82 162)" }}
                  >
                    Net Salary Payable (In Word) :
                  </small>
                </div>
              </div>

              <div
                className="border-start border-dark"
                style={{ marginLeft: "-8px" }}
              ></div>
              <div className=" col-md-8 pt-2 pb-1">
                <div className="d-flex ml-1 fw-bolder">
                  <small
                    className="fw-bolder up_link"
                    style={{ color: "rgb(18 82 162)", fontWeight: "bold" }}
                  >
                    {fields.Net_pay_in_words?.toUpperCase()} ONLY
                  </small>
                  <br></br>
                </div>
              </div>
            </div>
            <span
              className="col-md-12 up_link ml-1"
              style={{ color: "rgb(18 82 162)", fontSize: "14px" }}
            >
              *This is computer generated copy not need to stamp and sign
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
export default Downloadslip;