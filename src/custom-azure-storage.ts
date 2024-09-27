import {
  BlobDownloadResponseParsed,
  BlobServiceClient,
  ContainerClient,
  SASProtocol,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { Buffer } from 'buffer';

export class CustomAzureStorage {
  // connection string
  private _connectionString: string = '';

  // container name
  private _containerName: string = '';

  // blob service client
  private _blobServiceClient: BlobServiceClient | null = null;

  private readonly _error_prefix = '[custom-azure-storage]';

  // Set connection string
  public useConnectionString(connectionString: string): CustomAzureStorage {
    this._connectionString = connectionString;
    return this;
  }

  // Set container name
  public useContainerName(containerName: string): CustomAzureStorage {
    this._containerName = containerName;
    return this;
  }

  // Initial azure storage instance
  public initial(): CustomAzureStorage {
    this._blobServiceClient = BlobServiceClient.fromConnectionString(this._connectionString);
    return this;
  }

  // Get container client
  public getContainerClient(): ContainerClient {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    return this._blobServiceClient.getContainerClient(this._containerName);
  }

  // Upload file to azure storage
  public async uploadFile(source: Buffer | string, targetFile: string): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    if (!await containerClient.exists()) await containerClient.create();
    const blobClient = containerClient.getBlockBlobClient(targetFile);
    if (typeof source === 'string') {
      // Upload file from local file path
      await blobClient.uploadFile(source);
    } else {
      // Upload file from buffer
      await blobClient.upload(source, source.length);
    }
  }

  // Download file from azure storage
  public async downloadFile(fileName: string): Promise<BlobDownloadResponseParsed> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    if (!await blobClient.exists()) throw new Error(`${this._error_prefix} The file is not exist`);
    return blobClient.download();
  }

  // Delete the file from azure storage
  public async deleteFile(fileName: string): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.delete();
  }

  // Copy the file from azure storage
  public async copyFile(sourceFileName: string, targetFileName: string): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    const sourceBlobClient = containerClient.getBlockBlobClient(sourceFileName);
    const targetBlobClient = containerClient.getBlockBlobClient(targetFileName);
    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();
  }

  // Create blob SAS token
  public async createBlobSasToken(fileName: string, duration: number, permissions: string = 'r'): Promise<string> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const sasToken = await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse(permissions),
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().getTime() + duration),
    });
    return sasToken;
  }
}
