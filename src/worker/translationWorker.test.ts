import TranslationService from './translationService';
import {SinonSandbox} from 'sinon';
import IDatastoreConnection from '../@types/datastoreConnection';
import * as sinon from 'sinon';
import FirestoreConnection from './firestore';
import config from '../config';
import {PubSub} from '@google-cloud/pubsub';
import TranslationWorker from './translationWorker';
import * as grpc from '@grpc/grpc-js';

describe('Translation worker', () => {

  let service: TranslationService,
    sandbox: SinonSandbox,
    store: IDatastoreConnection,
    pubSub: PubSub,
    worker: TranslationWorker;

  beforeAll(async () => {
    const conf = Object.assign({}, config.googlePubSub);
    const [pubSubHost, pubSubPort] = process.env.PUBSUB_EMULATOR_HOST.split(':');
    conf.servicePath = pubSubHost;
    conf.port = pubSubPort;
    conf.sslCreds = grpc.credentials.createInsecure();
    sandbox = sinon.createSandbox();
    store = new FirestoreConnection({
      projectId: 'dummy'
    });
    service = new TranslationService(store.films, config);
    pubSub = new PubSub(conf);
    worker = new TranslationWorker(pubSub, service);
    await worker.start();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should process translation request', async () => {
    const translationStub = sandbox.stub(service, 'setTranslations')
      .resolves();

    await pubSub.topic('translate').publish(Buffer.from(JSON.stringify({
      requestId: 'id',
      requestType: 'setTranslation',
      filmId: 'id',
      quoteId: 'id',
      text: 'text'
    })));

    await new Promise(res => setTimeout(res, 1000));

    sinon.assert.calledOnce(translationStub);
  });

});