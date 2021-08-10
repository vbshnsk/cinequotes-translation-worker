export type FirestoreQuoteModel = {
  id?: string
  text: string
  actorRef: string
  translations?: Record<string, string>
};