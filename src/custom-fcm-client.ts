import firebase from 'firebase-admin';
import { App, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { Message, MulticastMessage } from 'firebase-admin/messaging';

export class CustomFcmClient {

  private _app: App;
  constructor(absoluteCredentialPath: string) {
    const serviceAccount = require(absoluteCredentialPath) as ServiceAccount;
    this._app = initializeApp({ credential: firebase.credential.cert(serviceAccount)});
  }

  private _readCredentialAsServiceAccount(): ServiceAccount {
    
  }
}