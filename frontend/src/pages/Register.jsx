import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      secondName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().min(2).required("First name is required"),
      secondName: Yup.string().min(2).required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Min 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
      gender: Yup.string()
        .oneOf(["male", "female", "other"])
        .required("Gender is required"),
    }),
    onSubmit: async (values) => {
      // setIsLoading(true);
      // setServerError("");
      // try {
      //   const { confirmPassword, ...payload } = values;
      //   const response = await fetch("/api/auth/register", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(payload),
      //   });
      //   const data = await response.json();
      //   if (!response.ok) {
      //     setServerError(data.message || "Registration failed.");
      //   } else {
      //     navigate("/login");
      //   }
      // } catch {
      //   setServerError("Network error. Please try again.");
      // } finally {
      //   setIsLoading(false);
      // }
      setIsLoading(true);
      // TEMP: mock register — remove when backend is ready
      setTimeout(() => {
        navigate("/login");
        setIsLoading(false);
      }, 800);
    },
  });

  return (
    <div className="auth-bg">
      <div className="book-container">
        <div className="book-form-overlay register">
          <div className="page-header">
            <h1 className="journal-title">Book Tracker</h1>
            <div className="title-underline" />
            <p className="page-subtitle">Create Your Account</p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="journal-form"
          >
            {serverError && <div className="server-error">{serverError}</div>}

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`journal-input ${formik.touched.firstName && formik.errors.firstName ? "input-error" : ""}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  placeholder={
                    formik.touched.firstName &&
                      formik.errors.firstName &&
                      !formik.values.firstName
                      ? formik.errors.firstName
                      : "John"
                  }
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="secondName">
                  Last Name
                </label>
                <input
                  id="secondName"
                  name="secondName"
                  type="text"
                  className={`journal-input ${formik.touched.secondName && formik.errors.secondName ? "input-error" : ""}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.secondName}
                  placeholder={
                    formik.touched.secondName &&
                      formik.errors.secondName &&
                      !formik.values.secondName
                      ? formik.errors.secondName
                      : "Doe"
                  }
                />
              </div>
            </div>
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

            <div className="field-group">
              <label className="field-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className={`journal-input journal-select ${formik.touched.gender && formik.errors.gender ? "input-error" : ""}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.gender}
                style={{
                  color: formik.values.gender
                    ? "#2d1800"
                    : formik.touched.gender && formik.errors.gender
                      ? "#8b1a1a"
                      : "#b09060",
                }}
              >
                <option value="" style={{ color: "#aa464687" }}>
                  {formik.touched.gender && formik.errors.gender
                    ? formik.errors.gender
                    : "Select gender"}
                </option>
                <option value="male" style={{ color: "#2d1800" }}>
                  Male
                </option>
                <option value="female" style={{ color: "#2d1800" }}>
                  Female
                </option>
                <option value="other" style={{ color: "#2d1800" }}>
                  Other
                </option>
              </select>
            </div>

            <div className="field-group" style={{ position: "relative" }}>
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
                  style={{
                    position: "absolute",
                    right: "0.3rem",
                    top: "0.9rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9b7320",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
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
            <div className="field-group" style={{ position: "relative" }}>
              <label className="field-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`journal-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "input-error" : ""}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                placeholder={
                  formik.touched.confirmPassword &&
                    formik.errors.confirmPassword &&
                    !formik.values.confirmPassword
                    ? formik.errors.confirmPassword
                    : "••••••••"
                }
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword &&
                formik.values.confirmPassword && (
                  <span className="error-msg">
                    {formik.errors.confirmPassword}
                  </span>
                )}
              {formik.values.confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "0.3rem",
                    top: "0.9rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9b7320",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showConfirm ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width="16"
                      height="16"
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
                      height="16"
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
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <p className="switch-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
