import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import "./ProfilePage.css";
 
const DEFAULT_USER = {
  name: "",
  email: "",
  bio: "",
  joinedDate: "",
  avatar: null,
};
 
export default function ProfilePage() {
  // TODO: replace with real API call — e.g. const { data: user } = useQuery(() => axios.get("/api/users/me"))
  const [user, setUser] = useState(DEFAULT_USER);
  const [form, setForm] = useState({ name: user.name, email: user.email, bio: user.bio });
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatar] = useState(user.avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();
 
  const handleBack = () => {
    const role = localStorage.getItem("role");
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };
 
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file); // TODO: POST /api/users/avatar
    setAvatar(URL.createObjectURL(file));
  };
 
  const handleSave = () => {
    // TODO: await axios.put("/api/users/me", { ...form, avatar: avatarFile })
    setUser((p) => ({ ...p, ...form }));
    setEditing(false);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };
 
  const handleCancel = () => {
    setForm({ name: user.name, email: user.email, bio: user.bio });
    setAvatar(user.avatar);
    setAvatarFile(null);
    setEditing(false);
  };
 
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
 
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
 
          <p className="profile-name-text">{user.name}</p>
        </div>
 
        <hr className="divider-gold mb-3" />
 
        <div className="mb-3">
          <label className="gold-label d-block">Full Name</label>
          <input
            className="form-control profile-input"
            value={form.name}
            disabled={!editing}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your full name"
          />
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
 
        <div className="mb-3">
          <label className="gold-label d-block">Bio</label>
          <textarea
            className="form-control profile-input"
            rows={3}
            value={form.bio}
            disabled={!editing}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="A few words about yourself…"
            style={{ resize: "none" }}
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