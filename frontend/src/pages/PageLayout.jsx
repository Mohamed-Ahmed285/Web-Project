import bgImage from "../assets/pageBackground.jpg";
import tabletBg from "../assets/tablet.png";
import mobileBg from "../assets/mobile.png";
import shelfIcon from "../assets/shelfIcon.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useBreakpoint() {
  const getBreakpoint = () => {
    const w = window.innerWidth;
    if (w <= 640) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
  };
  const [bp, setBp] = useState(getBreakpoint);
  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return bp;
}

export default function PageLayout({ children }) {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const navigate = useNavigate();

  const bgMap = {
    desktop: bgImage,
    tablet: tabletBg,
    mobile: mobileBg,
  };
  const bgSizeMap = {
    desktop: "104% 104%",
    tablet: "103% 103%",
    mobile: "103% 103%",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        body { background: #1a1008; overflow: hidden; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          fontFamily: "'EB Garamond', Georgia, serif",
          backgroundImage: `url(${bgMap[bp]})`,
          backgroundSize: bgSizeMap[bp],
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding:
            bp === "mobile"
              ? "28px 20px"
              : bp === "tablet"
              ? "38px 32px"
              : "0px",
        }}
      >
        {/* Desktop left decorative area */}
        {isDesktop && <div style={{ width: "26%", flexShrink: 0 }} />}

        {/* Scroll container — position relative so logo anchors to it */}
        <div
          style={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            position: "relative",
            ...(isDesktop
              ? { padding: "40px 48px 40px 0px" }
              : bp === "tablet"
              ? { padding: "20px" }
              : { padding: "14px" }),
          }}
        >
          {/* Logo button — navigates based on role */}
          <button
            onClick={() => {
              const role = localStorage.getItem("role");
              navigate(role === "admin" ? "/admin" : "/dashboard");
            }}
            style={{
              position: "absolute",
              top: bp === "tablet" ? "-25px" :  bp === "mobile" ? "0px" : "18px",
              right: bp === "mobile" ? "0px" : "18px",
              zIndex: 100,
              background: "none",
              border: "none",
              padding: "0",
              margin: "0",
              cursor: "pointer",
              outline: "inherit",
              font: "inherit",
              color: "inherit",
            }}
          >
            <img
              src={shelfIcon}
              alt="Shelf icon"
              style={{
                width: bp === "mobile" ? "100px" : "130px",
                height: bp === "mobile" ? "100px" : "130px",
                objectFit: "contain",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </button>

          {children}
        </div>
      </div>
    </>
  );
}