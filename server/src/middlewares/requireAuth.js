const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// This middleware automatically:
// 1. Checks for the Bearer token
// 2. Verifies the signature using your CLERK_SECRET_KEY
// 3. Populates 'req.auth' with { userId, sessionId, etc. }
// 4. Returns 401 Unauthorized if the token is missing or invalid
exports.requireAuth = ClerkExpressRequireAuth();