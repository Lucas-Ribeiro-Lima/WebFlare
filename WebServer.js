import { createServer } from 'http'
import { ErrorRouter } from './Error.js'
import { Router } from './Router.js'
import { Utils } from './utils.js'

export class WebServer {
  _errorRouter = new ErrorRouter()
  #router = new Router(this._errorRouter)
  #utils = new Utils()


  constructor() {
    this.server = createServer((req, res) => {
      [req, res] = this.#utils.populateHttpObject(req, res)
      try {
        this.#router.handleRequest(req, res)
      } catch (err) {
        this._errorRouter.controlErrorFlow(err, req, res)
      }
    })
  }

  use(pathOrMiddleware, subApp) {
    (subApp)
      ? this.#router.setSubApp(pathOrMiddleware, subApp)
      : this.#setMiddleware(pathOrMiddleware)
  }

  router() {
    return new SubWebServer()
  }

  get(path, ...routeArray) {
    this.#router.setRoute({
      path,
      method: "GET",
      routeArray,
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
}

class SubWebServer extends WebServer {
  constructor() {
    super()
  }
}