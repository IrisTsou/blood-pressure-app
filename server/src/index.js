import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { lineApiRouter, lineWebhookRouter } from "./lineRouter.js";
import membersRouter from "./membersRouter.js";
import patientsRouter from "./patientsRouter.js";
import profilesRouter from "./profilesRouter.js";
import recordsRouter from "./recordsRouter.js";
import settingsRouter from "./settingsRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3001;
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use("/api/line", lineWebhookRouter);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/api/patients", patientsRouter);
app.use("/api/patients/:patientId/members", membersRouter);
app.use("/api/patients/:patientId/settings", settingsRouter);
app.use("/api/patients/:patientId/line", lineApiRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/records", recordsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.statusCode ?? 500).json({ error: error.message ?? "Internal server error" });
});

app.listen(port, () => {
  console.log(`API server running on http://127.0.0.1:${port}`);
});
