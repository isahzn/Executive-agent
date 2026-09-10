import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

// Extension derived from the declared MIME type — never trust the client filename.
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let file: File | null;
  try {
    const formData = await request.formData();
    const entry = formData.get("image");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid upload request." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json(
      { ok: false, error: "No image file was provided." },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: "The image is empty." }, { status: 400 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Unsupported image type. Use JPG, PNG, WEBP, GIF or AVIF." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image is too large. Keep it under 8 MB." },
      { status: 413 }
    );
  }

  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), bytes);
  } catch (error) {
    console.error("upload image error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save the image." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
