import { useNavigate } from "react-router-dom";
import bgImage from "../assets/pageBackground.jpg";
import shelfIcon from "../assets/shelfIcon.png";

export default function PageLayout({ children }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1008; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={s.page}>
        {/* Left decorative panel */}
        <div style={s.leftPanel} />

        {/* Right content panel */}
        <div style={s.rightPanel}>
          {/* Logo — always pinned top-right */}
          <button
            style={s.logoArea}
            onClick={() => {
              const role = localStorage.getItem("role");
              navigate(role === "admin" ? "/admin" : "/dashboard");
            }}
          >
            <img
              src={shelfIcon}
              alt="Shelf icon"
              style={s.logoIcon}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </button>

          {children}
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'EB Garamond', Georgia, serif",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "103% 103%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  leftPanel: {
    width: "26%",
    flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    overflowY: "auto",
    padding: "40px 48px 40px 0px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    position: "relative",
  },
  logoArea: {
  background: "none",
  border: "none",
  padding: "0",
  margin: "0",
  cursor: "pointer",
  outline: "inherit",
  font: "inherit",
  color: "inherit",
  position: "absolute",
  top: "5px",
  right: "50px",
  zIndex: 100, 
},
  logoIcon: {
    width: "130px",
    height: "130px",
    objectFit: "contain",
  },
};
