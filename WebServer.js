import { createServer } from 'http'
import { Router } from './Router.js'
import { ErrorRouter } from './Error.js'
import { Utils } from './utils.js'
import { GlobalError } from './GlobalError.js'

export class WebServer {
  #globalError = new GlobalError()
  #router = new Router()
  #utils = new Utils()
  _errorRouter = new ErrorRouter()

  constructor() {
    this.server = createServer(async (req, res) => {  
      [ req, res ] = this.#utils.populateHttpObject(req, res)
      await this.#controlRequestFlow(req, res)    
    })
  }

  use(pathOrMiddleware, subApp) {
    (subApp)
      ? this.#router.setSubApp(pathOrMiddleware, subApp)
      : this.#setMiddleware(pathOrMiddleware)
  }

  router() { 
    return new SubWebServer(this._errorRouter)
  }

  get(path, routeCb) {
    this.#router.setRoute({
      path,
      method: "GET",
      routeCb
    })
  }

  post(path, routeCb) {
    this.#router.setRoute({
      path,
      method: "POST",
      routeCb
    })
  }

  patch(path, routeCb) {
    this.#router.setRoute({
      path,
      method: "PATCH",
      routeCb
    })
  }

  delete(path, routeCb) {
    this.#router.setRoute({
      path,
      method: "DELETE",
      routeCb
    })
  }

  emit(eventName, ...args) {
    this.server.emit(eventName, ...args)
  }

  listen(port, listenCb) {
    return this.server.listen(port, listenCb)
  }

  #setMiddleware(middleware) {
    (middleware.length === 4)
      ? this._errorRouter.setErrorMiddleware(middleware)
      : this.#router.setMiddleware(middleware)
  }

  #controlRequestFlow(req, res) {
    try {
      if(!this.#router.handleSubAppRouting(req, res)) {
        this.#router.handleAppRouting(req, res)
      }
    } catch (err) {
      this.#controlErrorFlow(err, req, res)
    }
  }

  #controlErrorFlow(err, req, res) {
    (!this._errorRouter.isErrorHandled())
      ? this.#globalError.handle(err, req, res)
      : this._errorRouter.handleErrorRouting(err, req, res)
  }
}

class SubWebServer extends WebServer {
  constructor(errorRouter) {
    super()
    this._errorRouter = errorRouter
  }
}