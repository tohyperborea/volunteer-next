import { NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import { request } from 'node:http';
import path from 'node:path';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/image/[filename]'>
): Promise<Response> => {
  const filename = (await params).filename;
  console.log('Requested image:', filename);
  const filePath = path.join(process.cwd(), 'uploads', filename);
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileExt = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (fileExt === '.jpg' || fileExt === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExt === '.png') {
      contentType = 'image/png';
    } else if (fileExt === '.gif') {
      contentType = 'image/gif';
    } else if (fileExt === '.svg') {
      contentType = 'image/svg+xml';
    } else if (fileExt === '.webp') {
      contentType = 'image/webp';
    }
    return new Response(fileBuffer, {
      headers: { 'Content-Type': contentType }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return new Response('File not found', { status: 404 });
  }
};
