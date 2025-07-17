const { google } = require("googleapis");
const stream = require("stream");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

oauth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
        console.log("New Refresh Token:", tokens.refresh_token);
    }
    if (tokens.access_token) {
        console.log("New Access Token:", tokens.access_token);
    }
});


const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

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
        media,
        fields: "id, webViewLink, webContentLink",
    });

    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    return response.data;
}


async function uploadPdfFile(buffer, fileName, folderId) {

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: "application/pdf",
        body: bufferStream,
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: "id, webViewLink, webContentLink",
    });

    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    return response.data;
}

async function deleteFile(fileId) {
    try {
        await drive.files.delete({ fileId });
    } catch (error) {
        console.error("❌ Failed to delete file:", error.message);
        throw error;
    }
}

module.exports = {
    uploadAudioFile,
    uploadPdfFile,
    deleteAudioFile: deleteFile,
    deletePdfFile: deleteFile,
};
