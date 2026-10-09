import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";
import logger from "#config/logger..js";

/**
 * Middleware to authenticate requests using JWT stored in cookies or Authorization header.
 */
export const authenticate = (req, res, next) => {
  try {
    let token = cookies.get(req, 'auth_token');

    // Also allow Bearer token in Authorization header for API clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    logger.warn(`Authentication failed: ${err.message}`);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware factory to authorize access based on user role(s).
 * @param  {...string} allowedRoles - List of allowed roles, e.g. 'admin', 'user'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} (${req.user.role}) denied access to route requiring [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};
