import { useState, useEffect } from "react";
import axios from "axios";

function AdminTeam({ token }) {
    const [reviewers, setReviewers] = useState([]);
    const [reviewerForm, setReviewForm] = useState({
        username: "",
        password: "",
    });
    const [status, setStatus] = useState({
        error: "",
        success: "",
        loading: false,
    });

    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchReviewers();
    }, []);

    const fetchReviewers = async () => {
        try {
            const response = await axios.get(
                "/api/admin/reviewers",
                authConfig,
            );
            if (response.data.success) setReviewers(response.data.data);
        } catch (err) {
            console.error("Failed to fetch reviewers");
        }
    };

    const handleCreateReviewer = async (e) => {
        e.preventDefault();
        setStatus({ error: "", success: "", loading: true });
        try {
            const response = await axios.post(
                "/api/admin/register",
                { ...reviewerForm, role: "Reviewer" },
                authConfig,
            );
            if (response.data.success) {
                setStatus({
                    error: "",
                    success: "Reviewer account created.",
                    loading: false,
                });
                setReviewForm({ username: "", password: "" });
                fetchReviewers();
                setTimeout(
                    () => setStatus({ error: "", success: "", loading: false }),
                    3000,
                );
            }
        } catch (err) {
            setStatus({
                error: err.response?.data?.message || "Creation failed.",
                success: "",
                loading: false,
            });
        }
    };

    const handleDeleteReviewer = async (id) => {
        if (!window.confirm("Permanently revoke this reviewer's access?"))
            return;
        try {
            await axios.delete(`/api/admin/reviewers/${id}`, authConfig);
            fetchReviewers();
        } catch (err) {
            setStatus({
                error: "Failed to delete account.",
                success: "",
                loading: false,
            });
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: "0 10px" }}>
            <h2
                style={{
                    color: "var(--text-main)",
                    margin: "0 0 25px 0",
                    fontSize: "24px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                }}
            >
                Team Management
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "25px",
                }}
            >
                <div
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "30px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 10px 25px -5px var(--modal-shadow)",
                    }}
                >
                    <h3
                        style={{
                            margin: "0 0 20px 0",
                            color: "var(--text-main)",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                    >
                        Provision New Reviewer
                    </h3>
                    <form
                        onSubmit={handleCreateReviewer}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                        }}
                    >
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                }}
                            >
                                Email/Username
                            </label>
                            <input
                                type="text"
                                className="input-focus"
                                value={reviewerForm.username}
                                onChange={(e) =>
                                    setReviewForm({
                                        ...reviewerForm,
                                        username: e.target.value,
                                    })
                                }
                                required
                                placeholder="reviewer@system.io"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    backgroundColor: "var(--input-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    color: "var(--text-main)",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                }}
                            >
                                Secure Password
                            </label>
                            <input
                                type="password"
                                className="input-focus"
                                value={reviewerForm.password}
                                onChange={(e) =>
                                    setReviewForm({
                                        ...reviewerForm,
                                        password: e.target.value,
                                    })
                                }
                                required
                                placeholder="••••••••"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    backgroundColor: "var(--input-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    color: "var(--text-main)",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-interactive"
                            disabled={status.loading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor: "var(--accent-glow)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: status.loading
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight: "700",
                                marginTop: "10px",
                            }}
                        >
                            {status.loading
                                ? "PROVISIONING..."
                                : "CREATE ACCOUNT"}
                        </button>
                    </form>
                    {status.error && (
                        <div
                            style={{
                                color: "#f87171",
                                marginTop: "15px",
                                fontWeight: "600",
                                fontSize: "13px",
                            }}
                        >
                            {status.error}
                        </div>
                    )}
                    {status.success && (
                        <div
                            style={{
                                color: "#4ade80",
                                marginTop: "15px",
                                fontWeight: "600",
                                fontSize: "13px",
                            }}
                        >
                            {status.success}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "30px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 10px 25px -5px var(--modal-shadow)",
                        overflowY: "auto",
                        maxHeight: "400px",
                    }}
                >
                    <h3
                        style={{
                            margin: "0 0 20px 0",
                            color: "var(--text-main)",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                    >
                        Active Reviewers
                    </h3>
                    {reviewers.length === 0 ? (
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontStyle: "italic",
                                fontSize: "14px",
                            }}
                        >
                            No active reviewers found.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            {reviewers.map((r) => (
                                <div
                                    key={r.Admin_ID}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "16px",
                                        backgroundColor: "var(--input-bg)",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--text-main)",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {r.Username}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleDeleteReviewer(r.Admin_ID)
                                        }
                                        className="btn-interactive"
                                        style={{
                                            backgroundColor:
                                                "rgba(248, 113, 113, 0.15)",
                                            color: "#f87171",
                                            border: "1px solid rgba(248, 113, 113, 0.3)",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "700",
                                            fontSize: "11px",
                                        }}
                                    >
                                        REVOKE
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminTeam;
