import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./FineManagement.css";

export default function FineManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | due | paid

  const fetchFines = async () => {
    try {
      setLoading(true);
      const url = Server_URL + "librarian/fines";
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRecords(res.data.records);
    } catch (err) {
      console.error("Error fetching fines", err);
      showErrorToast("Failed to fetch fine records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const markPaid = async (id) => {
    try {
      const url = Server_URL + "librarian/markfinepaid/" + id;
      const res = await axios.put(url, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      showSuccessToast(res.data.message || "Fine marked as paid!");
      fetchFines();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to update fine");
    }
  };

  const filtered = records.filter((r) => {
    if (filter === "all") return true;
    return r.fineStatus === filter;
  });

  const totalDue = records
    .filter((r) => r.fineStatus === "due")
    .reduce((sum, r) => sum + (r.fine || 0), 0);

  const totalCollected = records
    .filter((r) => r.fineStatus === "paid")
    .reduce((sum, r) => sum + (r.fine || 0), 0);

  return (
    <div className="fine-management">
      <div className="fine-header">
        <div className="fine-header-text">
          <h1>Fine Management</h1>
          <p>Track, manage and collect overdue fines</p>
        </div>
      </div>

      <div className="fine-stats">
        <div className="stat-card stat-due">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-label">Total Due</span>
            <span className="stat-amount">₹{totalDue}</span>
            <span className="stat-count">{records.filter(r => r.fineStatus === "due").length} records</span>
          </div>
        </div>
        <div className="stat-card stat-paid">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Total Collected</span>
            <span className="stat-amount">₹{totalCollected}</span>
            <span className="stat-count">{records.filter(r => r.fineStatus === "paid").length} records</span>
          </div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-label">Total Records</span>
            <span className="stat-amount">{records.length}</span>
            <span className="stat-count">all time</span>
          </div>
        </div>
      </div>

      <div className="fine-filters">
        {["all", "due", "paid"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All Fines" : f === "due" ? "🔴 Due" : "🟢 Paid"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="fine-loading">
          <div className="loading-spinner"></div>
          <p>Loading fine records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fine-empty">
          <span className="empty-icon">🎉</span>
          <p>No {filter !== "all" ? filter : ""} fine records found</p>
        </div>
      ) : (
        <div className="fine-table-wrapper">
          <table className="fine-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record._id} className={`fine-row fine-row--${record.fineStatus}`}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{record.userId?.name?.[0]?.toUpperCase() || "?"}</div>
                      <div>
                        <div className="user-name">{record.userId?.name || "N/A"}</div>
                        <div className="user-email">{record.userId?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="book-title">{record.bookId?.title || "N/A"}</td>
                  <td>{new Date(record.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>{record.returnDate ? new Date(record.returnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : <span className="still-issued">Still Issued</span>}</td>
                  <td>
                    <span className="fine-amount">₹{record.fine || record.fineAmount || 0}</span>
                  </td>
                  <td>
                    <span className={`fine-badge fine-badge--${record.fineStatus}`}>
                      {record.fineStatus === "due" ? "🔴 Due" : "🟢 Paid"}
                    </span>
                  </td>
                  <td>
                    {record.fineStatus === "due" ? (
                      <button
                        className="pay-btn"
                        onClick={() => markPaid(record._id)}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="paid-label">Cleared ✓</span>
                    )}
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
