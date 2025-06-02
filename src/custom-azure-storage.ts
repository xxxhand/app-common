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

  // connection map
  private _connectionMap: Map<string, string> = new Map([
    ['DefaultEndpointsProtocol', 'https'],
    ['AccountName', ''],
    ['AccountKey', ''],
    ['EndpointSuffix', 'core.windows.net']
  ]);

  // blob service client
  private _blobServiceClient: BlobServiceClient | null = null;

  get blobServiceClient(): BlobServiceClient {
    if (!this._blobServiceClient) throw new Error(`${this._error_prefix} The blob service client is not initial`);
    return this._blobServiceClient;
  }

  private readonly _error_prefix = '[custom-azure-storage]';

  private _storageSharedKeyCredential: StorageSharedKeyCredential | null = null;

  get storageSharedKeyCredential(): StorageSharedKeyCredential {
    if (!this._storageSharedKeyCredential) throw new Error(`${this._error_prefix} The storage shared key credential is not initial`);
    return this._storageSharedKeyCredential;
  }

  // Set connection string
  public useConnectionString(connectionString: string): CustomAzureStorage {
    this._connectionString = connectionString;
    this.parseConnectionString(this._connectionString);
    return this;
  }

  private parseConnectionString(connectionString: string): void {
    const pairs = connectionString.split(';');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      const key = pair.substring(0, idx);
      const value = pair.substring(idx + 1);
      if (this._connectionMap.has(key)) this._connectionMap.set(key, value);
    }
  }

  // Will be deprecated in future versions
  // Set container name
  public useContainerName(containerName: string): CustomAzureStorage {
    this._containerName = containerName;
    return this;
  }

  // Initial azure storage instance
  public initial(): CustomAzureStorage {
    if (!CustomValidator.nonEmptyString(this._connectionString)) throw new Error(`${this._error_prefix} Connection string is required`);
    this._blobServiceClient = BlobServiceClient.fromConnectionString(this._connectionString);
    if (this._connectionMap.get('AccountName') === '' || this._connectionMap.get('AccountKey') === '') {
      throw new Error(`${this._error_prefix} Parse connection string failed, please check your connection string`);
    }
    this._storageSharedKeyCredential = new StorageSharedKeyCredential(this._connectionMap.get('AccountName') as string, this._connectionMap.get('AccountKey') as string);

    return this;
  }

  // Get container client
  public getContainerClient(): ContainerClient {
    return this.blobServiceClient.getContainerClient(this._containerName);
  }

  // Will be deprecated in future versions
  // Upload file to azure storage
  public async uploadFile(source: Buffer | string, targetFile: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
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
    const containerClient = this.blobServiceClient.getContainerClient(container);
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
    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    if (!await blobClient.exists()) throw new Error(`${this._error_prefix} The file is not exist`);
    return blobClient.download();
  }

  // Download file from azure storage
  public async download(container: string, fileName: string): Promise<BlobDownloadResponseParsed> {
    const blobClient = this.blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(fileName);
    if (!await blobClient.exists()) throw new Error(`${this._error_prefix} The file is not exist`);
    return blobClient.download();
  }

  // Will be deprecated in future versions
  // Delete the file from azure storage
  public async deleteFile(fileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.delete();
  }

  // Delete the file from azure storage
  public async delete(container: string, fileName: string): Promise<void> {
    await this.blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(fileName)
      .delete();
  }

  // Will be deprecated in future versions
  // Copy the file from azure storage
  public async copyFile(sourceFileName: string, targetFileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
    const sourceBlobClient = containerClient.getBlockBlobClient(sourceFileName);
    const targetBlobClient = containerClient.getBlockBlobClient(targetFileName);
    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();
  }

  // Copy the file from azure storage
  public async copy(container: string, sourceFileName: string, targetFileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(container);
    const sourceBlobClient = containerClient.getBlockBlobClient(sourceFileName);
    const targetBlobClient = containerClient.getBlockBlobClient(targetFileName);
    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
    await copyPoller.pollUntilDone();
  }

  // Will be deprecated in future versions, use 'createSasToken'
  // Create blob SAS token
  public async createBlobSasToken(fileName: string, duration: number, permissions: string = 'r'): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const sasToken = await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse(permissions),
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().getTime() + duration),
    });
    return sasToken;
  }

  // Create account storage file/folder SAS token
  public createSasToken(
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
      this.storageSharedKeyCredential
    ).toString();
  }

  public getDomain(): string {
    return `${this._connectionMap.get('DefaultEndpointsProtocol')}://${this._connectionMap.get('AccountName')}.blob.${this._connectionMap.get('EndpointSuffix')}`;
  }

  public getUrl(container: string, path: string): string {
    return `${this.getDomain()}/${container}/${path}`;
  }
}
