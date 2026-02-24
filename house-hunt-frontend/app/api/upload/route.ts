// app/api/upload/route.ts
// Returns a presigned S3 URL so the client can upload images directly to S3
// without routing large files through the Next.js server.
// The Django backend is NOT involved in the upload — only in storing the resulting URL.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// ─── AWS S3 setup ─────────────────────────────────────────────────────────
// Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION ?? "af-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  // Must be a logged-in landlord
  const token = (await cookies()).get("landlord_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, fileType, fileSize } = await req.json() as {
      fileName: string;
      fileType: string;
      fileSize: number;
    };

    // Validate
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPG, PNG, WEBP, or MP4." },
        { status: 400 }
      );
    }
    if (fileSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Generate a unique key so filenames don't collide
    const ext = fileName.split(".").pop();
    const key = `houses/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    // Presigned URL valid for 5 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // The public URL the house record will store
    const publicUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("S3 presign error:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}