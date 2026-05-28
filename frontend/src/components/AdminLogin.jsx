import { useState } from "react";
import axios from "axios";

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post("/api/admin/login", {
                username,
                password,
            });

            if (response.data.success && typeof onLogin === "function") {
                onLogin(response.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                padding: "20px",
            }}
        >
            <div
                className="hover-lift animate-fade-in"
                style={{
                    backgroundColor: "var(--card-bg)",
                    padding: "50px 40px",
                    borderRadius: "16px",
                    border: "1px solid var(--border-color)",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            background:
                                "linear-gradient(135deg, var(--accent-glow), var(--highlight))",
                            borderRadius: "12px",
                            margin: "0 auto 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow:
                                "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
                        }}
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            ></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            color: "var(--text-main)",
                            fontSize: "24px",
                            fontWeight: "700",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        System Authentication
                    </h2>
                    <p
                        style={{
                            margin: "10px 0 0",
                            color: "var(--text-muted)",
                            fontSize: "14px",
                        }}
                    >
                        Enter credentials to continue.
                    </p>
                </div>

                {error && (
                    <div
                        className="animate-fade-in"
                        style={{
                            padding: "12px 16px",
                            backgroundColor: "rgba(220, 53, 69, 0.1)",
                            borderLeft: "4px solid #dc3545",
                            color: "#ff8793",
                            borderRadius: "4px",
                            marginBottom: "25px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            className="input-focus"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                backgroundColor: "var(--input-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                color: "var(--text-main)",
                                fontSize: "15px",
                                boxSizing: "border-box",
                            }}
                            placeholder="admin@system.io"
                        />
                    </div>
                    <div style={{ marginBottom: "35px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            className="input-focus"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                backgroundColor: "var(--input-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                color: "var(--text-main)",
                                fontSize: "15px",
                                boxSizing: "border-box",
                                fontFamily: "monospace",
                            }}
                            placeholder="••••••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-interactive"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            backgroundColor: "var(--accent-glow)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "700",
                            opacity: isLoading ? 0.7 : 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {isLoading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
