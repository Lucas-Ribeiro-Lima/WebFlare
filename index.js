import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WebFlare } from './WebFlare.js' 

export const createApp = () => new WebFlare()

export const Router = () => {
  return new WebFlare()
}

export const ServeStatic = (directory) => {
  return async (req, res, next) => {
    if (!req.basePath.startsWith(directory)) {
      return next()
    }

    const requestedFile =
      req.basePath === directory || req.basePath === `${directory}/`
        ? join(directory, 'index.html')
        : req.basePath;


    const filePath = join(process.cwd(), requestedFile)
    const file = await readFile(filePath)

    res.send(200, file)
  }
}

export const Cors = ({
  origin = "*",
  methods =  'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders = 'Content-Type'
}) => {
  const headers = new Headers(
    {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': allowedHeaders
    }
  )

  return (req, res, next) =>  {
    res.setHeaders(headers)
    if(req.method === "OPTIONS") {
      return res.send(200, "")
    }

    next()
  }
}