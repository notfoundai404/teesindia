/**
 * backend/src/lib/drive.ts
 *
 * Google Drive upload helper — stores product images on Drive and returns a
 * public direct-download URL.
 *
 * Enable this by filling in the following env vars in backend/.env:
 *   GOOGLE_CLIENT_EMAIL  — service account email
 *   GOOGLE_PRIVATE_KEY   — private key (JSON key file, keep \n)
 *   GOOGLE_DRIVE_FOLDER_ID — ID of the shared Drive folder
 *
 * Steps:
 *   1. console.cloud.google.com → New Project → Enable Drive API
 *   2. IAM → Service Accounts → Create → download JSON key
 *   3. Share your Drive folder with the service account email (Editor)
 *   4. Set the 3 env vars above
 */

import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

let driveClient: drive_v3.Drive | null = null;

function getDriveClient(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

export interface DriveUploadResult {
  id:              string;
  webContentLink:  string; // direct download / public URL
  webViewLink:     string;
}

/**
 * Upload a file buffer to Google Drive.
 * Returns a public URL to use as ProductImage.url.
 */
export async function uploadToDrive(
  buffer:   Buffer,
  filename: string,
  mimeType: string,
): Promise<DriveUploadResult> {
  const drive = getDriveClient();

  // Create the file
  const res = await drive.files.create({
    requestBody: {
      name:    filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = res.data.id!;

  // Make it publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  // Build a direct-embed URL (works for images)
  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  return {
    id:             fileId,
    webContentLink: publicUrl,
    webViewLink:    res.data.webViewLink || publicUrl,
  };
}

/** Delete a file from Drive by its ID (used when removing product images) */
export async function deleteFromDrive(fileId: string): Promise<void> {
  try {
    await getDriveClient().files.delete({ fileId });
  } catch {
    console.warn('[drive] Failed to delete file:', fileId);
  }
}

/** Returns true if Drive credentials are configured */
export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY  &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}
