import axios from "axios";
import { TiArrowBack } from "react-icons/ti";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import host from "./../utils"
function LeaveDetails() {
  const navigate = useNavigate();
  const [empLeaveData, setEmpLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deleteLeave = (id) => {
    console.log(id);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        window
          .fetch(`${host}/Emp_Leave/leave_dalete/` + id.id, {
            method: "POST",
          })
          .then((res) => {
            Swal.fire(
              "Deleted!",
              "Your Leave has been deleted.",
              "success"
            ).then(() => {
              window.location.reload(false);
            });
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    });
  };
  var columns = [
    {
      name: "Name",
      selector: (rowData) => rowData["First_Name"],
      sortable: true,
      width: 30,
    },
    {
      name: "Email",
      selector: (rowData) => rowData["email"],
      sortable: true,
    },
    {
      name: "CreatedAt",
      selector: (rowData) => rowData["createdAt"],
      sortable: true,
    },
    {
      name: "From Date",
      selector: (rowData) => rowData["from_date"],
      sortable: true,
    },
    {
      name: "To Date",
      selector: (rowData) => rowData["to_date"],
      sortable: true,
    },
    {
      name: "Phone",
      selector: (rowData) => rowData["Contact_Number"],
      sortable: true,
    },
    {
      name: "Leave Type",
      selector: (rowData) => rowData["leave_type"],
      sortable: true,
    },
    {
      name: "Reason For Leave",
      selector: (rowData) => rowData["reason_for_leave"],
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <span
            className="btn btn-md"
            onClick={() => {
              deleteLeave(row);
            }}
          >
            <FaTrash />
          </span>
        </>
      ),

      ignoreRowClick: true,
    },
  ];
  useEffect(() => {
    axios
      .get(`${host}/Emp_Leave/get_leave`)
      .then((response) => {
        let filteredArr = [];
        let filteredObj = {};
        console.log('---response--->', response);
        let responseArr = response.data.msg;
        responseArr.map((e) => {
          e.result.map((w) => {
            filteredObj = {
              First_Name: w.First_Name,
              email: w.email,
              Contact_Number: w.Contact_Number,
            };
          });
          filteredArr.push({
            ...filteredObj,
            from_date: new Date(e.from_date).toLocaleDateString("pt-PT"),
            to_date: new Date(e.to_date).toLocaleDateString("pt-PT"),
            leave_type: e.leave_type == 1 ? "Full Day" : "Half Day",
            reason_for_leave: e.reason_for_leave,
            id: e._id,
            createdAt: new Date(e.createdAt).toLocaleDateString("pt-PT"),
          });
        });
        setEmpLeaveData(filteredArr);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);
  const filteredData = empLeaveData.filter((row) => {
    return (
      row.First_Name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  });

  return (
    <div>

      <Link
        to="/employee/manageprofile" className="btn text-dark">
        <TiArrowBack size={30} />
      </Link>
      <div>

        <div className="ml-5 mr-5">
          <DataTable
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex" }}>
                  <h4>Leaves Details</h4>{" "}
                  <Link
                    to="/employee/leave"
                    className="btn btn-primary btn-sm ml-5 mr-5"
                  >
                    Add Leave (+)
                  </Link>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            }
            columns={columns}
            data={filteredData ? filteredData : []}
            pagination
            highlightOnHover
            search
          />
        </div>
      </div>
    </div>
  );
}

export default LeaveDetails;
