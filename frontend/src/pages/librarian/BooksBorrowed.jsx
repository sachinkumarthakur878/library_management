import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import "./LibrarianPages.css";

export default function BooksBorrowed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = Server_URL + "librarian/bookissued";
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="lib-page">
      <div className="lib-header">
        <div>
          <h1 className="lib-title">Books Issued</h1>
          <p className="lib-subtitle">All currently issued books across all users</p>
        </div>
        <div className="lib-count-badge">{requests.length} issued</div>
      </div>

      {loading ? (
        <div className="lib-loading">
          <div className="lib-spinner"></div>
          <p>Loading issued books...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="lib-empty">
          <span className="lib-empty-icon">📚</span>
          <h3>No books currently issued</h3>
          <p>Issue requests will appear here once approved.</p>
        </div>
      ) : (
        <div className="lib-table-wrapper">
          <table className="lib-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Live Fine</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className={`lib-row ${isOverdue(req.dueDate) ? "lib-row--overdue" : ""}`}>
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
                  <td className={`lib-date ${isOverdue(req.dueDate) ? "lib-date--overdue" : ""}`}>
                    {new Date(req.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {isOverdue(req.dueDate) && <span className="overdue-tag"> Overdue</span>}
                  </td>
                  <td>
                    <span className={`lib-fine ${(req.fine || 0) > 0 ? "lib-fine--due" : "lib-fine--none"}`}>
                      ₹{req.fine || 0}
                    </span>
                  </td>
                  <td>
                    <span className="lib-status lib-status--issued">Issued</span>
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
