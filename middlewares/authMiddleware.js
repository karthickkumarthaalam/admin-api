const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user;
        next();
    });
};

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        data = {
            id: user.id,
            email: user.email
        };
        req.user = data;
        next();
    });

};

exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (req.user.email === "admin") {
            return next();
        }

        const { acl } = req.user;

        if (!Array.isArray(acl) || !acl.includes(permission)) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};