import aj from "../config/arcjet.js";
import logger from "../config/logger..js";
import { slidingWindow } from "@arcjet/node";

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || "guest"; // Default to "guest" if unauthenticated

    let limit;
    switch (role) {
      case "admin":
        limit = 10;
        break;
      case "user":
        limit = 5;
        break;
      default:
        limit = 2;
    }

    // Create custom rate limit rule dynamically per role
    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "2s",
        max: limit,
        name: `slidingWindow_${role}`,
      }),
    );

    // Pass the request object to Arcjet for decision evaluation
    const decision = await client.protect(req, { ipSrc: req.ip });

    // 1. Handle Denials (invoke isDenied as a method)
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        logger.warn(`Access denied for ${req.ip}: Bot detected`); // Log BEFORE returning
        return res.status(403).json({ message: "Access denied: Bot detected" });
      }

      if (decision.reason.isRateLimit()) {
        logger.warn(`Rate limit exceeded for IP ${req.ip} (Role: ${role})`);
        return res.status(429).json({ 
          message: `Too many requests. Rate limit for ${role} is ${limit} requests per 2 seconds.` 
        });
      }
      if (decision.reason.isShield()) {
        logger.warn(`Shield triggered for IP ${req.ip} (Role: ${role})`);
        return res.status(429).json({ 
          message: `Shield triggered. ${role} is ${limit} requests per 2 seconds.` 
        });
      }

      // Generic denial fallback
      return res.status(403).json({ message: "Access denied by security policy" });
    }

    if (decision.conclusion !== "ALLOW") {
      logger.error(`Arcjet protection failed for ${req.ip}: ${decision.conclusion}`);
      return res.status(503).json({ message: "Security service unavailable" });
    }

    // 2. If allowed, pass control to the next middleware or route handler
    next();

  } catch (error) {
    console.error("Error in securityMiddleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};