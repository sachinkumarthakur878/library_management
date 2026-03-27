import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./bookdetails.css";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState(null);

  // FIX: correct URL is books/borrow/request-issue/:bookid
  async function issueBook(bookid) {
    try {
      setIsIssuing(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showErrorToast("Please login to issue a book.");
        navigate("/login");
        return;
      }
      const response = await axios.post(
        `${Server_URL}books/borrow/request-issue/${bookid}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const { error, message } = response.data;
      if (error) {
        showErrorToast(message);
      } else {
        showSuccessToast(message || "Issue request submitted! Wait for librarian approval.");
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsIssuing(false);
    }
  }

  useEffect(() => {
    async function fetchBook() {
      try {
        setIsLoading(true);
        const response = await axios.get(`${Server_URL}books/${id}`);
        setBook(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError("Failed to load book details.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  if (isLoading) return (
    <div className="bd-loading">
      <div className="bd-spinner"></div>
      <p>Loading book details...</p>
    </div>
  );

  if (error) return (
    <div className="bd-error">
      <span>⚠️</span>
      <p>{error}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!book) return (
    <div className="bd-error">
      <span>📚</span>
      <p>Book not found</p>
      <button onClick={() => navigate("/books")}>Browse Books</button>
    </div>
  );

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bd-page">
      <div className="bd-container">
        {/* Back button */}
        <button className="bd-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="bd-layout">
          {/* Left: Cover */}
          <div className="bd-cover-col">
            <div className="bd-cover-wrap">
              <img
                src={book.coverImage || "https://via.placeholder.com/300x420?text=No+Cover"}
                alt={book.title}
                className="bd-cover-img"
                onError={(e) => { e.target.src = "https://via.placeholder.com/300x420?text=No+Cover"; }}
              />
              <div className={`bd-avail-badge ${isAvailable ? "bd-avail--yes" : "bd-avail--no"}`}>
                {isAvailable ? `${book.availableCopies} Available` : "Out of Stock"}
              </div>
            </div>

            <button
              className={`bd-issue-btn ${!isAvailable ? "bd-issue-btn--disabled" : ""}`}
              onClick={() => issueBook(book._id)}
              disabled={!isAvailable || isIssuing}
            >
              {isIssuing ? (
                <><span className="bd-btn-spinner"></span> Requesting...</>
              ) : isAvailable ? (
                "📖 Issue This Book"
              ) : (
                "Out of Stock"
              )}
            </button>
          </div>

          {/* Right: Info */}
          <div className="bd-info-col">
            <div className="bd-info-header">
              <span className="bd-category-tag">{book.category}</span>
              <h1 className="bd-title">{book.title}</h1>
              <p className="bd-author">by <strong>{book.author}</strong></p>
            </div>

            <div className="bd-meta-grid">
              <div className="bd-meta-item">
                <span className="bd-meta-label">ISBN</span>
                <span className="bd-meta-value">{book.isbn}</span>
              </div>
              <div className="bd-meta-item">
                <span className="bd-meta-label">Price</span>
                <span className="bd-meta-value bd-meta-value--price">₹{book.price}</span>
              </div>
              <div className="bd-meta-item">
                <span className="bd-meta-label">Total Copies</span>
                <span className="bd-meta-value">{book.totalCopies}</span>
              </div>
              <div className="bd-meta-item">
                <span className="bd-meta-label">Available</span>
                <span className={`bd-meta-value ${isAvailable ? "bd-meta-value--avail" : "bd-meta-value--out"}`}>
                  {book.availableCopies}
                </span>
              </div>
              {book.addedBy && (
                <div className="bd-meta-item bd-meta-item--full">
                  <span className="bd-meta-label">Added By</span>
                  <span className="bd-meta-value">{book.addedBy?.name || "Admin"}</span>
                </div>
              )}
            </div>

            <div className="bd-description">
              <h3 className="bd-desc-heading">About this Book</h3>
              <p className="bd-desc-text">
                {book.description || "No description available for this book."}
              </p>
            </div>

            <div className="bd-note">
              <span>ℹ️</span>
              <p>Book issue requests require librarian approval. You can track your request in your profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;