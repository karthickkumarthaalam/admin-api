const fs = require("fs");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("./r2client");

exports.uploadToR2 = async (localFilePath, folder, originalName) => {
  const fileBuffer = fs.readFileSync(localFilePath);

  const key = `${folder}/${Date.now()}-${originalName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: "application/octet-stream",
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

exports.deleteFromR2 = async (key) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    })
  );
};
