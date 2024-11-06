import { Readable } from 'node:stream';
import * as nodemailer from 'nodemailer';
import { CustomValidator } from './custom-validator';
import { TNullable } from './custom-definition';

export interface IAttachement {
  fileName: string;
  contentType?: string;
  content: Readable;
}

export interface ISendOptions {
  from: string;
  sender?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: IAttachement[];
}

export interface IInitialConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  rejectUnauthorized: boolean;
  tlsMinVersion?: 'TLSv1.2' | 'TLSv1.3';
}

export class CustomMailClient {
  private readonly _errPrefix = '[CustomMailClient]';

  private _instance: TNullable<nodemailer.Transporter>;

  /** Initial SMTP Pool through config */
  public initialSmtpPool(conf: IInitialConfig): void {
    const newOpt: any = {
      secure: conf.port === 465,
      pool: true,
      host: conf.host,
      port: conf.port,
      tls: {
        rejectUnauthorized: conf.rejectUnauthorized,
        minVersion: CustomValidator.nonEmptyString(conf.tlsMinVersion) ? conf.tlsMinVersion : 'TLSv1.2',
      },
    };
    if (CustomValidator.nonEmptyString(conf.user)) {
      newOpt.auth = {
        user: conf.user,
        pass: conf.pass,
      };
    }
    this._instance = nodemailer.createTransport(newOpt);
    console.log(`${this._errPrefix} Initial mail client done`);
  }

  /** To verify SMTP setting complete */
  public async tryVerify(): Promise<boolean> {
    if (!this._instance) {
      throw new Error(`${this._errPrefix} Mailer instance not initialized`);
    }
    return this._instance.verify();
  }

  /** Send email */
  public async send(opts: ISendOptions): Promise<any> {
    if (!this._instance) {
      throw new Error(`${this._errPrefix} Mailer instance not initialized`);
    }

    const newOpt: any = {
      from: opts.from,
      to: opts.to,
      sender: CustomValidator.nonEmptyString(opts.sender) ? opts.sender : opts.from,
      subject: opts.subject,
      cc: opts.cc && CustomValidator.nonEmptyArray(opts.cc) ? opts.cc : [],
      bcc: opts.bcc && CustomValidator.nonEmptyArray(opts.bcc) ? opts.bcc : [],
      text: CustomValidator.nonEmptyString(opts.text) ? opts.text : undefined,
      html: CustomValidator.nonEmptyString(opts.html) ? opts.html : undefined,
      attachments: [],
    };

    if (opts.attachments && CustomValidator.nonEmptyArray(opts.attachments)) {
      opts.attachments.forEach((x) => newOpt.attachments.push({
        filename: x.fileName,
        content: x.content,
      }));
    }

    return this._instance.sendMail(newOpt);
  }
}
