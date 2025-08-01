const ftp = require("basic-ftp");
const path = require("path");

function sanitizeFileName(name) {
    return name.replace(/[\\?%*:|"<>]/g, "").replace(/[()]/g, "").replace(/\s+/g, "_");
}

async function uploadToCpanel(localFilePath, remoteFolder, remoteFileName) {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: true,
            secureOptions: { rejectUnauthorized: false },
            port: process.env.FTP_PORT
        });

        const safeName = sanitizeFileName(remoteFileName);

        await client.cd(remoteFolder);
        await client.uploadFrom(localFilePath, safeName);

        return `https://thaalam.ch/${remoteFolder}/${safeName}`;
    } catch (err) {
        console.error("❌ Upload failed:", err.message);
        throw err;
    } finally {
        client.close();
    }
}


async function deleteFromCpanel(remoteFolder, remoteFileName) {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: true,
            secureOptions: { rejectUnauthorized: false },
            port: process.env.FTP_PORT
        });

        const safeName = sanitizeFileName(remoteFileName);
        const remotePath = `${remoteFolder}/${safeName}`;

        await client.remove(remotePath);
    } catch (err) {
        console.error("❌ Delete failed:", err.message);
        throw new Error(err.message);
    } finally {
        client.close();
    }
}

module.exports = { uploadToCpanel, deleteFromCpanel };
