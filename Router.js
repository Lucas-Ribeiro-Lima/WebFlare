export class Router {
  _middlewares = new Set()
  _registeredRoutes = new Map()
  _subApps = new Map()
  _errors

  constructor(errorHandlers) {
    this._errors = errorHandlers
  }

  getRoute(path, method ) {
    const route = this._registeredRoutes.get(path)?.[method]
    if (!route) throw new Error("Not Found")
    return route
  }

  setRoute({ path, method, routeArray }) {
    let route = this._registeredRoutes.get(path)
    route = {
      ...route,
      [method]: new Set(routeArray),
    }

    this._registeredRoutes.set(path, route)
  }

  setErrorRouter(router) {
    this._errors = router
  }

  setSubApp(path, app) {
    this._subApps.set(path, app)
  }

  setMiddleware(middleware) {
    this._middlewares.add(middleware)
  }

  getMiddlewareIterator(middlewares) {
    return (middlewares ?? this._middlewares).values()
  }

  async handleRequest(req, res) {
    if (await this.handleMiddlewares(req, res)) return

    if (await this.handleSubRoutes(req, res)) return

    this.handleRoute(req, res)
  }

  async handleMiddlewares(req, res, routeArray) {
    const iterator = this.getMiddlewareIterator(routeArray)

    const next = async (err) => {
      if(err) {
        return this._errors.controlErrorFlow(err, req, res)
      }
      const { value: middleware, done } = iterator.next()
      if(done) return false

      if(!res.writableEnded) {
        try {
          await middleware(req, res, next)
        } catch (err) {
          next(err)
        }
      }
    } 

    return await next()
  }
  
  handleRoute(req, res) {
    const routeArray = this.getRoute(req.basePath, req?.method)
    this.handleMiddlewares(req, res, routeArray)
  }

  async handleSubRoutes(req, res) {
    for (const [path, subApp] of this._subApps) {
      if (!req.basePath.startsWith(path)) continue

      req.basePath = req.basePath.replace(path, "")

      subApp.emit("request", req, res)
      return true
    }
    return res.writableEnded
  }
}