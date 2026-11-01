import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminSession } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'xqnmbmbd',
  api_key: process.env.CLOUDINARY_API_KEY || '813265698343359',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ieZkVDaezgYIAuSMMuTIeN9XVTE',
  secure: true
});

export async function POST(request) {
  try {
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'vincent-and-vintage';

    if (!file) {
      return NextResponse.json({ message: 'No file provided for upload.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream upload directly to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          fetch_format: 'auto',
          quality: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json(
      { message: err.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
