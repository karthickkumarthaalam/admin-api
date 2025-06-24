const { google } = require("googleapis");
const stream = require("stream");

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadAudioFile(buffer, fileName, folderId) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: "audio/mpeg",
        body: bufferStream,
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
    });

    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone"
        }
    });

    return response.data;
}

async function deleteAudioFile(fileId) {
    try {
        await drive.files.delete({ fileId });
    } catch (error) {
        throw error;
    }
}

module.exports = { uploadAudioFile, deleteAudioFile };
