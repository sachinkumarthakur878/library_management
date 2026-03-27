import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${Server_URL}users/login`, data);
      const { role, token } = response.data.user;

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("role", role);

      showSuccessToast("Login Successful!");

      if (role === "admin" || role === "librarian") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-brand-icon">📚</span>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your library account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              {/* BUG FIX: was /forgetpassword (lowercase p), correct route is /forgetPassword */}
              <Link to="/forgetPassword" className="auth-forgot">Forgot password?</Link>
            </div>
            <input
              type="password"
              className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className="auth-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-switch__link">Create one</Link>
        </p>
      </div>
    </div>
  );
}