import { GlobalError } from './GlobalError.js'

export class ErrorRouter {
  _globalError = new GlobalError()
  _errorHandlers = new Set()

  setErrorMiddleware(middleware) {
    this._errorHandlers.add(middleware)
  }

  getErrorHandlersIterator() {
    return this._errorHandlers.values()
  }

  isErrorHandled() {
    return this._errorHandlers.size
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

  controlErrorFlow(err, req, res) {
    (!this.isErrorHandled())
      ? this._globalError.handle(err, req, res)
      : this.handleErrorRouting(err, req, res)
  }
}