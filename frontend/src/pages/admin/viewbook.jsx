import { useState, useEffect } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./viewbook.css";

const ViewBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "", author: "", category: "", isbn: "", price: "", totalCopies: "",
  });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(Server_URL + "books", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setBooks(response.data.books || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      showErrorToast("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`${Server_URL}books/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      showSuccessToast("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      showErrorToast("Failed to delete book!");
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title, author: book.author, category: book.category,
      isbn: book.isbn, price: book.price, totalCopies: book.totalCopies,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await axios.put(`${Server_URL}books/update/${selectedBook._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      showSuccessToast("Book updated successfully!");
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      showErrorToast("Failed to update book!");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="viewbook-page">
      <div className="viewbook-header">
        <div>
          <h1 className="viewbook-title">Manage Books</h1>
          <p className="viewbook-subtitle">Edit or delete books from the library catalog</p>
        </div>
        <span className="viewbook-count">{books.length} books</span>
      </div>

      {loading ? (
        <div className="viewbook-loading">
          <div className="viewbook-spinner"></div>
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="viewbook-empty">
          <span>📚</span>
          <p>No books found. Add some books first.</p>
        </div>
      ) : (
        <div className="viewbook-grid">
          {books.map((book) => (
            <div key={book._id} className="vbook-card">
              <div className="vbook-card__img-wrap">
                <img
                  src={book.coverImage || "https://via.placeholder.com/200x280?text=No+Cover"}
                  alt={book.title}
                  className="vbook-card__img"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/200x280?text=No+Cover"; }}
                />
                <div className={`vbook-card__avail ${book.availableCopies > 0 ? "avail--in" : "avail--out"}`}>
                  {book.availableCopies}/{book.totalCopies}
                </div>
              </div>
              <div className="vbook-card__body">
                <h5 className="vbook-card__title">{book.title}</h5>
                <p className="vbook-card__author">by {book.author}</p>
                <div className="vbook-card__meta">
                  <span className="vbook-tag">{book.category}</span>
                  <span className="vbook-price">₹{book.price}</span>
                </div>
              </div>
              <div className="vbook-card__footer">
                <button className="vbook-btn vbook-btn--edit" onClick={() => handleEdit(book)}>
                  ✏️ Edit
                </button>
                <button className="vbook-btn vbook-btn--delete" onClick={() => handleDelete(book._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedBook && (
        <div className="vbook-modal-overlay" onClick={(e) => { if (e.target.classList.contains("vbook-modal-overlay")) setShowModal(false); }}>
          <div className="vbook-modal">
            <div className="vbook-modal__header">
              <h3>Edit Book</h3>
              <button className="vbook-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="vbook-modal__body">
              <div className="vbook-modal__row">
                <div className="vbook-modal__field">
                  <label>Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} />
                </div>
                <div className="vbook-modal__field">
                  <label>Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleChange} />
                </div>
              </div>
              <div className="vbook-modal__row">
                <div className="vbook-modal__field">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} />
                </div>
                <div className="vbook-modal__field">
                  <label>ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} />
                </div>
              </div>
              <div className="vbook-modal__row">
                <div className="vbook-modal__field">
                  <label>Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="vbook-modal__field">
                  <label>Total Copies</label>
                  <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="vbook-modal__footer">
              <button className="vbook-modal__cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="vbook-modal__save" onClick={handleUpdate} disabled={updating}>
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBooks;