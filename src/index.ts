import {start} from './start';
import * as log4js from 'log4js';

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: [ 'console' ], level: 'debug' } }
});

start()
  .then(() => {
    console.log('Worker service has started');
  });