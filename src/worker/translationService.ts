import Config from '../@types/config';
import IFilms from '../@types/films';
import {Translate} from '@google-cloud/translate/build/src/v2';
import * as log4js from 'log4js';
import {Logger} from 'log4js';

export default class TranslationService {
  private _model: IFilms;
  private _config: Config;
  private readonly _translator: Translate;
  private _logger: Logger;

  constructor(filmModel: IFilms, config: Config) {
    this._model = filmModel;
    this._config = config;
    this._translator = new Translate();
    this._logger = log4js.getLogger('TranslationService');
  }

  get translator() {
    return this._translator;
  }

  async setTranslations(filmId: string, quoteId: string, text: string): Promise<void> {
    type Translation = {
      language: string,
      text: string
    };
    const promises: Array<Promise<Translation>> = [];
    for (const target of this._config.translations) {
      promises.push(this._translator.translate(text, target)
        .then(v => {return {
          language: target,
          text: v[0]
        };}));
    }
    const results = (await Promise.allSettled(promises))
      .filter((v): v is PromiseFulfilledResult<Translation> => v.status === 'fulfilled')
      .map(v => v.value);
    this._logger.debug(`Received following translations: ${results}`);
    const translations: Record<string, string> = {};
    for (const result of results) {
      translations[result.language] = result.text;
    }

    await this._model.addTranslations(filmId, quoteId, translations);
  }

}