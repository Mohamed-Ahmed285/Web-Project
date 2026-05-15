import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import "./ProfilePage.css";
 
const DEFAULT_USER = {
  first_name: "",
  second_name: "",
  email: "",
  profile_image: "",
  createdAt: "",
};
 
export default function ProfilePage() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [form, setForm] = useState({ firstName: "", secondName: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const fileRef = useRef();
  const navigate = useNavigate();
 
  const fullName = `${user.first_name || ""} ${user.second_name || ""}`.trim();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
 
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setApiError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing authorization token");

        const response = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        setUser(data);
        setForm({ firstName: data.first_name || "", secondName: data.second_name || "", email: data.email });
        setAvatarPreview(data.profile_image || null);
        setAvatarFile(null);
      } catch (error) {
        console.error("Profile fetch failed", error);
        setApiError(error.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
 
  const handleBack = () => {
    const role = localStorage.getItem("role");
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };
 
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
 
  const handleSave = async () => {
    setApiError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing authorization token");

      const formData = new FormData();
      formData.append("firstName", form.firstName.trim());
      formData.append("secondName", form.secondName.trim());
      formData.append("email", form.email.trim());
      if (avatarFile) {
        formData.append("profile_image", avatarFile);
      }

      const response = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile");
      }

      setUser(data);
      setForm({ firstName: data.first_name || "", secondName: data.second_name || "", email: data.email });
      setAvatarPreview(data.profile_image || null);
      setAvatarFile(null);
      setEditing(false);
      localStorage.setItem("first_name", data.first_name);
      localStorage.setItem("second_name", data.second_name);
      setToast(true);
      setTimeout(() => setToast(false), 2800);
    } catch (error) {
      console.error("Profile update failed", error);
      setApiError(error.message || "Unable to update profile");
    }
  };
 
  const handleCancel = () => {
    setForm({ firstName: user.first_name || "", secondName: user.second_name || "", email: user.email });
    setAvatarPreview(user.profile_image || null);
    setAvatarFile(null);
    setEditing(false);
    setApiError("");
  };
 
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
 
  if (loading) {
    return (
      <PageLayout>
        <div className="profile-wrapper">
          <p>Loading profile...</p>
        </div>
      </PageLayout>
    );
  }
 
  return (
    <PageLayout>
      <div className="mt-1">
        <button className="profile-back-btn" onClick={handleBack}>
          ← Back
        </button>
        <p className="gold-label profile-heading-label">Account</p>
        <h1 className="profile-heading-title">
          Your Profile
          {editing && <span className="edit-badge">EDITING</span>}
        </h1>
      </div>
 
      <div className="profile-wrapper">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className="profile-avatar-ring"
            onClick={() => editing && fileRef.current?.click()}
            title={editing ? "Change photo" : ""}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" />
            ) : (
              <div className="avatar-initials">{initials}</div>
            )}
            {editing && (
              <div className="avatar-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
 
          <div>
            <p className="profile-name-text">{fullName || "Your Name"}</p>
            {joinedDate && <p className="profile-subtext">Member since {joinedDate}</p>}
          </div>
        </div>
 
        {apiError && <div className="server-error mb-3">{apiError}</div>}
 
        <hr className="divider-gold mb-3" />
 
        <div className="mb-3 d-flex gap-3 flex-wrap">
          <div className="w-100 w-md-50">
            <label className="gold-label d-block">First Name</label>
            <input
              className="form-control profile-input"
              value={form.firstName}
              disabled={!editing}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              placeholder="First name"
            />
          </div>
          <div className="w-100 w-md-50">
            <label className="gold-label d-block">Second Name</label>
            <input
              className="form-control profile-input"
              value={form.secondName}
              disabled={!editing}
              onChange={(e) => setForm((p) => ({ ...p, secondName: e.target.value }))}
              placeholder="Second name"
            />
          </div>
        </div>
 
        <div className="mb-3">
          <label className="gold-label d-block">Email Address</label>
          <input
            className="form-control profile-input"
            type="email"
            value={form.email}
            disabled={!editing}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="your@email.com"
          />
        </div>
 
        <hr className="divider-gold" />
 
        {editing ? (
          <div className="d-flex align-items-center gap-3 flex-wrap mt-3">
            <button className="btn btn-gold" onClick={handleSave}>SAVE CHANGES</button>
            <button className="btn btn-outline-gold" onClick={handleCancel}>CANCEL</button>
          </div>
        ) : (
          <div className="mt-3">
            <button className="btn btn-gold" onClick={() => setEditing(true)}>EDIT PROFILE</button>
          </div>
        )}
      </div>
 
      {toast && <div className="toast-success">✦ PROFILE UPDATED</div>}
    </PageLayout>
  );
}