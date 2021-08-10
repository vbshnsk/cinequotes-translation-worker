import FirestoreConnection from './index';

describe('Films queries', () => {
  const store = new FirestoreConnection({
    projectId: 'dummy'
  });

  beforeAll(async () => {
    await store.connect();
  });

  afterAll(async () => {
    await store.disconnect();
  });

  afterEach(async () => {
    await store.flush();
  });

  describe('addTranslations', () => {

    beforeAll(async () => {
      await store.insertAt('films', 'id', {
        id: 'id',
        title: 'title',
        quotes: [{
          id: 'id',
          actorRef: 'id',
          text: 'text',
          translations: {
            ru: 'translation'
          }
        }]
      });
    });

    it('should add translation for quote', async () => {
      await store.films.addTranslations('id', 'id', {
        fr: 'translation'
      });

      const data = (await store.getAt('films', 'id')).data();
      expect(data).toMatchObject({
        title: 'title',
        quotes: [{
          actorRef: 'id',
          translations: {
            ru: 'translation',
            fr: 'translation'
          },
          id: 'id',
          text: 'text'
        }]
      });
    });

  });

});
