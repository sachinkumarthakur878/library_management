import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./FineManagement.css";

export default function FineManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);

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
      setConfirmId(null);
      fetchFines();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to update fine");
      setConfirmId(null);
    }
  };

  const filtered = records.filter((r) => {
    const matchesFilter = filter === "all" || r.fineStatus === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.userId?.name?.toLowerCase().includes(q) ||
      r.userId?.email?.toLowerCase().includes(q) ||
      r.bookId?.title?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalDue = records
    .filter((r) => r.fineStatus === "due")
    .reduce((sum, r) => sum + (r.fine || 0), 0);

  const totalCollected = records
    .filter((r) => r.fineStatus === "paid")
    .reduce((sum, r) => sum + (r.fine || 0), 0);

  const dueCount = records.filter((r) => r.fineStatus === "due").length;
  const paidCount = records.filter((r) => r.fineStatus === "paid").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="fine-management">
      {/* Header */}
      <div className="fine-header">
        <div className="fine-header-text">
          <h1>Fine Management</h1>
          <p>Track, manage and collect overdue fines from borrowers</p>
        </div>
        <button className="refresh-btn" onClick={fetchFines} title="Refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="fine-stats">
        <div className="stat-card stat-due">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-label">Total Due</span>
            <span className="stat-amount">₹{totalDue.toLocaleString()}</span>
            <span className="stat-count">{dueCount} {dueCount === 1 ? "record" : "records"} pending</span>
          </div>
        </div>
        <div className="stat-card stat-paid">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Total Collected</span>
            <span className="stat-amount">₹{totalCollected.toLocaleString()}</span>
            <span className="stat-count">{paidCount} {paidCount === 1 ? "record" : "records"} cleared</span>
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
        <div className="stat-card stat-recovery">
          <div className="stat-icon">💹</div>
          <div className="stat-info">
            <span className="stat-label">Recovery Rate</span>
            <span className="stat-amount">
              {records.length > 0
                ? Math.round((paidCount / records.length) * 100)
                : 0}%
            </span>
            <span className="stat-count">fines collected</span>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="fine-toolbar">
        <div className="fine-filters">
          {[
            { key: "all", label: "All Fines", icon: "📋" },
            { key: "due", label: "Pending", icon: "🔴" },
            { key: "paid", label: "Cleared", icon: "🟢" },
          ].map((f) => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.icon} {f.label}
              <span className="filter-count">
                {f.key === "all"
                  ? records.length
                  : f.key === "due"
                  ? dueCount
                  : paidCount}
              </span>
            </button>
          ))}
        </div>
        <div className="fine-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="fine-loading">
          <div className="loading-spinner"></div>
          <p>Loading fine records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fine-empty">
          <span className="empty-icon">{searchQuery ? "🔍" : "🎉"}</span>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : `No ${filter !== "all" ? filter : ""} fine records found`}
          </p>
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="fine-table-wrapper">
          <div className="table-meta">
            Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> records
          </div>
          <table className="fine-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Days Overdue</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, idx) => {
                const overdueDays = record.fineStatus === "due" ? getDaysOverdue(record.dueDate) : 0;
                return (
                  <tr key={record._id} className={`fine-row fine-row--${record.fineStatus}`}>
                    <td className="row-num">{idx + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {record.userId?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="user-name">{record.userId?.name || "N/A"}</div>
                          <div className="user-email">{record.userId?.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="book-title">
                      <span title={record.bookId?.title}>{record.bookId?.title || "N/A"}</span>
                    </td>
                    <td className="date-cell">{formatDate(record.dueDate)}</td>
                    <td className="date-cell">
                      {record.returnDate
                        ? formatDate(record.returnDate)
                        : <span className="still-issued">📖 Still Issued</span>}
                    </td>
                    <td>
                      {record.fineStatus === "due" && overdueDays > 0
                        ? <span className="overdue-badge">{overdueDays}d overdue</span>
                        : <span className="no-overdue">—</span>}
                    </td>
                    <td>
                      <span className={`fine-amount ${record.fineStatus === "due" ? "fine-amount--due" : "fine-amount--paid"}`}>
                        ₹{(record.fine || record.fineAmount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`fine-badge fine-badge--${record.fineStatus}`}>
                        {record.fineStatus === "due" ? "🔴 Pending" : "🟢 Cleared"}
                      </span>
                    </td>
                    <td>
                      {record.fineStatus === "due" ? (
                        confirmId === record._id ? (
                          <div className="confirm-btns">
                            <button className="confirm-yes" onClick={() => markPaid(record._id)}>✓ Yes</button>
                            <button className="confirm-no" onClick={() => setConfirmId(null)}>✕ No</button>
                          </div>
                        ) : (
                          <button className="pay-btn" onClick={() => setConfirmId(record._id)}>
                            Mark Paid
                          </button>
                        )
                      ) : (
                        <span className="paid-label">✓ Cleared</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}