import { useState } from "react";
import axios from "axios";

function AdminLogin({ onLogin }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [authData, setAuthData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (authData.password !== authData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const res = await axios.post("/api/admin/register", {
                username: authData.username,
                password: authData.password,
            });
            if (res.data.success) {
                setSuccess(res.data.message);
                setAuthData({
                    username: "",
                    password: "",
                    confirmPassword: "",
                });
                setIsLoginMode(true);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to create account.",
            );
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const res = await axios.post("/api/admin/login", {
                username: authData.username,
                password: authData.password,
            });
            if (res.data.success) {
                onLogin(res.data.token);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Invalid username or password.",
            );
        }
    };

    return (
        <div
            className="animate-fade-in hover-lift"
            style={{
                maxWidth: "400px",
                margin: "60px auto",
                backgroundColor: "var(--card-bg)",
                padding: "30px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 15px var(--modal-shadow)",
            }}
        >
            {error && (
                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        fontWeight: "500",
                        textAlign: "center",
                    }}
                >
                    {error}
                </div>
            )}
            {success && (
                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        fontWeight: "500",
                        textAlign: "center",
                    }}
                >
                    {success}
                </div>
            )}

            <h2
                style={{
                    color: "var(--text-main)",
                    textAlign: "center",
                    marginTop: 0,
                    marginBottom: "20px",
                }}
            >
                {isLoginMode ? "Admin Authentication" : "Create Admin Account"}
            </h2>

            <form
                onSubmit={isLoginMode ? handleLogin : handleRegister}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                <input
                    className="input-focus"
                    type="text"
                    placeholder="Username"
                    value={authData.username}
                    onChange={(e) =>
                        setAuthData({ ...authData, username: e.target.value })
                    }
                    required
                    style={{
                        padding: "12px",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        borderRadius: "4px",
                    }}
                />
                <input
                    className="input-focus"
                    type="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) =>
                        setAuthData({ ...authData, password: e.target.value })
                    }
                    required
                    style={{
                        padding: "12px",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        borderRadius: "4px",
                    }}
                />

                {!isLoginMode && (
                    <input
                        className="input-focus animate-fade-in"
                        type="password"
                        placeholder="Confirm Password"
                        value={authData.confirmPassword}
                        onChange={(e) =>
                            setAuthData({
                                ...authData,
                                confirmPassword: e.target.value,
                            })
                        }
                        required
                        style={{
                            padding: "12px",
                            backgroundColor: "var(--input-bg)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-main)",
                            borderRadius: "4px",
                        }}
                    />
                )}

                <button
                    className="btn-interactive"
                    type="submit"
                    style={{
                        padding: "14px",
                        backgroundColor: isLoginMode ? "#28a745" : "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginTop: "10px",
                    }}
                >
                    {isLoginMode ? "Secure Login" : "Register Account"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                    onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setError("");
                        setSuccess("");
                        setAuthData({
                            username: "",
                            password: "",
                            confirmPassword: "",
                        });
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--highlight)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "14px",
                    }}
                >
                    {isLoginMode
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Log In"}
                </button>
            </div>
        </div>
    );
}

export default AdminLogin;
