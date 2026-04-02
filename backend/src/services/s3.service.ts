import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, "../../uploads");

let s3Client: S3Client | null = null;

function getS3(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
}

export async function uploadResume(fileBuffer: Buffer, key: string, contentType: string) {
  if (env.S3_SKIP) {
    const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    const fullPath = path.join(uploadsRoot, safeKey);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);
    const encoded = safeKey
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    return `${env.PUBLIC_BASE_URL}/api/local-uploads/${encoded}`;
  }

  const s3 = getS3();
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    })
  );

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
