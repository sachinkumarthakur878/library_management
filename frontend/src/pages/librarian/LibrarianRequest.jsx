import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./LibrarianPages.css";

export default function LibrarianRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = Server_URL + "librarian/issuerequest";
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching requests", err);
      showErrorToast("Failed to load issue requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      const url = Server_URL + "librarian/approverequest/" + id;
      const response = await axios.put(url, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      showSuccessToast(response.data.message || "Book issued successfully!");
      fetchRequests();
    } catch (err) {
      if (err.response) {
        showErrorToast(err.response.data?.error || "Something went wrong");
      } else {
        showErrorToast("Network error: " + err.message);
      }
    }
  };

  return (
    <div className="lib-page">
      <div className="lib-header">
        <div>
          <h1 className="lib-title">Issue Requests</h1>
          <p className="lib-subtitle">Approve or manage pending book issue requests</p>
        </div>
        <div className="lib-count-badge">{requests.length} pending</div>
      </div>

      {loading ? (
        <div className="lib-loading">
          <div className="lib-spinner"></div>
          <p>Fetching requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="lib-empty">
          <span className="lib-empty-icon">📭</span>
          <h3>No pending issue requests</h3>
          <p>All caught up! No new book requests at the moment.</p>
        </div>
      ) : (
        <div className="lib-table-wrapper">
          <table className="lib-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Request Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="lib-row">
                  <td>
                    <div className="lib-user-cell">
                      <div className="lib-avatar">{req.userId?.name?.[0]?.toUpperCase() || "?"}</div>
                      <div>
                        <div className="lib-user-name">{req.userId?.name || "N/A"}</div>
                        <div className="lib-user-email">{req.userId?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="lib-book-title">{req.bookId?.title || "N/A"}</td>
                  <td className="lib-date">{new Date(req.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="lib-date">{new Date(req.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>
                    <span className="lib-status lib-status--requested">Requested</span>
                  </td>
                  <td>
                    <button
                      className="lib-approve-btn"
                      onClick={() => approveRequest(req._id)}
                    >
                      Approve Issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
