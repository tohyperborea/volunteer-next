import { getImageApiPath } from '@/utils/path';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

/**
 * Uploads a file to the server and returns its accessible filename
 * @param file - The image file to upload
 * @returns A Promise resolving to the uploaded filename
 */
export async function uploadImageAction(file: File): Promise<string> {
  'use server';
  const destinationName = randomUUID() + path.extname(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'uploads', destinationName), buffer);
  return destinationName;
}
