const { clerkClient } = require("@clerk/clerk-sdk-node");

exports.requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.replace("Bearer ", "");

    const session = await clerkClient.verifyToken(token);

    req.auth = {
      userId: session.sub,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};