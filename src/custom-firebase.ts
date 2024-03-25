import * as fs from 'fs';
import { credential } from 'firebase-admin';
/* eslint-disable import/no-unresolved */
import { App, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { Firestore, getFirestore, CollectionReference } from 'firebase-admin/firestore';
import {
  Messaging, getMessaging, MulticastMessage, BatchResponse,
} from 'firebase-admin/messaging';

import { DEFAULT_FIREBASE_NAME, TNullable, DEFAULT_ENCODING } from './custom-definition';

export class CustomFirebase {
  /** Firebase credential file path */
  private _credentialFile: string = '';

  /** Name of the filrebase instance */
  private _instanceName: string = DEFAULT_FIREBASE_NAME;

  /** Firebase instance */
  private _appInstance: TNullable<App> = null;

  /** Instance of push notification */
  private _messaging: TNullable<Messaging> = null;

  /** Instance of firestore database */
  private _firestore: TNullable<Firestore> = null;

  /** To save the collections of firestore */
  private _firestoreCollections: Set<string> = new Set();

  private readonly _error_prefix = '[custom-firebase]';

  /** Set credential file path */
  public useCredentialFile(absoluteCredentialPath: string): CustomFirebase {
    this._credentialFile = absoluteCredentialPath;
    return this;
  }

  /** Set instance name */
  public useInstanceName(instanceName: string = DEFAULT_FIREBASE_NAME): CustomFirebase {
    this._instanceName = instanceName;
    return this;
  }

  /** To set used collections for firestore instance */
  public useCollections(cols: string[]): CustomFirebase {
    cols.forEach((x) => this._firestoreCollections.add(x));
    return this;
  }

  public getInstanceName(): string {
    if (!this._appInstance) {
      throw new Error(`${this._error_prefix} The app instance is not initial`);
    }
    return this._appInstance.name;
  }

  /** Initial firebase instance */
  public initial(): CustomFirebase {
    const account = this._readCredentialAsServiceAccount();
    this._appInstance = initializeApp({ credential: credential.cert(account) }, this._instanceName);
    this._messaging = getMessaging(this._appInstance);
    this._firestore = getFirestore(this._appInstance);
    return this;
  }

  /** To send notification to all specific device tokens */
  public async notifyClients(payload: MulticastMessage): Promise<BatchResponse> {
    if (!this._messaging) {
      throw new Error(`${this._error_prefix} The messaging instance is not initial`);
    }
    return this._messaging.sendEachForMulticast(payload);
  }

  /** To get collection by name from firestore */
  public getCollection(collectionName: string): CollectionReference {
    if (!this._firestore) {
      throw new Error(`${this._error_prefix} The firestore instance is not initial`);
    }
    if (!this._firestoreCollections.has(collectionName)) {
      throw new Error(`${this._error_prefix} The firestore collection ${collectionName} is not exists`);
    }
    return this._firestore.collection(collectionName);
  }

  /** Read credential file */
  private _readCredentialAsServiceAccount(): ServiceAccount {
    try {
      const str = fs.readFileSync(this._credentialFile, { encoding: DEFAULT_ENCODING });
      const account = JSON.parse(str) as ServiceAccount;
      return account;
    } catch {
      throw new Error(`${this._error_prefix} Read credential file fail`);
    }
  }
}
