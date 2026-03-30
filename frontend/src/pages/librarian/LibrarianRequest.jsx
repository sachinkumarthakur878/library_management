// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Server_URL } from "../../utils/config";
// import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
// import "./LibrarianPages.css";

// export default function LibrarianRequests() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const url = Server_URL + "librarian/issuerequest";
//       const res = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//       });
//       setRequests(res.data.requests);
//     } catch (err) {
//       console.error("Error fetching requests", err);
//       showErrorToast("Failed to load issue requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const approveRequest = async (id) => {
//     try {
//       const url = Server_URL + "librarian/approverequest/" + id;
//       const response = await axios.put(url, {}, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//       });
//       showSuccessToast(response.data.message || "Book issued successfully!");
//       fetchRequests();
//     } catch (err) {
//       if (err.response) {
//         showErrorToast(err.response.data?.error || "Something went wrong");
//       } else {
//         showErrorToast("Network error: " + err.message);
//       }
//     }
//   };

//   return (
//     <div className="lib-page">
//       <div className="lib-header">
//         <div>
//           <h1 className="lib-title">Issue Requests</h1>
//           <p className="lib-subtitle">Approve or manage pending book issue requests</p>
//         </div>
//         <div className="lib-count-badge">{requests.length} pending</div>
//       </div>

//       {loading ? (
//         <div className="lib-loading">
//           <div className="lib-spinner"></div>
//           <p>Fetching requests...</p>
//         </div>
//       ) : requests.length === 0 ? (
//         <div className="lib-empty">
//           <span className="lib-empty-icon">📭</span>
//           <h3>No pending issue requests</h3>
//           <p>All caught up! No new book requests at the moment.</p>
//         </div>
//       ) : (
//         <div className="lib-table-wrapper">
//           <table className="lib-table">
//             <thead>
//               <tr>
//                 <th>User</th>
//                 <th>Book</th>
//                 <th>Request Date</th>
//                 <th>Due Date</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map((req) => (
//                 <tr key={req._id} className="lib-row">
//                   <td>
//                     <div className="lib-user-cell">
//                       <div className="lib-avatar">{req.userId?.name?.[0]?.toUpperCase() || "?"}</div>
//                       <div>
//                         <div className="lib-user-name">{req.userId?.name || "N/A"}</div>
//                         <div className="lib-user-email">{req.userId?.email || ""}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="lib-book-title">{req.bookId?.title || "N/A"}</td>
//                   <td className="lib-date">{new Date(req.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
//                   <td className="lib-date">{new Date(req.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
//                   <td>
//                     <span className="lib-status lib-status--requested">Requested</span>
//                   </td>
//                   <td>
//                     <button
//                       className="lib-approve-btn"
//                       onClick={() => approveRequest(req._id)}
//                     >
//                       Approve Issue
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./LibrarianPages.css";

const FINE_PER_DAY = 10; // ₹10 per day — same as backend fineCalculator.js

