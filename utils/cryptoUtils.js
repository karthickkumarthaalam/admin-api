const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_SECRET;
const ivLength = 16;

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
};

exports.decrypt = (text) => {
    const [ivHex, encryptedDataHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedDataHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
};
