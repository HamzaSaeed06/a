import "dotenv/config";
import httpServer from "./app.js";

const port = Number(process.env.PORT) || 3001;

httpServer.listen(port, () => {
  console.log(`Auction OS API listening on http://localhost:${port}`);
});

httpServer.on("error", (err: Error) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
