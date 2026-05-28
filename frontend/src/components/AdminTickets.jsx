import { useState, useEffect, useRef } from "react";
import axios from "axios";

function AdminTickets({ token, role, username }) {
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [thread, setThread] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState("");

    const [showSubjectTooltip, setShowSubjectTooltip] = useState(false);
    const [showSenderTooltip, setShowSenderTooltip] = useState(false);

    const chatEndRef = useRef(null);
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [thread]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("/api/admin/tickets", authConfig);
            if (response.data.success) setTickets(response.data.data);
        } catch (err) {
            setError("Failed to load tickets.");
        }
    };

    const handleOpenTicket = async (ticket) => {
        setActiveTicket(ticket);
        setShowSubjectTooltip(false);
        setShowSenderTooltip(false);
        try {
            const response = await axios.get(
                `/api/tickets/thread/${ticket.Ticket_ID}`,
            );
            if (response.data.success) setThread(response.data.data);
        } catch (err) {
            setError("Failed to load thread.");
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await axios.post(
                "/api/tickets/reply",
                {
                    ticket_id: activeTicket.Ticket_ID,
                    sender: username || "Admin",
                    message: newMessage,
                },
                authConfig,
            );
            setNewMessage("");
            handleOpenTicket(activeTicket);
        } catch (err) {
            setError("Failed to send reply.");
        }
    };

    const handleResolve = async () => {
        try {
            await axios.put(
                `/api/admin/tickets/${activeTicket.Ticket_ID}/resolve`,
                {},
                authConfig,
            );
            setActiveTicket({ ...activeTicket, Status: "Resolved" });
            fetchTickets();
        } catch (err) {
            setError("Failed to resolve ticket.");
        }
    };

    const handleDeleteTicket = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this entire ticket thread?")) return;
        try {
            await axios.delete(`/api/admin/tickets/${activeTicket.Ticket_ID}`, authConfig);
            setActiveTicket(null);
            fetchTickets();
        } catch (err) {
            setError("Failed to delete ticket.");
        }
    };

    const handleClearAllTickets = async () => {
        if (!window.confirm("WARNING: This will permanently wipe ALL tickets and replies from the database. Are you absolutely sure?")) return;
        try {
            await axios.delete(`/api/admin/tickets/all`, authConfig);
            setActiveTicket(null);
            fetchTickets();
        } catch (err) {
            setError("Failed to clear tickets.");
        }
    };

    const tooltipContainerStyle = { position: "relative", cursor: "default" };

    const getTooltipBoxStyle = (isVisible) => ({
        position: "absolute",
        top: "100%",
        left: "0",
        marginTop: "5px",
        padding: "8px 12px",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontSize: "12px",
        fontWeight: "normal",
        borderRadius: "6px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        whiteSpace: "normal",
        wordWrap: "break-word",
        zIndex: 50,
        width: "max-content",
        maxWidth: "400px",
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 0.2s ease, visibility 0.2s ease",
        pointerEvents: "none"
    });

    return (
        <div className="animate-fade-in" style={{ display: "flex", height: "calc(100vh - 120px)", gap: "20px" }}>
            <div style={{ width: "350px", display: "flex", flexDirection: "column", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(15, 23, 42, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "18px" }}>Query Inbox</h2>
                    {role === "SuperAdmin" && tickets.length > 0 && (
                        <button
                            className="btn-interactive"
                            onClick={handleClearAllTickets}
                            style={{ backgroundColor: "rgba(248, 113, 113, 0.15)", color: "#f87171", border: "1px solid rgba(248, 113, 113, 0.3)", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "10px" }}
                        >
                            CLEAR ALL
                        </button>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "10px" }} className="custom-scrollbar">
                    {tickets.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", marginTop: "40px" }}>No tickets found.</p>
                    ) : (
                        tickets.map((ticket) => (
                            <div
                                key={ticket.Ticket_ID}
                                onClick={() => handleOpenTicket(ticket)}
                                className="hover-lift"
                                style={{
                                    padding: "15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid rgba(148, 163, 184, 0.05)",
                                    backgroundColor: activeTicket?.Ticket_ID === ticket.Ticket_ID ? "rgba(99, 102, 241, 0.1)" : "transparent",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                    <span style={{ color: "var(--text-main)", fontWeight: "600", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.Subject}</span>
                                    <span style={{ fontSize: "10px", fontWeight: "bold", color: ticket.Status === "Open" ? "#fbbf24" : "#4ade80" }}>{ticket.Status}</span>
                                </div>
                                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{ticket.First_Name} {ticket.Last_Name} • App #{ticket.Application_ID}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden", minWidth: 0 }}>
                {!activeTicket ? (
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "20px", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Select a ticket from the inbox to view the thread.
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", gap: "15px", flexShrink: 0, zIndex: 10 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={tooltipContainerStyle} onMouseEnter={() => setShowSubjectTooltip(true)} onMouseLeave={() => setShowSubjectTooltip(false)}>
                                    <h3 style={{ margin: "0 0 4px 0", color: "var(--text-main)", fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {activeTicket.Subject}
                                    </h3>
                                    <div style={getTooltipBoxStyle(showSubjectTooltip)}>{activeTicket.Subject}</div>
                                </div>
                                <div style={tooltipContainerStyle} onMouseEnter={() => setShowSenderTooltip(true)} onMouseLeave={() => setShowSenderTooltip(false)}>
                                    <div style={{ color: "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        From: {activeTicket.First_Name} {activeTicket.Last_Name} (App #{activeTicket.Application_ID})
                                    </div>
                                    <div style={getTooltipBoxStyle(showSenderTooltip)}>
                                        From: {activeTicket.First_Name} {activeTicket.Last_Name} (App #{activeTicket.Application_ID})
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                                {role === "SuperAdmin" && (
                                    <button
                                        className="btn-interactive"
                                        onClick={handleDeleteTicket}
                                        style={{ backgroundColor: "rgba(248, 113, 113, 0.15)", color: "#f87171", border: "1px solid rgba(248, 113, 113, 0.3)", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
                                    >
                                        DELETE
                                    </button>
                                )}
                                {activeTicket.Status === "Open" && (
                                    <button
                                        className="btn-interactive"
                                        onClick={handleResolve}
                                        style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "1px solid rgba(74, 222, 128, 0.3)", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
                                    >
                                        MARK RESOLVED
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", position: "relative", zIndex: 1 }} className="custom-scrollbar">
                            {thread.map((reply) => {
                                const isAdminReply = reply.Sender !== "Student";
                                return (
                                    <div key={reply.Reply_ID} style={{ alignSelf: isAdminReply ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textAlign: isAdminReply ? "right" : "left" }}>
                                            {reply.Sender} • {new Date(reply.Created_At).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                        <div style={{ backgroundColor: isAdminReply ? "var(--highlight)" : "var(--input-bg)", color: isAdminReply ? "white" : "var(--text-main)", padding: "14px 18px", borderRadius: isAdminReply ? "16px 16px 4px 16px" : "16px 16px 16px 4px", border: isAdminReply ? "none" : "1px solid var(--border-color)", fontSize: "14px", lineHeight: "1.5", wordWrap: "break-word" }}>
                                            {reply.Message}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                        {activeTicket.Status === "Open" && (
                            <form onSubmit={handleSendReply} style={{ padding: "20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "10px", backgroundColor: "var(--input-bg)", flexShrink: 0 }}>
                                <input className="input-focus" type="text" placeholder="Type a response..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: "14px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", borderRadius: "8px" }} />
                                <button className="btn-interactive" type="submit" style={{ padding: "0 24px", backgroundColor: "var(--highlight)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", flexShrink: 0 }}>SEND</button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminTickets;