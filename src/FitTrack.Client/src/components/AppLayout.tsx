import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1117" }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5"
        style={{ background: "#0d1421", borderBottom: "1px solid #1a2332" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏋️</span>
          <span className="text-lg font-semibold tracking-tight text-white">
            FitTrack
          </span>
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
            style={{
              background: menuOpen ? "#1a2332" : "transparent",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!menuOpen) e.currentTarget.style.background = "#13161f";
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-semibold flex-shrink-0"
              style={{
                background: "#2d2060",
                color: "#a78bfa",
                border: "1px solid #4c3a9e",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium" style={{ color: "#9ca3af" }}>
              {user?.name}
            </span>
            {/* Chevron */}
            <svg
              className="w-3 h-3 transition-transform"
              style={{
                color: "#4b5563",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl py-1 z-50"
              style={{
                background: "#0d1421",
                border: "1px solid #1a2332",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <button
                onClick={() => {
                  navigate("/plan/settings");
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                  transition-colors text-left"
                style={{ color: "#e5e7eb" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1a2332")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>⚙️</span>
                <span>Plan settings</span>
              </button>

              <div
                style={{
                  height: "1px",
                  background: "#1a2332",
                  margin: "2px 0",
                }}
              />

              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                  transition-colors text-left"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2a1515")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 flex"
        style={{
          background: "#0d1421",
          borderTop: "1px solid #1a2332",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {[
          { to: "/", label: "Calendar", icon: "📅" },
          { to: "/dashboard", label: "Dashboard", icon: "📊" },
        ].map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            {({ isActive }) => (
              <>
                <div
                  className="px-4 py-1.5 rounded-xl transition-colors"
                  style={{ background: isActive ? "#1a1730" : "transparent" }}
                >
                  <span className="text-lg leading-none">{icon}</span>
                </div>
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: isActive ? "#a78bfa" : "#4b5563" }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
