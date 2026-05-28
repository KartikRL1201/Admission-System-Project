import { useState, useEffect, useRef } from "react";
import axios from "axios";

function StudentPortal() {
    const [viewMode, setViewMode] = useState("apply");
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        merit_score: "",
        dept_id: "",
    });

    const [statusId, setStatusId] = useState("");
    const [statusData, setStatusData] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    const [supportAppId, setSupportAppId] = useState("");
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [thread, setThread] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newTicketSubject, setNewTicketSubject] = useState("");
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [thread]);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get("/api/departments");
            if (response.data.success) setDepartments(response.data.data);
        } catch (err) {
            setError("Failed to load departments.");
        }
    };

    const handleApplyChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const studentResponse = await axios.post("/api/students", {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                merit_score: formData.merit_score,
            });

            const appResponse = await axios.post("/api/applications", {
                student_id: studentResponse.data.studentId,
                dept_id: formData.dept_id,
            });

            setSuccess(
                `Application submitted successfully! Your Tracking ID is #${appResponse.data.applicationId}. Please retain this number for future reference.`,
            );
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                merit_score: "",
                dept_id: "",
            });
            setStatusId(appResponse.data.applicationId);
            fetchDepartments();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to submit application.",
            );
        }
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setStatusData(null);
        setStatusLoading(true);

        try {
            const response = await axios.get(`/api/status/${statusId}`);
            if (response.data.success) {
                setStatusData(response.data.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Application not found. Please check your ID.",
            );
        } finally {
            setStatusLoading(false);
        }
    };

    const handleSupportLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.get(`/api/tickets/${supportAppId}`);
            if (response.data.success) {
                setTickets(response.data.data);
                setIsCreatingTicket(response.data.data.length === 0);
                setActiveTicket(null);
            }
        } catch (err) {
            setError("Failed to retrieve tickets. Check Application ID.");
        }
    };

    const handleOpenTicket = async (ticket) => {
        setActiveTicket(ticket);
        try {
            const response = await axios.get(
                `/api/tickets/thread/${ticket.Ticket_ID}`,
            );
            if (response.data.success) {
                setThread(response.data.data);
            }
        } catch (err) {
            setError("Failed to load thread.");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.post("/api/tickets", {
                application_id: supportAppId,
                subject: newTicketSubject,
                message: newMessage,
            });
            if (response.data.success) {
                setNewTicketSubject("");
                setNewMessage("");
                setIsCreatingTicket(false);
                const fetchRes = await axios.get(
                    `/api/tickets/${supportAppId}`,
                );
                setTickets(fetchRes.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create ticket.");
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await axios.post("/api/tickets/reply", {
                ticket_id: activeTicket.Ticket_ID,
                sender: "Student",
                message: newMessage,
            });
            setNewMessage("");
            handleOpenTicket(activeTicket);
        } catch (err) {
            setError("Failed to send message.");
        }
    };

    const getStatusStyle = (rawStatus) => {
        const status = String(rawStatus || "")
            .trim()
            .toLowerCase();
        if (status === "approved")
            return {
                text: "#4ade80",
                bg: "rgba(74, 222, 128, 0.15)",
                border: "rgba(74, 222, 128, 0.3)",
            };
        if (status === "rejected")
            return {
                text: "#f87171",
                bg: "rgba(248, 113, 113, 0.15)",
                border: "rgba(248, 113, 113, 0.3)",
            };
        if (status === "archived")
            return {
                text: "#cbd5e1",
                bg: "rgba(148, 163, 184, 0.15)",
                border: "rgba(148, 163, 184, 0.3)",
            };
        return {
            text: "#fbbf24",
            bg: "rgba(251, 191, 36, 0.15)",
            border: "rgba(251, 191, 36, 0.3)",
        };
    };

    const sliderTransform = () => {
        if (viewMode === "apply") return "translateX(0)";
        if (viewMode === "status") return "translateX(100%)";
        return "translateX(200%)";
    };

    return (
        <div
            className="animate-fade-in"
            style={{ padding: "20px 0", height: "100%", overflowY: "auto" }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "40px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        position: "relative",
                        backgroundColor: "var(--card-bg)",
                        padding: "6px",
                        borderRadius: "30px",
                        border: "1px solid var(--border-color)",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                        width: "fit-content",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "6px",
                            bottom: "6px",
                            left: "6px",
                            width: "180px",
                            backgroundColor: "var(--highlight)",
                            borderRadius: "24px",
                            boxShadow: "0 4px 15px rgba(0, 123, 255, 0.4)",
                            transition:
                                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: sliderTransform(),
                        }}
                    />

                    <button
                        onClick={() => {
                            setViewMode("apply");
                            setError("");
                            setSuccess("");
                            setStatusData(null);
                            fetchDepartments();
                        }}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            padding: "10px 24px",
                            width: "180px",
                            borderRadius: "24px",
                            border: "none",
                            backgroundColor: "transparent",
                            color:
                                viewMode === "apply"
                                    ? "white"
                                    : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "color 0.3s ease",
                            letterSpacing: "0.5px",
                        }}
                    >
                        NEW APPLICATION
                    </button>
                    <button
                        onClick={() => {
                            setViewMode("status");
                            setError("");
                            setSuccess("");
                        }}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            padding: "10px 24px",
                            width: "180px",
                            borderRadius: "24px",
                            border: "none",
                            backgroundColor: "transparent",
                            color:
                                viewMode === "status"
                                    ? "white"
                                    : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "color 0.3s ease",
                            letterSpacing: "0.5px",
                        }}
                    >
                        CHECK STATUS
                    </button>
                    <button
                        onClick={() => {
                            setViewMode("support");
                            setError("");
                            setSuccess("");
                        }}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            padding: "10px 24px",
                            width: "180px",
                            borderRadius: "24px",
                            border: "none",
                            backgroundColor: "transparent",
                            color:
                                viewMode === "support"
                                    ? "white"
                                    : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "color 0.3s ease",
                            letterSpacing: "0.5px",
                        }}
                    >
                        SUPPORT
                    </button>
                </div>
            </div>

            {error && (
                <div
                    className="animate-fade-in"
                    style={{
                        padding: "16px",
                        backgroundColor: "rgba(220, 53, 69, 0.1)",
                        borderLeft: "4px solid #ef4444",
                        color: "#f87171",
                        borderRadius: "4px",
                        marginBottom: "25px",
                        fontWeight: "500",
                        fontSize: "14px",
                        textAlign: "center",
                        maxWidth: "600px",
                        margin: "0 auto 25px auto",
                    }}
                >
                    {error}
                </div>
            )}
            {success && (
                <div
                    className="animate-fade-in"
                    style={{
                        padding: "16px",
                        backgroundColor: "rgba(40, 167, 69, 0.1)",
                        borderLeft: "4px solid #22c55e",
                        color: "#4ade80",
                        borderRadius: "4px",
                        marginBottom: "25px",
                        fontWeight: "500",
                        fontSize: "14px",
                        textAlign: "center",
                        maxWidth: "600px",
                        margin: "0 auto 25px auto",
                    }}
                >
                    {success}
                </div>
            )}

            {viewMode === "apply" && (
                <div className="animate-fade-in">
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h2
                            style={{
                                color: "var(--text-main)",
                                fontSize: "24px",
                                fontWeight: "700",
                                letterSpacing: "-0.5px",
                                margin: "0 0 10px 0",
                            }}
                        >
                            Academic Departments
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                margin: 0,
                            }}
                        >
                            Live seat availability based on current admissions.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            marginBottom: "60px",
                        }}
                    >
                        {departments.map((dept) => {
                            const isFull = dept.Available_Seats <= 0;
                            return (
                                <div
                                    key={dept.Dept_ID}
                                    className="hover-lift"
                                    style={{
                                        backgroundColor: "var(--card-bg)",
                                        border: "1px solid var(--border-color)",
                                        padding: "24px",
                                        borderRadius: "12px",
                                        minWidth: "240px",
                                        textAlign: "center",
                                        boxShadow:
                                            "0 4px 6px var(--modal-shadow)",
                                        opacity: isFull ? 0.7 : 1,
                                    }}
                                >
                                    <h3
                                        style={{
                                            marginTop: 0,
                                            color: "var(--text-main)",
                                            fontSize: "18px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {dept.Dept_Name}
                                    </h3>
                                    <div
                                        style={{
                                            marginTop: "15px",
                                            display: "inline-block",
                                            padding: "8px 16px",
                                            backgroundColor: isFull
                                                ? "rgba(248, 113, 113, 0.1)"
                                                : "rgba(0, 123, 255, 0.1)",
                                            borderRadius: "20px",
                                            border: `1px solid ${isFull ? "rgba(248, 113, 113, 0.2)" : "rgba(0, 123, 255, 0.2)"}`,
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Available:{" "}
                                        </span>
                                        <span
                                            style={{
                                                color: isFull
                                                    ? "#f87171"
                                                    : "var(--highlight)",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                            }}
                                        >
                                            {dept.Available_Seats} /{" "}
                                            {dept.Total_Seats}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="hover-lift"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "16px",
                            padding: "40px",
                            maxWidth: "500px",
                            margin: "0 auto",
                            boxShadow: "0 20px 40px -10px var(--modal-shadow)",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "30px",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    color: "var(--text-main)",
                                    fontSize: "20px",
                                    fontWeight: "700",
                                }}
                            >
                                Application Portal
                            </h2>
                        </div>
                        <form
                            onSubmit={handleApplySubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            <div style={{ display: "flex", gap: "15px" }}>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        First Name
                                    </label>
                                    <input
                                        className="input-focus"
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleApplyChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--border-color)",
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        className="input-focus"
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleApplyChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--border-color)",
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    Email Address
                                </label>
                                <input
                                    className="input-focus"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleApplyChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        backgroundColor: "var(--input-bg)",
                                        border: "1px solid var(--border-color)",
                                        color: "var(--text-main)",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "15px" }}>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        Contact Number
                                    </label>
                                    <input
                                        className="input-focus"
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleApplyChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--border-color)",
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        Merit Score
                                    </label>
                                    <input
                                        className="input-focus"
                                        type="number"
                                        step="0.01"
                                        name="merit_score"
                                        value={formData.merit_score}
                                        onChange={handleApplyChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--border-color)",
                                            color: "var(--highlight)",
                                            fontWeight: "bold",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    Target Department
                                </label>
                                <select
                                    className="input-focus"
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleApplyChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        backgroundColor: "var(--input-bg)",
                                        border: "1px solid var(--border-color)",
                                        color: "var(--text-main)",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box",
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="" disabled>
                                        Select a Department
                                    </option>
                                    {departments.map((dept) => (
                                        <option
                                            key={dept.Dept_ID}
                                            value={dept.Dept_ID}
                                            disabled={dept.Available_Seats <= 0}
                                        >
                                            {dept.Dept_Name}{" "}
                                            {dept.Available_Seats <= 0
                                                ? "(FULL)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn-interactive"
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: "var(--highlight)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginTop: "10px",
                                }}
                            >
                                SUBMIT APPLICATION
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {viewMode === "status" && (
                <div
                    className="animate-fade-in"
                    style={{ maxWidth: "500px", margin: "0 auto" }}
                >
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <h2
                            style={{
                                color: "var(--text-main)",
                                fontSize: "24px",
                                margin: "0 0 10px 0",
                            }}
                        >
                            Track Your Application
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                margin: 0,
                            }}
                        >
                            Enter the Application ID provided to you upon
                            submission.
                        </p>
                    </div>
                    <form
                        onSubmit={handleStatusSubmit}
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "30px",
                        }}
                    >
                        <input
                            className="input-focus"
                            type="number"
                            value={statusId}
                            onChange={(e) => setStatusId(e.target.value)}
                            placeholder="Application ID (e.g. 1042)"
                            required
                            style={{
                                flex: 1,
                                padding: "14px 16px",
                                backgroundColor: "var(--input-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-main)",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: "bold",
                            }}
                        />
                        <button
                            className="btn-interactive"
                            type="submit"
                            disabled={statusLoading}
                            style={{
                                padding: "0 24px",
                                backgroundColor: "var(--highlight)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: statusLoading
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight: "bold",
                                opacity: statusLoading ? 0.7 : 1,
                            }}
                        >
                            {statusLoading ? "SEARCHING..." : "SEARCH"}
                        </button>
                    </form>
                    {statusData && (
                        <div
                            className="animate-fade-in hover-lift"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "12px",
                                padding: "30px",
                                boxShadow:
                                    "0 15px 30px -10px var(--modal-shadow)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "25px",
                                    paddingBottom: "20px",
                                    borderBottom:
                                        "1px solid var(--border-color)",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Application ID
                                    </div>
                                    <div
                                        style={{
                                            color: "var(--text-main)",
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        #{statusData.Application_ID}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        textTransform: "uppercase",
                                        letterSpacing: "1px",
                                        backgroundColor: getStatusStyle(
                                            statusData.Status,
                                        ).bg,
                                        color: getStatusStyle(statusData.Status)
                                            .text,
                                        border: `1px solid ${getStatusStyle(statusData.Status).border}`,
                                        boxShadow: `0 0 15px ${getStatusStyle(statusData.Status).bg}`,
                                    }}
                                >
                                    {statusData.Status}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "15px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Applicant
                                    </span>
                                    <span
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {statusData.First_Name}{" "}
                                        {statusData.Last_Name}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Department
                                    </span>
                                    <span
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {statusData.Dept_Name}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Date Submitted
                                    </span>
                                    <span
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {new Date(
                                            statusData.Application_Date,
                                        ).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === "support" && (
                <div
                    className="animate-fade-in"
                    style={{
                        maxWidth: "600px",
                        margin: "0 auto",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "30px",
                            flexShrink: 0,
                        }}
                    >
                        <h2
                            style={{
                                color: "var(--text-main)",
                                fontSize: "24px",
                                margin: "0 0 10px 0",
                            }}
                        >
                            Query Management
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                margin: 0,
                            }}
                        >
                            Authenticate with your Application ID to view or
                            raise tickets.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSupportLogin}
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "30px",
                            flexShrink: 0,
                        }}
                    >
                        <input
                            className="input-focus"
                            type="number"
                            value={supportAppId}
                            onChange={(e) => setSupportAppId(e.target.value)}
                            placeholder="Enter Application ID..."
                            required
                            style={{
                                flex: 1,
                                padding: "14px 16px",
                                backgroundColor: "var(--input-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-main)",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: "bold",
                            }}
                        />
                        <button
                            className="btn-interactive"
                            type="submit"
                            style={{
                                padding: "0 24px",
                                backgroundColor: "var(--highlight)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            AUTHENTICATE
                        </button>
                    </form>

                    {supportAppId &&
                        tickets.length === 0 &&
                        !isCreatingTicket &&
                        !error && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    backgroundColor: "var(--card-bg)",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        marginBottom: "20px",
                                    }}
                                >
                                    No support tickets found for this
                                    Application ID.
                                </p>
                                <button
                                    className="btn-interactive"
                                    onClick={() => setIsCreatingTicket(true)}
                                    style={{
                                        padding: "10px 24px",
                                        backgroundColor: "var(--highlight)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    RAISE NEW TICKET
                                </button>
                            </div>
                        )}

                    {isCreatingTicket && (
                        <form
                            onSubmit={handleCreateTicket}
                            className="animate-fade-in"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                padding: "30px",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px",
                                flexShrink: 0,
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 10px 0",
                                    color: "var(--text-main)",
                                    fontSize: "18px",
                                }}
                            >
                                Raise a Support Ticket
                            </h3>
                            <input
                                className="input-focus"
                                type="text"
                                placeholder="Subject (e.g., Fee Inquiry)"
                                value={newTicketSubject}
                                onChange={(e) =>
                                    setNewTicketSubject(e.target.value)
                                }
                                required
                                style={{
                                    padding: "14px",
                                    backgroundColor: "var(--input-bg)",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--text-main)",
                                    borderRadius: "8px",
                                }}
                            />
                            <textarea
                                className="input-focus"
                                placeholder="Describe your issue..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                required
                                rows="5"
                                style={{
                                    padding: "14px",
                                    backgroundColor: "var(--input-bg)",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--text-main)",
                                    borderRadius: "8px",
                                    resize: "none",
                                }}
                            />
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingTicket(false)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        backgroundColor: "transparent",
                                        color: "var(--text-muted)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="btn-interactive"
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        backgroundColor: "var(--highlight)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    SUBMIT TICKET
                                </button>
                            </div>
                        </form>
                    )}

                    {!isCreatingTicket &&
                        tickets.length > 0 &&
                        !activeTicket && (
                            <div
                                className="animate-fade-in"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "15px",
                                    overflowY: "auto",
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <h3
                                        style={{
                                            color: "var(--text-main)",
                                            margin: 0,
                                        }}
                                    >
                                        Your Tickets
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setIsCreatingTicket(true)
                                        }
                                        style={{
                                            backgroundColor: "transparent",
                                            border: "1px solid var(--highlight)",
                                            color: "var(--highlight)",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        + NEW TICKET
                                    </button>
                                </div>
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.Ticket_ID}
                                        onClick={() => handleOpenTicket(ticket)}
                                        className="hover-lift"
                                        style={{
                                            backgroundColor: "var(--card-bg)",
                                            border: "1px solid var(--border-color)",
                                            padding: "20px",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    color: "var(--text-main)",
                                                    fontWeight: "600",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {ticket.Subject}
                                            </div>
                                            <div
                                                style={{
                                                    color: "var(--text-muted)",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Created:{" "}
                                                {new Date(
                                                    ticket.Created_At,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                backgroundColor:
                                                    ticket.Status === "Open"
                                                        ? "rgba(251, 191, 36, 0.15)"
                                                        : "rgba(74, 222, 128, 0.15)",
                                                color:
                                                    ticket.Status === "Open"
                                                        ? "#fbbf24"
                                                        : "#4ade80",
                                            }}
                                        >
                                            {ticket.Status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                    {activeTicket && (
                        <div
                            className="animate-fade-in"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                height: "500px",
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    padding: "15px 20px",
                                    borderBottom:
                                        "1px solid var(--border-color)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {activeTicket.Subject}
                                    </div>
                                    <div
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Ticket #{activeTicket.Ticket_ID}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTicket(null)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    BACK
                                </button>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "15px",
                                }}
                                className="custom-scrollbar"
                            >
                                {thread.map((reply) => (
                                    <div
                                        key={reply.Reply_ID}
                                        style={{
                                            alignSelf:
                                                reply.Sender === "Student"
                                                    ? "flex-end"
                                                    : "flex-start",
                                            maxWidth: "80%",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                color: "var(--text-muted)",
                                                marginBottom: "4px",
                                                textAlign:
                                                    reply.Sender === "Student"
                                                        ? "right"
                                                        : "left",
                                            }}
                                        >
                                            {reply.Sender === "Student"
                                                ? "You"
                                                : "Support"}{" "}
                                            •{" "}
                                            {new Date(
                                                reply.Created_At,
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                        <div
                                            style={{
                                                backgroundColor:
                                                    reply.Sender === "Student"
                                                        ? "var(--highlight)"
                                                        : "var(--input-bg)",
                                                color:
                                                    reply.Sender === "Student"
                                                        ? "white"
                                                        : "var(--text-main)",
                                                padding: "12px 16px",
                                                borderRadius:
                                                    reply.Sender === "Student"
                                                        ? "16px 16px 4px 16px"
                                                        : "16px 16px 16px 4px",
                                                border:
                                                    reply.Sender === "Student"
                                                        ? "none"
                                                        : "1px solid var(--border-color)",
                                                fontSize: "14px",
                                                lineHeight: "1.4",
                                                wordWrap: "break-word",
                                            }}
                                        >
                                            {reply.Message}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {activeTicket.Status === "Open" ? (
                                <form
                                    onSubmit={handleSendReply}
                                    style={{
                                        padding: "15px",
                                        borderTop:
                                            "1px solid var(--border-color)",
                                        display: "flex",
                                        gap: "10px",
                                        backgroundColor: "var(--input-bg)",
                                        flexShrink: 0,
                                    }}
                                >
                                    <input
                                        className="input-focus"
                                        type="text"
                                        placeholder="Type a reply..."
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        required
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            padding: "12px",
                                            backgroundColor: "var(--card-bg)",
                                            border: "1px solid var(--border-color)",
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <button
                                        className="btn-interactive"
                                        type="submit"
                                        style={{
                                            padding: "0 20px",
                                            backgroundColor: "var(--highlight)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            flexShrink: 0,
                                        }}
                                    >
                                        SEND
                                    </button>
                                </form>
                            ) : (
                                <div
                                    style={{
                                        padding: "20px",
                                        borderTop:
                                            "1px solid var(--border-color)",
                                        backgroundColor: "var(--input-bg)",
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                        fontStyle: "italic",
                                        fontSize: "13px",
                                        flexShrink: 0,
                                    }}
                                >
                                    This ticket has been marked as Resolved and
                                    is now closed to new replies.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default StudentPortal;
