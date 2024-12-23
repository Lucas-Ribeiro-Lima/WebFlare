import { createServer } from 'http'
import { Router } from 'Webflare/Router.js'
import { ErrorRouter } from 'Webflare/Error.js'
import { Utils } from 'Webflare/utils.js'

export class WebFlare {
  _utils = new Utils()
  _errorRouter = new ErrorRouter()
  _router = new Router(this._errorRouter)

  constructor() {
    this.server = createServer(async (req, res) => {
      [req, res] = this._utils.populateHttpObject(req, res)
      try {
        await this._router.handleRequest(req, res)
      } catch (err) {
        this._errorRouter.controlErrorFlow(err, req, res)
      }
    })
  }

  use(pathOrMiddleware, subApp) {
    if(subApp) {
      subApp._setErrorRouter(this._errorRouter)
      this._router.setSubApp(pathOrMiddleware, subApp)
      return
    }
    this._setMiddleware(pathOrMiddleware)
  }

  get(path, ...routeArray) {
    this._router.setRoute({
      path,
      method: "GET",
      routeArray,
    })
  }

  post(path, routeCb) {
    this._router.setRoute({
      path,
      method: "POST",
      routeCb
    })
  }

  patch(path, routeCb) {
    this._router.setRoute({
      path,
      method: "PATCH",
      routeCb
    })
  }

  put(path, routeCb) {
    this._router.setRoute({
      path,
      method: "PUT",
      routeCb
    })
  }

  delete(path, routeCb) {
    this._router.setRoute({
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

  _setMiddleware(middleware) {
    (middleware.length === 4)
      ? this._errorRouter.setErrorMiddleware(middleware)
      : this._router.setMiddleware(middleware)
  }

  _setErrorRouter(router) {
    this._router.setErrorRouter(router)
  }
}