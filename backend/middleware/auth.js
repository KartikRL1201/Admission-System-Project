const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Access Denied." });
    }

    try {
        const secret =
            process.env.JWT_SECRET || "super_secret_presentation_key";
        req.admin = jwt.verify(token, secret);
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid session." });
    }
};

const verifySuperAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Access Denied." });
    }

    try {
        const secret =
            process.env.JWT_SECRET || "super_secret_presentation_key";
        const verified = jwt.verify(token, secret);

        if (verified.role !== "SuperAdmin") {
            return res.status(403).json({
                success: false,
                message: "Security Alert: SuperAdmin privileges required.",
            });
        }

        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid session." });
    }
};

module.exports = { verifyAdmin, verifySuperAdmin };
