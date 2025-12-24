module.exports = function getClientIp(req) {
  let ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;

  if (!ip) return "unknown";

  // Handle multiple IPs (x-forwarded-for)
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  // Normalize IPv4-mapped IPv6
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Normalize IPv6 localhost
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
};
