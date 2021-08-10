import IFilms, {FirestoreFilmModel} from '../../@types/films';
import {CollectionReference, Firestore} from '@google-cloud/firestore';
import {FirestoreQuoteModel} from '../../@types/quote';

export default class FirestoreFilms implements IFilms {
  private _filmsRef: CollectionReference<FirestoreFilmModel>;
  private _firestore: Firestore;

  constructor(
    firestore: Firestore,
    filmsRef: CollectionReference<FirestoreFilmModel>,
  ) {
    this._firestore = firestore;
    this._filmsRef = filmsRef;
  }

  async addTranslations(filmId: string, quoteId: string, translations: Record<string, string>): Promise<void> {
    return this._firestore.runTransaction(async t => {
      const filmQuery = this._filmsRef.doc(filmId);
      const filmRef = await t.get(filmQuery);
      if (filmRef.exists) {
        const data = filmRef.data();
        const {quotes} = data;
        const quote: FirestoreQuoteModel = (quotes || []).find(v => v.id === quoteId);
        if (quote) {
          quote.translations = Object.assign(quote.translations || {}, translations);
        }
        await t.set(filmQuery, data);
      }
    });
  }

}
