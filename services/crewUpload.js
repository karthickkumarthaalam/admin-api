const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("./r2client");

exports.uploadToR2 = async (fileBuffer, folder, originalName, mimetype) => {
  const cleanName = originalName.replace(/\s+/g, "_");
  const key = `${folder}/${Date.now()}-${cleanName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype || "application/octet-stream",
      ContentDisposition: "inline",
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

exports.deleteFromR2 = async (key) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    }),
  );
};
