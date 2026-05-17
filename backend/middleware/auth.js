const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_presentation_key";

const verifyAdmin = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token)
        return res
            .status(403)
            .json({
                success: false,
                message: "Access Denied: No Token Provided!",
            });

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Invalid Token!" });
    }
};

module.exports = verifyAdmin;
