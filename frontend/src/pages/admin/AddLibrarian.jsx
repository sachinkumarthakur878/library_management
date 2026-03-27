import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./addLibrarian.css";

export default function AddLibrarian() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = { ...data, role: "librarian" };
      const authToken = localStorage.getItem("authToken");

      await axios.post(Server_URL + "admin/addlibrarian", formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      showSuccessToast("Librarian added successfully!");
      reset();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Failed to add librarian!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addlib-page">
      <div className="addlib-container">
        <div className="addlib-header">
          <h1 className="addlib-title">Add Librarian</h1>
          <p className="addlib-subtitle">Create a new librarian account with access to manage books and requests</p>
        </div>

        <div className="addlib-card">
          <div className="addlib-card__icon">🧑‍💼</div>

          <form onSubmit={handleSubmit(onSubmit)} className="addlib-form">
            <div className="addlib-field">
              <label className="addlib-label">Full Name</label>
              <input
                type="text"
                className={`addlib-input ${errors.name ? "addlib-input--error" : ""}`}
                placeholder="Librarian's full name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <span className="addlib-error">{errors.name.message}</span>}
            </div>

            <div className="addlib-field">
              <label className="addlib-label">Email Address</label>
              <input
                type="email"
                className={`addlib-input ${errors.email ? "addlib-input--error" : ""}`}
                placeholder="librarian@library.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <span className="addlib-error">{errors.email.message}</span>}
            </div>

            <div className="addlib-field">
              <label className="addlib-label">Password</label>
              <input
                type="password"
                className={`addlib-input ${errors.password ? "addlib-input--error" : ""}`}
                placeholder="Set a strong password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" }
                })}
              />
              {errors.password && <span className="addlib-error">{errors.password.message}</span>}
            </div>

            <div className="addlib-info">
              <span>ℹ️</span>
              <p>This account will have librarian-level access: approve/reject book requests, manage returns, and view fines.</p>
            </div>

            <button type="submit" className="addlib-submit" disabled={loading}>
              {loading ? (
                <><span className="addlib-spinner"></span> Adding...</>
              ) : (
                "➕ Add Librarian"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}