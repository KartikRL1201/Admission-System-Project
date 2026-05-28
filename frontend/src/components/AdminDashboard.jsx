import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminAnalytics from "./AdminAnalytics";
import AdminEntries from "./AdminEntries";
import AdminTeam from "./AdminTeam";
import AdminActivityLog from "./AdminActivityLog";
import AdminTickets from "./AdminTickets";

function AdminDashboard({ token, role, username, onLogout }) {
    const [activeTab, setActiveTab] = useState("analytics");
    const [targetEntryId, setTargetEntryId] = useState(null);

    const handleNavigateToEntry = (id) => {
        setActiveTab("entries");
        setTargetEntryId(id);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "analytics":
                return (
                    <AdminAnalytics
                        token={token}
                        onNavigateToEntry={handleNavigateToEntry}
                    />
                );
            case "entries":
                return (
                    <AdminEntries
                        token={token}
                        role={role}
                        targetEntryId={targetEntryId}
                        setTargetEntryId={setTargetEntryId}
                    />
                );
            case "activity":
                return <AdminActivityLog token={token} role={role} />;
            case "team":
                return role === "SuperAdmin" ? (
                    <AdminTeam token={token} />
                ) : (
                    <AdminAnalytics
                        token={token}
                        onNavigateToEntry={handleNavigateToEntry}
                    />
                );
            case "tickets":
                return (
                    <AdminTickets
                        token={token}
                        role={role}
                        username={username}
                    />
                );
            default:
                return (
                    <AdminAnalytics
                        token={token}
                        onNavigateToEntry={handleNavigateToEntry}
                    />
                );
        }
    };

    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                width: "100%",
                backgroundColor: "var(--bg-color)",
            }}
        >
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={role}
                username={username}
                onLogout={onLogout}
            />

            <div
                style={{
                    flex: 1,
                    padding: "30px",
                    overflowY: "auto",
                    boxSizing: "border-box",
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminDashboard;
