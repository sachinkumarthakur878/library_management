import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./addbook.css";

const AddBookForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key !== "coverImage") formData.append(key, data[key]);
      });

      if (data.coverImage && data.coverImage[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(Server_URL + "books/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { error, message } = response.data;
      if (error) {
        showErrorToast(message);
      } else {
        showSuccessToast(message || "Book added successfully!");
        reset();
        setPreviewImg(null);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Failed to add book!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addbook-page">
      <div className="addbook-container">
        <div className="addbook-header">
          <h1 className="addbook-title">Add New Book</h1>
          <p className="addbook-subtitle">Fill in the details to add a book to the library catalog</p>
        </div>

        <div className="addbook-layout">
          {/* Cover Preview */}
          <div className="addbook-preview">
            <div className="addbook-preview__box">
              {previewImg ? (
                <img src={previewImg} alt="Preview" className="addbook-preview__img" />
              ) : (
                <div className="addbook-preview__placeholder">
                  <span>📚</span>
                  <p>Cover Preview</p>
                </div>
              )}
            </div>
            <label className="addbook-preview__upload">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                {...register("coverImage")}
                onChange={(e) => {
                  register("coverImage").onChange(e);
                  handleImageChange(e);
                }}
              />
              Choose Cover Image
            </label>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="addbook-form">
            <div className="addbook-row">
              <div className="addbook-field">
                <label className="addbook-label">Book Title *</label>
                <input
                  type="text"
                  className={`addbook-input ${errors.title ? "addbook-input--error" : ""}`}
                  placeholder="Enter book title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <span className="addbook-error">{errors.title.message}</span>}
              </div>

              <div className="addbook-field">
                <label className="addbook-label">Author *</label>
                <input
                  type="text"
                  className={`addbook-input ${errors.author ? "addbook-input--error" : ""}`}
                  placeholder="Author name"
                  {...register("author", { required: "Author is required" })}
                />
                {errors.author && <span className="addbook-error">{errors.author.message}</span>}
              </div>
            </div>

            <div className="addbook-row">
              <div className="addbook-field">
                <label className="addbook-label">Category *</label>
                <select
                  className={`addbook-select ${errors.category ? "addbook-input--error" : ""}`}
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select Category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-fiction">Non-fiction</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Technology">Technology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Literature">Literature</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Biography">Biography</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span className="addbook-error">{errors.category.message}</span>}
              </div>

              <div className="addbook-field">
                <label className="addbook-label">ISBN *</label>
                <input
                  type="text"
                  className={`addbook-input ${errors.isbn ? "addbook-input--error" : ""}`}
                  placeholder="e.g. 978-3-16-148410-0"
                  {...register("isbn", { required: "ISBN is required" })}
                />
                {errors.isbn && <span className="addbook-error">{errors.isbn.message}</span>}
              </div>
            </div>

            <div className="addbook-row">
              <div className="addbook-field">
                <label className="addbook-label">Total Copies *</label>
                <input
                  type="number"
                  className={`addbook-input ${errors.totalCopies ? "addbook-input--error" : ""}`}
                  placeholder="Number of copies"
                  min="1"
                  {...register("totalCopies", { required: true, min: 1 })}
                />
                {errors.totalCopies && <span className="addbook-error">Min 1 copy required</span>}
              </div>

              <div className="addbook-field">
                <label className="addbook-label">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className={`addbook-input ${errors.price ? "addbook-input--error" : ""}`}
                  placeholder="Book price"
                  {...register("price", { required: true })}
                />
                {errors.price && <span className="addbook-error">Price is required</span>}
              </div>
            </div>

            <div className="addbook-field">
              <label className="addbook-label">Description *</label>
              <textarea
                className={`addbook-textarea ${errors.description ? "addbook-input--error" : ""}`}
                rows="4"
                placeholder="Brief description of the book..."
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && <span className="addbook-error">{errors.description.message}</span>}
            </div>

            <button type="submit" className="addbook-submit" disabled={loading}>
              {loading ? (
                <><span className="addbook-spinner"></span> Adding Book...</>
              ) : (
                "➕ Add Book to Library"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookForm;