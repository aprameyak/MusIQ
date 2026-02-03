import { BlobServiceClient } from '@azure/storage-blob';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

export class BlobService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'profile-pictures';

    if (!connectionString) {
      logger.warn(
        'AZURE_STORAGE_CONNECTION_STRING is not set. Azure Blob Storage operations will fail.'
      );
    }

    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      this.blobServiceClient = null as any;
    }
  }

  private ensureInitialized() {
    if (!this.blobServiceClient) {
      throw new CustomError('Azure Blob Storage is not configured', 500);
    }
  }

  async uploadProfilePicture(
    userId: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    this.ensureInitialized();
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      await containerClient.createIfNotExists({
        access: 'blob',
      });

      const extension = contentType.split('/')[1] || 'jpg';
      const blobName = `profile-pictures/${userId}-${Date.now()}.${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      return blockBlobClient.url;
    } catch (error) {
      logger.error('Error uploading to Azure Blob Storage', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new CustomError('Failed to upload profile picture', 500);
    }
  }

  async deleteProfilePicture(blobUrl: string): Promise<void> {
    this.ensureInitialized();
    try {
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split('/');
      const blobName = pathParts.slice(2).join('/');

      if (!blobName) return;

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.deleteIfExists();
    } catch (error) {
      logger.error('Error deleting from Azure Blob Storage', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const blobService = new BlobService();
