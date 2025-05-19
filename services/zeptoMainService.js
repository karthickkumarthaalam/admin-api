const axios = require("axios");
require("dotenv").config();

const sendZeptoMail = async (toEmail, toName, otp) => {
    const url = "https://api.zeptomail.in/v1.1/email/template";

    const data = {
        bounce_address: "support@dedicoit.thaalam.ch",
        from: {
            address: "noreply@thaalam.ch",
        },
        to: [
            {
                email_address: {
                    address: toEmail,
                    name: toName
                }
            }
        ],
        subject: "Your Password Reset OTP",
        template_key: process.env.ZEPTO_TEMPLATE_KEY,
        merge_info: {
            name: toName,
            otp: otp
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Zoho-enczapikey PHtE6r1fEO2532Yt8BYI4vC4HsCsNo8p/e5uLVUWtIlBAvcFTU1W+d5+xDC++hgrAKQXQfOcztk84r2btOqFdmbvNGgaWmqyqK3sx/VYSPOZsbq6x00bslQbd0TcXI7ocddr1yDfstbcNA==`
            }
        });

        return response.data;
    } catch (error) {
        console.log(error);
        console.error("ZeptoMail Error:", error.response?.data || error.message);
        throw new Error("Failed to send OTP email");
    }
};

module.exports = { sendZeptoMail };
