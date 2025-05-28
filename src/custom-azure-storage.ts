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

  get blobServiceClient(): BlobServiceClient | null {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);
    return this._blobServiceClient;
  }

  private readonly _error_prefix = '[custom-azure-storage]';

  private _accountName: string = '';

  private _accountKey: string = '';

  private _storageSharedKeyCredential: StorageSharedKeyCredential | null = null;

  // Set connection string
  public useConnectionString(connectionString: string): CustomAzureStorage {
    this._connectionString = connectionString;
    return this;
  }

  // Will be deprecated in future versions
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

  // Will be deprecated in future versions
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

  // Upload file to azure storage
  public async upload(source: Buffer | string, container: string, path: string): Promise<void> {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);

    const containerClient = this._blobServiceClient.getContainerClient(container);
    if (!await containerClient.exists()) await containerClient.create();
    const blobClient = containerClient.getBlockBlobClient(path);
    if (typeof source === 'string') {
      await blobClient.uploadFile(source);
    } else {
      await blobClient.upload(source, source.length);
    }
  }

  // Will be deprecated in future versions
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

  // Download file from azure storage
  public async download(container: string, fileName: string): Promise<BlobDownloadResponseParsed> {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);

    const blobClient = this._blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(fileName);
    if (!await blobClient.exists()) throw new Error(`${this._error_prefix} The file is not exist`);
    return blobClient.download();
  }

  // Will be deprecated in future versions
  // Delete the file from azure storage
  public async deleteFile(fileName: string): Promise<void> {
    if (!this._blobServiceClient) {
      throw new Error(`${this._error_prefix} The blob service client is not initial`);
    }
    const containerClient = this._blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.delete();
  }

  // Delete the file from azure storage
  public async delete(container: string, fileName: string): Promise<void> {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);

    await this._blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(fileName)
      .delete();
  }

  // Will be deprecated in future versions
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

  // Copy the file from azure storage
  public async copy(container: string, sourceFileName: string, targetFileName: string): Promise<void> {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);

    const containerClient = this._blobServiceClient.getContainerClient(container);
    const sourceBlobClient = containerClient.getBlockBlobClient(sourceFileName);
    const targetBlobClient = containerClient.getBlockBlobClient(targetFileName);
    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();
  }

  // Will be deprecated in future versions
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

  // Create blob SAS token
  public async createSasToken(container: string, fileName: string, duration: number, permissions: string = 'r'): Promise<string> {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);

    const blobClient = this._blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(fileName);
    return blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse(permissions),
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().getTime() + duration),
    });
  }

  // Create account storage file/folder SAS token
  public createFolderSASToken(
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
