import { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function AdminAnalytics({ token, onNavigateToEntry }) {
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get("/api/admin/analytics", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setAnalytics(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            }
        };
        fetchAnalytics();
    }, [token]);

    const getStatusCount = (statusName) => {
        if (!analytics || !analytics.statusCounts) return 0;
        const item = analytics.statusCounts.find(
            (s) => s.Status === statusName,
        );
        return item ? item.Count : 0;
    };

    if (error) {
        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#f87171",
                    backgroundColor: "rgba(248, 113, 113, 0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(248, 113, 113, 0.3)",
                }}
            >
                <h3 style={{ margin: "0 0 10px 0" }}>Analytics Engine Error</h3>
                <p style={{ margin: 0 }}>{error}</p>
            </div>
        );
    }

    if (!analytics)
        return (
            <div
                style={{
                    color: "var(--text-muted)",
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                Loading Analytics Engine...
            </div>
        );

    return (
        <div className="animate-fade-in">
            <h2
                style={{
                    color: "var(--text-main)",
                    margin: "0 0 25px 0",
                    fontSize: "24px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                }}
            >
                System Analytics Overview
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "24px",
                }}
            >
                <div
                    className="hover-lift"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 0,
                            marginBottom: "20px",
                        }}
                    >
                        Application Funnel
                    </h3>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            height: "calc(100% - 38px)",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "#fbbf24",
                                    textShadow:
                                        "0 0 15px rgba(251, 191, 36, 0.3)",
                                }}
                            >
                                {getStatusCount("Pending")}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                }}
                            >
                                PENDING
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "#4ade80",
                                    textShadow:
                                        "0 0 15px rgba(74, 222, 128, 0.3)",
                                }}
                            >
                                {getStatusCount("Approved")}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                }}
                            >
                                APPROVED
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "#f87171",
                                    textShadow:
                                        "0 0 15px rgba(248, 113, 113, 0.3)",
                                }}
                            >
                                {getStatusCount("Rejected")}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                }}
                            >
                                REJECTED
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "#cbd5e1",
                                    textShadow:
                                        "0 0 15px rgba(148, 163, 184, 0.3)",
                                }}
                            >
                                {getStatusCount("Archived")}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                }}
                            >
                                ARCHIVED
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="hover-lift"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 0,
                            marginBottom: "15px",
                        }}
                    >
                        Top Candidates (Pending)
                    </h3>
                    {analytics.topCandidates.length === 0 ? (
                        <p
                            style={{
                                fontSize: "14px",
                                color: "var(--text-muted)",
                                fontStyle: "italic",
                                textAlign: "center",
                                marginTop: "20px",
                            }}
                        >
                            No pending applications found.
                        </p>
                    ) : (
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            {analytics.topCandidates.map((candidate, idx) => (
                                <div
                                    key={idx}
                                    onClick={() =>
                                        onNavigateToEntry(
                                            candidate.Application_ID,
                                        )
                                    }
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "14px",
                                        padding: "8px 10px",
                                        margin: "0 -10px",
                                        borderRadius: "6px",
                                        borderBottom:
                                            idx !==
                                            analytics.topCandidates.length - 1
                                                ? "1px solid rgba(148, 163, 184, 0.1)"
                                                : "none",
                                        cursor: "pointer",
                                        transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "rgba(99, 102, 241, 0.15)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "transparent")
                                    }
                                >
                                    <div>
                                        <div
                                            style={{
                                                color: "var(--text-main)",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {candidate.First_Name}{" "}
                                            {candidate.Last_Name}
                                        </div>
                                        <div
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "11px",
                                                marginTop: "2px",
                                            }}
                                        >
                                            {candidate.Dept_Name}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            color: "var(--highlight)",
                                            fontWeight: "800",
                                            textShadow:
                                                "0 0 10px rgba(56, 189, 248, 0.3)",
                                        }}
                                    >
                                        {candidate.Merit_Score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    className="hover-lift"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 0,
                            marginBottom: "15px",
                        }}
                    >
                        Department Demand
                    </h3>
                    {analytics.deptStats.map((stat) => (
                        <div
                            key={stat.Dept_Name}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "14px",
                                borderBottom:
                                    "1px solid rgba(148, 163, 184, 0.1)",
                                padding: "10px 0",
                            }}
                        >
                            <span
                                style={{
                                    color: "var(--text-main)",
                                    fontWeight: "500",
                                }}
                            >
                                {stat.Dept_Name}
                            </span>
                            <span>
                                <span
                                    style={{
                                        color: "var(--highlight)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {stat.Total_Applications}
                                </span>{" "}
                                <span
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "12px",
                                    }}
                                >
                                    apps
                                </span>
                                <span
                                    style={{
                                        color: "rgba(148, 163, 184, 0.2)",
                                        margin: "0 8px",
                                    }}
                                >
                                    |
                                </span>
                                <span
                                    style={{
                                        color: "#4ade80",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {stat.Total_Admitted}
                                </span>{" "}
                                <span
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "12px",
                                    }}
                                >
                                    adm
                                </span>
                            </span>
                        </div>
                    ))}
                </div>

                <div
                    className="hover-lift"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        minHeight: "220px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 0,
                            marginBottom: "15px",
                        }}
                    >
                        Application Velocity
                    </h3>
                    <div
                        style={{ flex: 1, width: "100%", position: "relative" }}
                    >
                        {!analytics.velocityData ||
                        analytics.velocityData.length === 0 ? (
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "var(--text-muted)",
                                    fontStyle: "italic",
                                    textAlign: "center",
                                    marginTop: "40px",
                                }}
                            >
                                No recent data.
                            </p>
                        ) : (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <LineChart
                                        data={analytics.velocityData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(148, 163, 184, 0.1)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={{
                                                stroke: "rgba(148, 163, 184, 0.2)",
                                            }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0f172a",
                                                borderColor:
                                                    "rgba(99, 102, 241, 0.4)",
                                                color: "#f8fafc",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0 10px 25px rgba(0,0,0,0.5)",
                                                padding: "8px",
                                            }}
                                            itemStyle={{ fontWeight: "bold" }}
                                        />
                                        <Line
                                            type="monotone"
                                            name="New Apps"
                                            dataKey="count"
                                            stroke="#00ffcc"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#00ffcc",
                                                strokeWidth: 0,
                                            }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="hover-lift"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        minHeight: "250px",
                        display: "flex",
                        flexDirection: "column",
                        gridColumn: "1 / -1",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 0,
                            marginBottom: "20px",
                        }}
                    >
                        Department Capacity Analysis
                    </h3>
                    <div
                        style={{
                            flex: 1,
                            width: "100%",
                            minHeight: "220px",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart
                                    data={analytics.deptStats}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.1)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="Dept_Name"
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                        axisLine={{
                                            stroke: "rgba(148, 163, 184, 0.2)",
                                        }}
                                        tickLine={false}
                                        interval={0}
                                    />
                                    <YAxis
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderColor:
                                                "rgba(99, 102, 241, 0.4)",
                                            color: "#f8fafc",
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0 10px 25px rgba(0,0,0,0.5)",
                                            padding: "12px",
                                        }}
                                        itemStyle={{ fontWeight: "bold" }}
                                        cursor={{
                                            fill: "rgba(148, 163, 184, 0.05)",
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{
                                            paddingTop: "20px",
                                            color: "#f8fafc",
                                            fontSize: "13px",
                                        }}
                                    />
                                    <Bar
                                        name="Total Applications"
                                        dataKey="Total_Applications"
                                        fill="#38bdf8"
                                        radius={[4, 4, 0, 0]}
                                        barSize={35}
                                        animationDuration={1500}
                                    />
                                    <Bar
                                        name="Admitted Students"
                                        dataKey="Total_Admitted"
                                        fill="#818cf8"
                                        radius={[4, 4, 0, 0]}
                                        barSize={35}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
