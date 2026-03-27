import { useEffect, useState } from "react";
import axios from "axios";
import "./books.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Issue a book - URL is correct: books/borrow/request-issue/:bookid
  async function issueBook(bookid) {
    try {
      setIssuingId(bookid);
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
        showSuccessToast(message);
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIssuingId(null);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${Server_URL}books`)
      .then((response) => {
        if (!response.data.error) {
          const booksData = response.data.books;
          setBooks(booksData);
          const uniqueCategories = ["All", ...new Set(booksData.map(b => b.category))];
          setCategories(uniqueCategories);

          // Read category from URL query param
          const catParam = searchParams.get("category");
          if (catParam) {
            setSelectedCategory(catParam);
            setFilteredBooks(booksData.filter(b => b.category === catParam));
          } else {
            setFilteredBooks(booksData);
          }
        }
      })
      .catch((error) => console.error("Error fetching books:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    filterBooks(val, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterBooks(searchTerm, category);
  };

  const filterBooks = (search, category) => {
    let filtered = books;
    if (category !== "All") filtered = filtered.filter(b => b.category === category);
    if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
    setFilteredBooks(filtered);
  };

  return (
    <div className="books-page">
      {/* Sidebar */}
      <aside className="books-sidebar">
        <h3 className="books-sidebar__title">Categories</h3>
        <div className="books-sidebar__list">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`books-sidebar__item ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
              <span className="books-sidebar__count">
                {cat === "All" ? books.length : books.filter(b => b.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="books-main">
        <div className="books-main__header">
          <div>
            <h2 className="books-main__title">
              {selectedCategory === "All" ? "All Books" : selectedCategory}
            </h2>
            <p className="books-main__count">{filteredBooks.length} books found</p>
          </div>
          <div className="books-search">
            <svg className="books-search__icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="books-search__input"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="books-loading">
            <div className="books-loading__spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-card__img-wrap" onClick={() => navigate(`/bookdetails/${book._id}`)}>
                  <img
                    src={book.coverImage || "https://via.placeholder.com/200x280?text=No+Cover"}
                    alt={book.title}
                    className="book-card__img"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x280?text=No+Cover"; }}
                  />
                  <div className="book-card__category">{book.category}</div>
                  <div className={`book-card__avail ${book.availableCopies > 0 ? "avail--yes" : "avail--no"}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} avail.` : "Unavailable"}
                  </div>
                </div>
                <div className="book-card__body">
                  <h5 className="book-card__title" onClick={() => navigate(`/bookdetails/${book._id}`)}>
                    {book.title}
                  </h5>
                  <p className="book-card__author">by {book.author}</p>
                  <div className="book-card__footer">
                    <span className="book-card__price">₹{book.price}</span>
                    <div className="book-card__actions">
                      <button
                        className="book-card__btn book-card__btn--outline"
                        onClick={() => navigate(`/bookdetails/${book._id}`)}
                      >
                        Details
                      </button>
                      <button
                        className="book-card__btn book-card__btn--primary"
                        onClick={() => issueBook(book._id)}
                        disabled={book.availableCopies <= 0 || issuingId === book._id}
                      >
                        {issuingId === book._id ? "..." : "Issue"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="books-empty">
            <span className="books-empty__icon">📭</span>
            <h4>No books found</h4>
            <p>Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Books;