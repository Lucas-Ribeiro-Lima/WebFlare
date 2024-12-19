export class ErrorRouter {
  #errorHandlers = new Set()

  setErrorMiddleware(middleware) {
    this.#errorHandlers.add(middleware)
  }

  getErrorHandlersIterator() {
    return this.#errorHandlers.values()
  }

  isErrorHandled() {
    return this.#errorHandlers.size
  }

  handleErrorRouting(err, request, response) {
    response.statusCode = err.code
    const iterator = this.getErrorHandlersIterator()

    const next = () => {
      const { value: errorHandler, done } = iterator.next()
      if (done) return
      errorHandler(err, request, response, next)
    }

    next() 
  }
}