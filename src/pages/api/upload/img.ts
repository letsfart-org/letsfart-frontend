import { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import { uploadToR2, PUBLIC_R2_URL } from "@/lib/r2Util";

type UploadRequest = {
  tokenLogo: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenLogo } = req.body as UploadRequest;
    if (!tokenLogo) {
      return res.status(400).json({ error: 'tokenLogo field is empty!' });
    }

    const imgId = cuid();
    // Upload image and metadata
    const imageUrl = await uploadImage(tokenLogo, imgId);
    if (!imageUrl) {
      return res.status(400).json({ error: 'Failed to upload image' });
    }

    res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function uploadImage(tokenLogo: string, imgId: string): Promise<string | false> {
  const matches = tokenLogo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return false;
  }

  const [, contentType, base64Data] = matches;

  if (!contentType || !base64Data) {
    return false;
  }

  const fileBuffer = Buffer.from(base64Data, 'base64');
  const fileName = `images/${imgId}.${contentType.split('/')[1]}`;

  try {
    await uploadToR2(fileBuffer, contentType, fileName);
    return `${PUBLIC_R2_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    return false;
  }
}
