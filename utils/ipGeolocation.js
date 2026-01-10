const axios = require("axios");

async function getCountryByIP(ipAddress) {
  try {
    if (
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.")
    ) {
      return { country: "LOCAL", country_name: "Local Network" };
    }

    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
      timeout: 5000,
    });

    if (response.data && response.data.country_code) {
      return {
        country: response.data.country_code,
        country_name: response.data.country_name,
      };
    }

    return { country: null, country_name: null };
  } catch (error) {
    console.error("IP geolocation error:", error.message);

    try {
      const fallbackResponse = await axios.get(
        `http://ip-api.com/json/${ipAddress}`,
        {
          timeout: 3000,
        }
      );

      if (fallbackResponse.data && fallbackResponse.data.countryCode) {
        return {
          country: fallbackResponse.data.countryCode,
          country_name: fallbackResponse.data.country,
        };
      }
    } catch (fallbackError) {
      console.error("Fallback IP geolocation error:", fallbackError.message);
    }

    return { country: null, country_name: null };
  }
}

module.exports = { getCountryByIP };
