export class Router {
  #middlewares = new Set()
  #registeredRoutes = new Map()
  #subApps = new Map()
  #errors

  constructor(errorHandlers) {
    this.#errors = errorHandlers
  }

  getRoute(path, method ) {
    const route = this.#registeredRoutes.get(path)?.[method]
    if (!route) throw new Error("Not Found")
    return route
  }

  setRoute({ path, method, routeArray }) {
    let route = this.#registeredRoutes.get(path)
    route = {
      ...route,
      [method]: new Set(routeArray),
    }

    this.#registeredRoutes.set(path, route)
  }

  setSubApp(path, app) {
    this.#subApps.set(path, app)
  }

  setMiddleware(middleware) {
    this.#middlewares.add(middleware)
  }

  getMiddlewareIterator(middlewares) {
    return (middlewares ?? this.#middlewares).values()
  }

  handleRequest(req, res) {
    this.handleMiddlewares(req, res) ||
    this.handleSubRoutes(req, res) ||
    this.handleRoute(req, res)
  }

  handleMiddlewares(req, res, routeArray) {
    const iterator = this.getMiddlewareIterator(routeArray)

    const next = (err) => {
      if(err) {
        return this.#errors.controlErrorFlow(err, req, res)
      }
      const { value: middleware, done } = iterator.next()
      if(done) return

      middleware(req, res, next)
    }

    next()
  }
  
  handleRoute(request, response) {
    const routeArray = this.getRoute(request.basePath, request?.method)
    this.handleMiddlewares(request, response, routeArray)
  }

  handleSubRoutes(request, response) {
    for (const [path, subApp] of this.#subApps) {
      if (!request.basePath.startsWith(path)) continue

      request.basePath = request.basePath.replace(path, "")

      subApp.emit("request", request, response)
      return true
    }

    return false
  }
}