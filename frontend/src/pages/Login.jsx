import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Min 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setServerError("");
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) {
          setServerError(data.message || "Login failed.");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.is_admin ? "admin" : "user");
          localStorage.setItem("first_name", data.user.first_name);
          localStorage.setItem("second_name", data.user.second_name);
          if (data.user.is_admin) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }
      } catch {
        setServerError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
      // setIsLoading(true);
      // // TEMP: mock login — remove when backend is ready
      // setTimeout(() => {
      //   localStorage.setItem("token", "mock-token");
      //   navigate("/dashboard");
      //   setIsLoading(false);
      // }, 800);
    },
  });

  return (
    <div className="auth-bg">
      <div className="book-container">
        <div className="book-form-overlay">
          <div className="page-header">
            <h1 className="journal-title">Book Tracker</h1>
            <div className="title-underline" />
            <p className="page-subtitle">Welcome Back</p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="journal-form"
          >
            {serverError && <div className="server-error">{serverError}</div>}

            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`journal-input ${formik.touched.email && formik.errors.email ? "input-error" : ""}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder={
                  formik.touched.email &&
                    formik.errors.email &&
                    !formik.values.email
                    ? formik.errors.email
                    : "your@email.com"
                }
              />
              {formik.touched.email &&
                formik.errors.email &&
                formik.values.email && (
                  <span className="error-msg">{formik.errors.email}</span>
                )}
            </div>

            <div className="input-wrapper">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`journal-input ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder={
                  formik.touched.password &&
                    formik.errors.password &&
                    !formik.values.password
                    ? formik.errors.password
                    : "••••••••"
                }
              />
              {formik.touched.password &&
                formik.errors.password &&
                formik.values.password && (
                  <span className="error-msg">{formik.errors.password}</span>
                )}
              {formik.values.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width="16"
                      height="15"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width="16"
                      height="15"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <p className="switch-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
