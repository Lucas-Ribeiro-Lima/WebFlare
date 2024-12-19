
export class GlobalError {
  handle (err, req, res, _) {
    const errorCode = (err.message === "Not Found") ? 404 : 500
    const errorMessage = err.message ?? 'Unknown error occurred'
    const errorstack = err.stack ?? ""
    const method = req.method ?? 'UNKNOWN'
    const path = req.url ?? '/'
    const timestamp = new Date().toLocaleString('pt-BR')
  
    const errorPage = `
      <!DOCTYPE html>
        <html>
        <head>
          <title>Error ${errorCode} - Internal Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #d32f2f; }
            p { color: #555; }
            .details { text-align: left; margin: 0 auto; max-width: 600px; background: #f3f3f3; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          </style>
        </head>
        <body>
          <h1>${errorCode} - ${errorMessage}</h1>
          <p>Something went wrong. Please try again later.</p>
          <div class="details">
            <h2>Error Details</h2>
            <p><strong>Message:</strong> ${errorMessage}</p>
            <p><strong>Method:</strong> ${method}</p>
            <p><strong>Path:</strong> ${path}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
            <p>${errorstack}</p>
          </div>
        </body>
      </html>
    `
    res.setHeader('Content-Type', 'text/html');
    res.send(errorCode, errorPage);
  }
}