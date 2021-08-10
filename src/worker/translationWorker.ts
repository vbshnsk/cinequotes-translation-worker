import GooglePubSubConnection from './googlePubSubConnection';
import {PubSub} from '@google-cloud/pubsub';
import TranslationService from './translationService';
import * as log4js from 'log4js';
import {Logger} from 'log4js';

export default class TranslationWorker extends GooglePubSubConnection {
  private _service: TranslationService;
  private _logger: Logger;

  constructor(pubSub: PubSub, service: TranslationService) {
    super(pubSub, 'translate');
    this._service = service;
    this._logger = log4js.getLogger('TranslationWorker');
  }

  async onMessage(message: string) {
    super.onMessage(message);
    this._logger.debug(`Received raw data of: ${message}`);

    const data = JSON.parse(message);

    if (this._requestValidator(data)) {
      const {requestId, requestType} = data;

      switch (requestType) {
        case 'setTranslation':
          if (this._setTranslationValidator(data)) {
            this._logger.debug('Performing setTranslation');
            await this._service.setTranslations(data.filmId, data.quoteId, data.text);
          }
          break;
      }

      this.publish({requestId})
        .then(publishId => {
          delete this.requestsInProgress[publishId];
          delete this.requestsInProgress[requestId];
        });
    }
  }

  private _requestValidator(data): data is IBaseRequest {
    return typeof data.requestId === 'string' &&
      typeof data.requestType === 'string';
  }

  private _setTranslationValidator(data): data is ISetTranslationRequest {
    return typeof data.filmId === 'string' &&
      typeof data.quoteId === 'string' &&
      typeof data.text === 'string';
  }
}