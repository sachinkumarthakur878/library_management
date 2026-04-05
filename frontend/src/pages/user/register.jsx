import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function Register() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = { ...data, role: "user" };
      await axios.post(`${Server_URL}users/register`, formData);
      showSuccessToast("Registration Successful! Please login.");
      reset();
      navigate("/login");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Registration Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-brand-icon">📚</span>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the A & R Library community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              className={`auth-input ${errors.name ? "auth-input--error" : ""}`}
              placeholder="Your full name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <span className="auth-error">{errors.name.message}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span className="auth-error">{errors.email.message}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
              placeholder="Create a strong password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
            />
            {errors.password && <span className="auth-error">{errors.password.message}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Stream / Course</label>
            <input
              type="text"
              className={`auth-input ${errors.stream ? "auth-input--error" : ""}`}
              placeholder="e.g. B.Tech CSE, BCA, MBA"
              {...register("stream", { required: "Stream is required" })}
            />
            {errors.stream && <span className="auth-error">{errors.stream.message}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Year</label>
            <select
              className={`auth-select ${errors.year ? "auth-input--error" : ""}`}
              {...register("year", { required: "Year is required" })}
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            {errors.year && <span className="auth-error">{errors.year.message}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}