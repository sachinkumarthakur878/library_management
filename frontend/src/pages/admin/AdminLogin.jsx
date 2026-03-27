import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
// Reusing the same auth CSS as user login
import "../user/login.css";

const AdminLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(Server_URL + "admin/login", data);
      showSuccessToast("Login Successful!");

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("role", response.data.role || "admin");

      navigate("/admin");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: "#0a0c14" }}>
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-brand-icon">🔐</span>
          <h2 className="auth-title">Admin Portal</h2>
          <p className="auth-subtitle">Sign in to manage the library</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
              placeholder="admin@library.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span className="auth-error">{errors.email.message}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className="auth-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;