import {FirestoreQuoteModel} from './quote';

export type FirestoreFilmModel = {
  id?: string
  title: string
  quotes: Array<FirestoreQuoteModel>
};

export default interface IFilms {
  addTranslations: (filmId: string, quoteId: string, translations: Record<string, string>) => Promise<void>
}
