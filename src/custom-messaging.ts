import * as fs from 'fs-extra';
import firebase from 'firebase-admin';
import { App, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { Message, MulticastMessage } from 'firebase-admin/messaging';

export class CustomMessaging {

  private _app: App;
  constructor(absoluteCredentialPath: string) {
    const serviceAccount = this._readCredentialAsServiceAccount(absoluteCredentialPath);
    this._app = initializeApp({ credential: firebase.credential.cert(serviceAccount)});
  }

  private _readCredentialAsServiceAccount(credentialPath: string): ServiceAccount {
    try {
      const buf = 
    } catch (error) {
      
    }
  }
}