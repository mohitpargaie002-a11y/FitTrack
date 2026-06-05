import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0f1117" }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5"
        style={{ background: "#13161f", borderBottom: "1px solid #1e2130" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏋️</span>
          <span className="text-lg font-semibold tracking-tight text-white">
            FitTrack
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-semibold"
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
          </div>
          <button
            onClick={signOut}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#f87171", background: "#2a1515" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3a1a1a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2a1515")}
          >
            Sign out
          </button>
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
          background: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
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
                  style={{ background: isActive ? "#ede9fe" : "transparent" }}
                >
                  <span className="text-lg leading-none">{icon}</span>
                </div>
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: isActive ? "#7c3aed" : "#9ca3af" }}
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
