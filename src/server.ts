import express, { Application } from "express";
import http from "http";
import debug from "debug";

export const app: Application = express();

// Handle any uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Error: ", err);
  debug(" UNCAUGHT EXCEPTION ");
  debug(`[Inside 'uncaughtException' event] ${err.stack}` || err.message);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any) {
  const parsedPort = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(parsedPort)) {
    // named pipe
    return val;
  }

  if (parsedPort >= 0) {
    return parsedPort;
  }

  return false;
}

const port: number = normalizePort(process.env.PORT || "3001");
app.set("port", port);

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  console.log("============================================================");
  console.log(`Server is listening on port ${port} !`);
});

server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      debug(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      debug(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr: any = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}
