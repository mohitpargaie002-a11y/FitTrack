import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      signIn(res.token, {
        userId: res.userId,
        name: res.name,
        email: res.email,
      });
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0d1117" }}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-md"
        style={{ background: "#0d1421", border: "1px solid #1a2332" }}
      >
        <h1 className="text-2xl font-medium text-white mb-1">Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
          Sign in to your FitTrack account
        </p>

        {error && (
          <div
            className="text-sm rounded-lg px-4 py-3 mb-4"
            style={{ background: "#2a1515", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#9ca3af" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
              focus:outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: "#0f1117", border: "1px solid #1e2130" }}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#9ca3af" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white
              focus:outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: "#0f1117", border: "1px solid #1e2130" }}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white
            transition-colors disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
