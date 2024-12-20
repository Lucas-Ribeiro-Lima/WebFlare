import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WebServer } from './WebServer.js'

export const createApp = () => new WebServer()

export const serverStatic = (directory) => {
  return async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error)
    }
  }
}