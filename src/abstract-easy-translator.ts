import * as fs from 'fs-extra';
import { CustomValidator } from './custom-validator';

export abstract class TEasyTranslator {
  /** Prefix for console log */
  protected errPrefix: string = '';

  /** Files extension that being supported, default to json */
  protected supportExtenstion: string = '.json';

  /** Directory path that includes [locale].json */
  protected resourcesPath: string = '';

  /** Default locale if not found */
  protected fallbackLng: string = 'dev';

  /** Dictionary, this content would like {'en', {'IS_EMPTY': 'is empty!!' } } */
  protected translationDictionary: Map<string, Record<string, string>> = new Map();

  /** Use the directory path that includes [locale].json, it must be absoulte path */
  public useResources(absoultePath: string): TEasyTranslator {
    if (CustomValidator.nonEmptyString(absoultePath)) {
      this.resourcesPath = absoultePath;
    }
    return this;
  }

  /** Use specified dictionary w/ locale */
  public useDictionary(locale: string, dict: Record<string, string>): TEasyTranslator {
    this.translationDictionary.set(locale.toLowerCase(), dict);
    return this;
  }

  /** Use default locale if not found */
  public useFallbackLng(lng: string): TEasyTranslator {
    if (CustomValidator.nonEmptyString(lng)) {
      this.fallbackLng = lng.toLowerCase();
    }
    return this;
  }

  public async initial(): Promise<TEasyTranslator> {
    if (CustomValidator.nonEmptyString(this.resourcesPath)) {
      const exists = await fs.exists(this.resourcesPath);
      if (!exists) {
        throw new Error(`${this.errPrefix} The reources directory is not exists`);
      }
      const stat = await fs.stat(this.resourcesPath);
      if (!stat.isDirectory()) {
        throw new Error(`${this.errPrefix} Input path ${this.resourcesPath} is not a directory`);
      }
      const files = await fs.readdir(this.resourcesPath);
      const acceptedFiles = files.filter((x) => x.endsWith(this.supportExtenstion));
      if (!CustomValidator.nonEmptyArray(acceptedFiles)) {
        throw new Error(`${this.errPrefix} Input path ${this.resourcesPath} must have at least one file named ${this.fallbackLng}${this.supportExtenstion}`);
      }
      for (let i = 0; i < acceptedFiles.length; i += 1) {
        const lng = acceptedFiles[i].substring(0, acceptedFiles[i].lastIndexOf(this.supportExtenstion));
        console.log(`${this.errPrefix} Load support lang: ${lng}`);
        const content = await fs.readFile(`${this.resourcesPath}/${acceptedFiles[i]}`, { encoding: 'utf-8' });
        this.translationDictionary.set(lng.toLowerCase(), JSON.parse(content));
      }
    }
    return this;
  }

  public t(key: string, locale?: string): string {
    let currLocale = locale;
    if (!(CustomValidator.nonEmptyString(locale) && this.translationDictionary.has(locale!.toLowerCase()))) {
      currLocale = this.fallbackLng;
    }
    const currDict = this.translationDictionary.get(currLocale!.toLowerCase());
    if (currDict) {
      const str = currDict[key];
      if (CustomValidator.nonEmptyString(str)) {
        return str;
      }
    }
    return key;
  }
}
