interface IBaseRequest {
  requestId: string
  requestType: string
}

interface ISetTranslationRequest extends IBaseRequest {
  filmId: string
  quoteId: string
  text: string
}