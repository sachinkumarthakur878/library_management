import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { Server_URL } from "../../utils/config";
import "./AdminDashboard.css";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [user, setUser] = useState([]);
  const [lib, setLib] = useState([]);
  const [books, setBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [totalUser, setTotalUser] = useState(0);
  const [totalLib, setTotalLib] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [fineRecords, setFineRecords] = useState([]);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ["#6366f1", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e"],
      borderWidth: 0,
    }],
  });

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  async function getUsers() {
    try {
      const result = await axios.get(Server_URL + "users");
      if (!result.data.error) {
        const students = result.data.user.filter((u) => u.role === "user");
        const librarians = result.data.user.filter((u) => u.role === "librarian");
        setUser(students);
        setLib(librarians);
        setTotalUser(students.length);
        setTotalLib(librarians.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function getBooks() {
    try {
      const result = await axios.get(Server_URL + "books");
      if (!result.data.error) {
        const { books, totalBooks } = result.data;
        setBooks(books);
        setTotalBooks(totalBooks);
        const categoryCount = books.reduce((acc, book) => {
          acc[book.category] = (acc[book.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData({
          labels: Object.keys(categoryCount),
          datasets: [{
            data: Object.values(categoryCount),
            backgroundColor: ["#6366f1", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e"],
            borderWidth: 0,
          }],
        });
        const borrowed = books.reduce((acc, book) => acc + (book.totalCopies - book.availableCopies), 0);
        setBorrowedBooks(borrowed);
        const total = books.reduce((acc, book) => acc + book.totalCopies, 0);
        setOccupancyPercent(total ? Math.round((borrowed / total) * 100) : 0);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  async function getLatestBooks() {
    try {
      const result = await axios.get(Server_URL + "books/new");
      if (!result.data.error) setLatestBooks(result.data.books);
    } catch (error) {
      console.error("Error fetching latest books:", error);
    }
  }

  async function getFines() {
    try {
      const result = await axios.get(Server_URL + "librarian/fines", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFineRecords(result.data.records || []);
    } catch (error) {
      console.error("Error fetching fines:", error);
    }
  }

  useEffect(() => {
    getUsers();
    getBooks();
    getLatestBooks();
    getFines();
  }, []);

  const totalDueFine = fineRecords.filter(r => r.fineStatus === "due").reduce((sum, r) => sum + (r.fine || 0), 0);
  const totalPaidFine = fineRecords.filter(r => r.fineStatus === "paid").reduce((sum, r) => sum + (r.fine || 0), 0);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    ...(role === "admin" ? [{ key: "librarians", label: "Librarians", icon: "🧑‍💼" }] : []),
    { key: "books", label: "Books", icon: "📖" },
  ];

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__header">
          <span className="dash-sidebar__role-badge">{role === "admin" ? "Admin" : "Librarian"}</span>
          <p className="dash-sidebar__title">Control Panel</p>
        </div>
        <nav className="dash-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`dash-sidebar__btn ${selectedSection === item.key ? "active" : ""}`}
              onClick={() => setSelectedSection(item.key)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-sidebar__footer">
          <Link to="/admin/fines" className="dash-sidebar__fine-link">
            💰 Fine Management
            {fineRecords.filter(r => r.fineStatus === "due").length > 0 && (
              <span className="dash-sidebar__fine-badge">
                {fineRecords.filter(r => r.fineStatus === "due").length}
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {selectedSection === "dashboard" && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Overview</h2>
              <p className="dash-section__sub">Welcome back, your library at a glance</p>
            </div>

            {/* Stats */}
            <div className="dash-stats">
              <div className="dash-stat dash-stat--indigo">
                <div className="dash-stat__icon">📚</div>
                <div className="dash-stat__info">
                  <span className="dash-stat__num">{totalBooks}</span>
                  <span className="dash-stat__label">Total Books</span>
                </div>
              </div>
              <div className="dash-stat dash-stat--violet">
                <div className="dash-stat__icon">👥</div>
                <div className="dash-stat__info">
                  <span className="dash-stat__num">{totalUser}</span>
                  <span className="dash-stat__label">Registered Users</span>
                </div>
              </div>
              <div className="dash-stat dash-stat--amber">
                <div className="dash-stat__icon">📤</div>
                <div className="dash-stat__info">
                  <span className="dash-stat__num">{borrowedBooks}</span>
                  <span className="dash-stat__label">Books Borrowed</span>
                </div>
              </div>
              <div className="dash-stat dash-stat--red">
                <div className="dash-stat__icon">⏰</div>
                <div className="dash-stat__info">
                  <span className="dash-stat__num">₹{totalDueFine}</span>
                  <span className="dash-stat__label">Fines Due</span>
                </div>
              </div>
              <div className="dash-stat dash-stat--green">
                <div className="dash-stat__icon">✅</div>
                <div className="dash-stat__info">
                  <span className="dash-stat__num">₹{totalPaidFine}</span>
                  <span className="dash-stat__label">Fines Collected</span>
                </div>
              </div>
              {role === "admin" && (
                <div className="dash-stat dash-stat--teal">
                  <div className="dash-stat__icon">🧑‍💼</div>
                  <div className="dash-stat__info">
                    <span className="dash-stat__num">{totalLib}</span>
                    <span className="dash-stat__label">Librarians</span>
                  </div>
                </div>
              )}
            </div>

            {/* Occupancy Bar */}
            <div className="dash-occupancy">
              <div className="dash-occupancy__header">
                <span>Book Occupancy Rate</span>
                <span className="dash-occupancy__pct">{occupancyPercent}%</span>
              </div>
              <div className="dash-occupancy__bar-track">
                <div
                  className="dash-occupancy__bar-fill"
                  style={{ width: `${occupancyPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Chart + Recent */}
            <div className="dash-lower">
              <div className="dash-chart-card">
                <h3>Category Distribution</h3>
                <div className="dash-chart-wrap">
                  <Pie
                    data={categoryData}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 16,
                            usePointStyle: true,
                            color: "#9ca3af",
                            font: { size: 12, family: "DM Sans" },
                          },
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>

              <div className="dash-recent-card">
                <h3>Recent Additions</h3>
                <div className="dash-recent-list">
                  {latestBooks.slice(0, 5).map((book, index) => (
                    <div key={index} className="dash-recent-item">
                      <div className="dash-recent-icon">📘</div>
                      <div className="dash-recent-text">
                        <span className="dash-recent-title">{book.title}</span>
                        <span className="dash-recent-by">by {book.addedBy?.name || "Unknown"}</span>
                      </div>
                    </div>
                  ))}
                  {latestBooks.length === 0 && <p className="dash-recent-empty">No recent additions</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSection === "users" && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Users Management</h2>
              <span className="dash-section__count">{totalUser} users</span>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Stream</th>
                  </tr>
                </thead>
                <tbody>
                  {user.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="dash-user-cell">
                          <div className="dash-user-avatar">{data.name?.[0]?.toUpperCase()}</div>
                          {data.name}
                        </div>
                      </td>
                      <td className="dash-email">{data.email}</td>
                      <td><span className="dash-tag">{data.stream || "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSection === "librarians" && role === "admin" && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Librarians Management</h2>
              <span className="dash-section__count">{totalLib} librarians</span>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {lib.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="dash-user-cell">
                          <div className="dash-user-avatar dash-user-avatar--lib">{data.name?.[0]?.toUpperCase()}</div>
                          {data.name}
                        </div>
                      </td>
                      <td className="dash-email">{data.email}</td>
                      <td><span className="dash-tag dash-tag--lib">{data.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSection === "books" && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Books Inventory</h2>
              <span className="dash-section__count">{totalBooks} books</span>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th><th>Title</th><th>Author</th><th>Category</th><th>Total</th><th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="dash-book-title">{data.title}</td>
                      <td>{data.author}</td>
                      <td><span className="dash-tag">{data.category}</span></td>
                      <td>{data.totalCopies}</td>
                      <td>
                        <span className={`dash-avail ${data.availableCopies === 0 ? "dash-avail--out" : "dash-avail--in"}`}>
                          {data.availableCopies}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
