import {
  BlobDownloadResponseParsed,
  BlobServiceClient,
  ContainerClient,
  SASProtocol,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { Buffer } from 'buffer';
import {
  StorageSharedKeyCredential,
  DataLakeSASPermissions,
  generateDataLakeSASQueryParameters,
} from '@azure/storage-file-datalake';
import { CustomValidator } from './custom-validator';

export class CustomAzureStorage {
  // connection string
  private _connectionString: string = '';

  // container name
  private _containerName: string = '';

  // blob service client
  private _blobServiceClient: BlobServiceClient | null = null;

  private readonly _error_prefix = '[custom-azure-storage]';

  private _accountName: string = '';

  private _accountKey: string = '';

  private _storageSharedKeyCredential: StorageSharedKeyCredential | null = null;

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

  public useAccountName(accountName: string): CustomAzureStorage {
    this._accountName = accountName;
    return this;
  }

  public useAccountKey(accountKey: string): CustomAzureStorage {
    this._accountKey = accountKey;
    return this;
  }

  // Initial azure storage instance
  public initial(): CustomAzureStorage {
    if (CustomValidator.nonEmptyString(this._connectionString)) this._blobServiceClient = BlobServiceClient.fromConnectionString(this._connectionString);
    if (CustomValidator.nonEmptyString(this._accountName) && CustomValidator.nonEmptyString(this._accountKey)) {
      this._storageSharedKeyCredential = new StorageSharedKeyCredential(this._accountName, this._accountKey);
    }
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
  public async uploadFile(source: Buffer | string, targetFile: string, container: string = ''): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(container || this._containerName);
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
  public async downloadFile(fileName: string, container: string = ''): Promise<BlobDownloadResponseParsed> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(container || this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    if (!await blobClient.exists()) throw new Error(`${this._error_prefix} The file is not exist`);
    return blobClient.download();
  }

  // Delete the file from azure storage
  public async deleteFile(fileName: string, container: string = ''): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(container || this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.delete();
  }

  // Copy the file from azure storage
  public async copyFile(sourceFileName: string, targetFileName: string, container: string = ''): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(container || this._containerName);
    const sourceBlobClient = containerClient.getBlockBlobClient(sourceFileName);
    const targetBlobClient = containerClient.getBlockBlobClient(targetFileName);
    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();
  }

  // Create blob SAS token
  public async createBlobSasToken(fileName: string, duration: number, permissions: string = 'r', container: string = ''): Promise<string> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(container || this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const sasToken = await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse(permissions),
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().getTime() + duration),
    });
    return sasToken;
  }

  // Create account storage folder SAS token
  public generateAzureStorageSASToken(
    container: string,
    pathName: string,
    isDirectory: boolean = false,
    duration: number = 60 * 60 * 24,
    permissions: string = 'r'
  ): string {
    if (!this._storageSharedKeyCredential) throw new Error(`${this._error_prefix} The storage shared key credential is not initial`);
    return generateDataLakeSASQueryParameters(
      {
        fileSystemName: container,
        startsOn: new Date(),
        expiresOn: new Date(new Date().getTime() + duration * 1000),
        permissions: DataLakeSASPermissions.parse(permissions),
        pathName,
        isDirectory,
      },
      this._storageSharedKeyCredential
    ).toString();
  }
}
