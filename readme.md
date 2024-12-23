# WebServer

A lightweight and extensible web server inspired by Express.js, designed for simplicity and performance.

![npm](https://img.shields.io/npm/v/webflare) 
![license](https://img.shields.io/github/license/Lucas-Ribeiro-Lima/WebFlare) 
![contributors](https://img.shields.io/github/contributors/Lucas-Ribeiro-Lima/WebFlare)
---

## Features

- ⚡ Minimalistic API for creating web servers
- 🛠️ Middleware support
- 🌐 Routing system with HTTP method handling
- 🚨 Custom error handling
- 💡 Inspired by Express.js but with additional flexibility

---

## Installation

To install this package, use npm:

```bash
npm install webflare
```

---

## Usage

Here’s an example of how to use the `WebFlare`:

```javascript
const { createApp, Router, ServeStatic } = require('webflare');

const app = createApp();

// Define routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.post("/async", async (req, res) => {
  // Throwing errors here is supported
  // and handled by global error handler
  res.send("Async route");
});

// Serve static content
app.use(ServeStatic("/public"));

// Sub-routes using Router
const apiRouter = Router();

apiRouter.get('/users', (req, res) => {
  res.send({ message: 'List of users' });
});

app.use('/api', apiRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## Error Handling

Error handlers are functions with the following signature: `(err, req, res, next)`. These functions are executed instead of the global error handler when defined.

Example:

```javascript
export async function handleError(err, req, res, next) {
  if (err.message === "user not authenticated") {
    res.status(401).send({ code: 401, message: "não autenticado" });
    return;
  }
  res.status(500).send({ code: 500, message: err.message });
}
```

---

## Middlewares

Middleware functions intercept and process requests before they reach route handlers. Example:

```javascript
function isAuthenticated(req, res, next) {
  if (!req.session) {
    // Allow throwing errors in middlewares
    throw new Error("User not authenticated");
  }
  next();
}
```

---

## API Reference

### `createApp()`

Creates a new instance of the `WebServer`.

### `Router()`

Creates a new router instance that can be used for sub-routing.

### `app.get(path, handler)`

Registers a handler for GET requests at the specified path.

### `app.post(path, handler)`

Registers a handler for POST requests.

### `app.put(path, handler)`

Registers a handler for PUT requests.

### `app.patch(path, handler)`

Registers a handler for PATCH requests.

### `app.delete(path, handler)`

Registers a handler for DELETE requests.

### `app.use(middleware)`

Registers a middleware function.

### `app.use(path, router)`

Mounts a router at the specified path.

### `app.use(ErrorHandler)`

Defines a custom error handler function.

### `app.listen(port, callback)`

Starts the server on the specified port.

---

## Contributing

Contributions are welcome! If you have ideas for improvements or find a bug, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Lucas-Ribeiro-Lima/WebServer).

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by Lucas Ribeiro Lima
