import TranslationWorker from './worker/translationWorker';
import {PubSub} from '@google-cloud/pubsub';
import config from './config';
import TranslationService from './worker/translationService';
import FirestoreConnection from './worker/firestore';
import * as grpc from '@grpc/grpc-js';
import * as dotenv from 'dotenv';

export const start = async () => {
  dotenv.config();
  const pubSubConf = Object.assign({}, config.googlePubSub);
  pubSubConf.sslCreds = pubSubConf.sslCreds || grpc.credentials.createInsecure();
  if (process.env.PUBSUB_EMULATOR_HOST) {
    const [pubSubHost, pubSubPort] = process.env.PUBSUB_EMULATOR_HOST.split(':');
    pubSubConf.servicePath = pubSubHost;
    pubSubConf.port = pubSubPort;
  }
  const pubSub = new PubSub(pubSubConf);
  const store = new FirestoreConnection(config.firestore);
  await store.connect();
  const service = new TranslationService(store.films, config);
  const worker = new TranslationWorker(pubSub, service);
  await worker.start();
};