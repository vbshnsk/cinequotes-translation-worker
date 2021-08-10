import TranslationService from './translationService';
import {SinonSandbox} from 'sinon';
import * as sinon from 'sinon';
import FirestoreConnection from './firestore';
import config from '../config';
import IDatastoreConnection from '../@types/datastoreConnection';

describe('Translation service', () => {
  let service: TranslationService, sandbox: SinonSandbox, store: IDatastoreConnection;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    store = new FirestoreConnection({
      projectId: 'dummy'
    });
    service = new TranslationService(store.films, config);
  });

  it('should set translations', async () => {
    const addTranslations = sandbox.stub(store.films, 'addTranslations')
      .resolves();
    const translate = sandbox.stub(service.translator, 'translate')
      .resolves(['translation']);

    await service.setTranslations('id', 'id', 'text');

    sinon.assert.calledOnce(translate);
    sinon.assert.calledWith(addTranslations, 'id', 'id', {
      fr: 'translation'
    });
  });

});