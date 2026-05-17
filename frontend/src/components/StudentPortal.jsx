import { useState, useEffect } from "react";
import axios from "axios";

function StudentPortal() {
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

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get("/api/departments");
            if (response.data.success) setDepartments(response.data.data);
        } catch (err) {
            setError("Failed to load departments.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
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
                `Application submitted successfully! Application ID: ${appResponse.data.applicationId}`,
            );
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                merit_score: "",
                dept_id: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to submit application.",
            );
        }
    };

    return (
        <div className="animate-fade-in">
            {error && (
                <div
                    className="animate-fade-in"
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
                    className="animate-fade-in"
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

            <h2 style={{ color: "var(--text-main)", textAlign: "center" }}>
                Available Departments
            </h2>
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: "40px",
                }}
            >
                {departments.map((dept) => (
                    <div
                        key={dept.Dept_ID}
                        className="hover-lift"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--border-color)",
                            padding: "20px",
                            borderRadius: "8px",
                            minWidth: "220px",
                            textAlign: "center",
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: "var(--text-main)" }}>
                            {dept.Dept_Name}
                        </h3>
                        <p
                            style={{
                                marginBottom: 0,
                                color: "var(--text-muted)",
                                fontWeight: "500",
                            }}
                        >
                            Total Seats:{" "}
                            <span style={{ color: "var(--highlight)" }}>
                                {dept.Total_Seats}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            <h2 style={{ color: "var(--text-main)", textAlign: "center" }}>
                Submit Application
            </h2>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    width: "100%",
                    maxWidth: "500px",
                    margin: "0 auto",
                }}
            >
                <input
                    className="input-focus"
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
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
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
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
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
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
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
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
                    type="number"
                    step="0.01"
                    name="merit_score"
                    placeholder="Merit Score"
                    value={formData.merit_score}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "12px",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        borderRadius: "4px",
                    }}
                />

                <select
                    className="input-focus"
                    name="dept_id"
                    value={formData.dept_id}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "12px",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        borderRadius: "4px",
                    }}
                >
                    <option value="" disabled>
                        Select a Department
                    </option>
                    {departments.map((dept) => (
                        <option key={dept.Dept_ID} value={dept.Dept_ID}>
                            {dept.Dept_Name}
                        </option>
                    ))}
                </select>

                <button
                    className="btn-interactive"
                    type="submit"
                    style={{
                        padding: "14px",
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginTop: "10px",
                    }}
                >
                    Submit Application
                </button>
            </form>
        </div>
    );
}

export default StudentPortal;
