import app from "./app";
import { logger } from "./lib/logger";
import { ensureInitialAdmin } from "./lib/auth";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  try {
    await ensureInitialAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ADMIN_INITIAL_PASSWORD must be at least 12 characters.") {
      logger.error("Initial admin bootstrap skipped: ADMIN_INITIAL_PASSWORD must be at least 12 characters.");
    } else {
      logger.error({ err: error }, "Unable to initialize attendance system");
      process.exit(1);
    }
  }
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start();
