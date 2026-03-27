import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import "./profile.css";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [issuedRequests, setIssuedRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("issued");
  const [returningId, setReturningId] = useState(null);

  const fetchIssuedBooks = async () => {
    try {
      const response = await axios.get(Server_URL + "books/issued", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const books = response.data.issuedBooks || [];
      setIssuedBooks(books.filter((b) => b.status === "Issued"));
      setIssuedRequests(books.filter((b) => b.status === "Requested"));
      setReturnRequests(books.filter((b) => b.status === "Requested Return"));
    } catch (error) {
      console.error("Error fetching issued books:", error.message);
    }
  };

  async function fetchProfile() {
    try {
      const response = await axios.get(`${Server_URL}users/profile`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  useEffect(() => {
    Promise.all([fetchProfile(), fetchIssuedBooks()]).finally(() => setLoading(false));
  }, []);

  // Return book request - uses correct route: books/returnrequest/:id
  async function returnBook(borrowId) {
    try {
      setReturningId(borrowId);
      const response = await axios.put(
        `${Server_URL}books/returnrequest/${borrowId}`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      showSuccessToast(response.data.message || "Return request submitted!");
      fetchIssuedBooks();
    } catch (error) {
      console.error("Error returning book:", error);
      showErrorToast(error.response?.data?.message || "Something went wrong!");
    } finally {
      setReturningId(null);
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const tabs = [
    { key: "issued", label: "Issued Books", count: issuedBooks.length },
    { key: "requests", label: "My Requests", count: issuedRequests.length },
    { key: "returns", label: "Return Requests", count: returnRequests.length },
  ];

  return (
    <div className="profile-page">
      {/* Profile Card */}
      <div className="profile-hero">
        <div className="profile-hero__inner">
          <div className="profile-avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="profile-badge profile-badge--role">{user?.role}</span>
              {user?.stream && <span className="profile-badge profile-badge--stream">{user?.stream}</span>}
              {user?.year && <span className="profile-badge profile-badge--year">Year {user?.year}</span>}
            </div>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat__num">{issuedBooks.length}</span>
              <span className="profile-stat__label">Books Issued</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__num">{issuedRequests.length}</span>
              <span className="profile-stat__label">Pending</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__num">{returnRequests.length}</span>
              <span className="profile-stat__label">Return Req.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-body">
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && <span className="profile-tab__badge">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Issued Books */}
        {activeTab === "issued" && (
          <div className="profile-section">
            {issuedBooks.length === 0 ? (
              <div className="profile-empty">
                <span>📚</span>
                <p>No books currently issued</p>
              </div>
            ) : (
              <div className="profile-books-grid">
                {issuedBooks.map((book) => (
                  <div key={book._id} className={`profile-book-card ${isOverdue(book.dueDate) ? "profile-book-card--overdue" : ""}`}>
                    <div className="profile-book__cover">
                      <img
                        src={book.bookId?.coverImage || "https://via.placeholder.com/80x110?text=Book"}
                        alt={book.bookId?.title}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/80x110?text=Book"; }}
                      />
                    </div>
                    <div className="profile-book__info">
                      <h4 className="profile-book__title">{book.bookId?.title}</h4>
                      <p className="profile-book__author">{book.bookId?.author}</p>
                      <div className="profile-book__dates">
                        <span>Issued: {formatDate(book.issueDate)}</span>
                        <span className={isOverdue(book.dueDate) ? "date--overdue" : ""}>
                          Due: {formatDate(book.dueDate)}
                          {isOverdue(book.dueDate) && " ⚠️"}
                        </span>
                      </div>
                      {book.fine > 0 && (
                        <div className="profile-book__fine">Fine: ₹{book.fine}</div>
                      )}
                    </div>
                    <div className="profile-book__action">
                      <button
                        className="profile-return-btn"
                        onClick={() => returnBook(book._id)}
                        disabled={returningId === book._id}
                      >
                        {returningId === book._id ? "..." : "Request Return"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests */}
        {activeTab === "requests" && (
          <div className="profile-section">
            {issuedRequests.length === 0 ? (
              <div className="profile-empty"><span>📝</span><p>No pending issue requests</p></div>
            ) : (
              <div className="profile-table-wrap">
                <table className="profile-table">
                  <thead>
                    <tr><th>Book Title</th><th>Request Date</th><th>Due Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {issuedRequests.map((book) => (
                      <tr key={book._id}>
                        <td className="pt-book">{book.bookId?.title}</td>
                        <td>{formatDate(book.issueDate)}</td>
                        <td>{formatDate(book.dueDate)}</td>
                        <td><span className="profile-status profile-status--requested">Requested</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Return Requests */}
        {activeTab === "returns" && (
          <div className="profile-section">
            {returnRequests.length === 0 ? (
              <div className="profile-empty"><span>🔄</span><p>No pending return requests</p></div>
            ) : (
              <div className="profile-table-wrap">
                <table className="profile-table">
                  <thead>
                    <tr><th>Book Title</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {returnRequests.map((book) => (
                      <tr key={book._id}>
                        <td className="pt-book">{book.bookId?.title}</td>
                        <td>{formatDate(book.issueDate)}</td>
                        <td>{formatDate(book.dueDate)}</td>
                        <td><span className="profile-status profile-status--return">Return Pending</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;