export default function LibrarianRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalReq, setModalReq] = useState(null); // the request being approved
  const [issueDays, setIssueDays] = useState(14); // default 14 days

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = Server_URL + "librarian/issuerequest";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      showErrorToast("Failed to load issue requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const openModal = (req) => {
    setModalReq(req);
    setIssueDays(14);
  };

  const closeModal = () => {
    setModalReq(null);
    setIssueDays(14);
  };

  const approveRequest = async () => {
    if (!modalReq) return;
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Number(issueDays));

      const url = Server_URL + "librarian/approverequest/" + modalReq._id;
      const response = await axios.put(
        url,
        { issueDays: Number(issueDays), dueDate: dueDate.toISOString() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
      );
      showSuccessToast(response.data.message || "Book issued successfully!");
      closeModal();
      fetchRequests();
    } catch (err) {
      showErrorToast(err.response?.data?.error || "Something went wrong");
    }
  };

  // Computed values for modal preview
  const dueDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + Number(issueDays));
    return d;
  })();

  const finePerDay = FINE_PER_DAY;
  const maxFineIfLate7 = finePerDay * 7;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const PRESET_DAYS = [7, 14, 21, 30];

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
                <th>#</th>
                <th>User</th>
                <th>Book</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={req._id} className="lib-row">
                  <td className="lib-num">{idx + 1}</td>
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
                  <td className="lib-date">{formatDate(req.issueDate)}</td>
                  <td>
                    <span className="lib-status lib-status--requested">Requested</span>
                  </td>
                  <td>
                    <button className="lib-approve-btn" onClick={() => openModal(req)}>
                      ✅ Approve Issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Modal */}
      {modalReq && (
        <div className="lm-overlay" onClick={closeModal}>
          <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lm-modal-header">
              <div>
                <h2 className="lm-modal-title">Approve Book Issue</h2>
                <p className="lm-modal-sub">Set the issue duration before approving</p>
              </div>
              <button className="lm-close" onClick={closeModal}>✕</button>
            </div>

            {/* Book & User Info */}
            <div className="lm-info-cards">
              <div className="lm-info-card">
                <span className="lm-info-icon">📚</span>
                <div>
                  <div className="lm-info-label">Book</div>
                  <div className="lm-info-value">{modalReq.bookId?.title || "N/A"}</div>
                </div>
              </div>
              <div className="lm-info-card">
                <span className="lm-info-icon">👤</span>
                <div>
                  <div className="lm-info-label">Borrower</div>
                  <div className="lm-info-value">{modalReq.userId?.name || "N/A"}</div>
                  <div className="lm-info-email">{modalReq.userId?.email}</div>
                </div>
              </div>
            </div>

            {/* Days Selector */}
            <div className="lm-section">
              <label className="lm-label">Issue Duration</label>

              <div className="lm-preset-days">
                {PRESET_DAYS.map((d) => (
                  <button
                    key={d}
                    className={`lm-preset-btn ${issueDays === d ? "active" : ""}`}
                    onClick={() => setIssueDays(d)}
                  >
                    {d} days
                  </button>
                ))}
              </div>

              <div className="lm-custom-days">
                <label className="lm-custom-label">Custom days:</label>
                <div className="lm-days-input-wrap">
                  <button
                    className="lm-day-stepper"
                    onClick={() => setIssueDays((p) => Math.max(1, Number(p) - 1))}
                  >−</button>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={issueDays}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(180, Number(e.target.value)));
                      setIssueDays(v);
                    }}
                    className="lm-days-input"
                  />
                  <button
                    className="lm-day-stepper"
                    onClick={() => setIssueDays((p) => Math.min(180, Number(p) + 1))}
                  >+</button>
                  <span className="lm-days-unit">days</span>
                </div>
              </div>
            </div>

            {/* Fine Preview */}
            <div className="lm-fine-preview">
              <div className="lm-fine-row">
                <span className="lm-fine-label">📅 Issue Date</span>
                <span className="lm-fine-val">{formatDate(new Date())}</span>
              </div>
              <div className="lm-fine-row lm-fine-row--highlight">
                <span className="lm-fine-label">⏰ Due Date</span>
                <span className="lm-fine-val lm-fine-val--due">{formatDate(dueDate)}</span>
              </div>
              <div className="lm-fine-divider" />
              <div className="lm-fine-row">
                <span className="lm-fine-label">💸 Fine Rate</span>
                <span className="lm-fine-val">₹{finePerDay} / day after due date</span>
              </div>
              <div className="lm-fine-row lm-fine-row--warn">
                <span className="lm-fine-label">⚠️ Fine if 7 days late</span>
                <span className="lm-fine-val lm-fine-val--warn">₹{maxFineIfLate7}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="lm-modal-actions">
              <button className="lm-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="lm-confirm-btn" onClick={approveRequest}>
                ✅ Issue for {issueDays} days
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}