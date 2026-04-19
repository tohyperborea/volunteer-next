import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const MAX_IMAGE_SIZE_BYTES = Number(process.env.MAX_IMAGE_SIZE_BYTES) || 5 * 1024 * 1024; // Default to 5MB if not set
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico']);

/**
 * Uploads a file to the server and returns its accessible filename
 * @param file - The image file to upload
 * @returns A Promise resolving to the uploaded filename
 */
export async function uploadImageAction(file: File): Promise<string> {
  'use server';

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('File size exceeds the limit');
  }

  const destinationName = randomUUID() + extension;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'uploads', destinationName), buffer);
  return destinationName;
}
