export class Router {
  #middlewares = new Set()
  #registeredRoutes = new Map()
  #subApps = new Map()

  getRoute(path, method, next) {
    const route = this.#registeredRoutes.get(path)?.[method]
    if (!route) next(new Error("Not Found"))
    
    return route
  }

  setRoute({ path, method, routeCb }) {
    let route = this.#registeredRoutes.get(path)
    route = {
      ...route,
      [method]: routeCb
    }

    this.#registeredRoutes.set(path, route)
  }

  setSubApp(path, app) {
    this.#subApps.set(path, app)
  }

  setMiddleware(middleware) {
    this.#middlewares.add(middleware)
  }

  getMiddlewareIterator() {
    return this.#middlewares.values()
  }

  handleSubAppRouting(request, response) {
    let isHandled = false

    for(const [ path, subApp ] of this.#subApps) {
      if(!request.basePath.startsWith(path)) continue

      request.basePath = request.basePath.replace(path, "")

      subApp.emit("request", request, response)
      isHandled = true
    }

    return isHandled
  }

  handleAppRouting(request, response) {
    const iterator = this.getMiddlewareIterator()
    const next = (err) => {
      if(err) throw err
      
      const { value: middleware, done } = iterator.next()
      if (done) {
        const route = this.getRoute(request.basePath, request?.method, next)
        route(request, response)
        return
      }
      middleware(request, response, next)
    }
    next()
  }
}