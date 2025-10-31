const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const NotFoundError = require("./errors/not-found");
const userRouter = require("./api/users/users.router");
const articlesRouter = require("./api/articles/articles.router");
const usersController = require("./api/users/users.controller");
const authMiddleware = require("./middlewares/auth");
require("./api/articles/articles.schema");
const app = express();

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  /*socket.on("my_event", (data) => {
    console.log(data);
  });
  io.emit("event_from_server", { test: "foo" });*/
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

// Routes publiques (IMPORTANT : définies AVANT les routes protégées)
app.post("/login", usersController.login);
app.post("/api/users", usersController.create); // Inscription publique
app.get("/api/users/:userId/articles", usersController.getArticlesByUserId); // Liste publique

// Routes protégées users (définies explicitement pour éviter les conflits)
app.get("/api/users", authMiddleware, usersController.getAll);
app.get("/api/users/:id", authMiddleware, usersController.getById);
app.put("/api/users/:id", authMiddleware, usersController.update);
app.delete("/api/users/:id", authMiddleware, usersController.delete);

// Routes protégées articles
app.use("/api/articles", authMiddleware, articlesRouter);

app.use("/", express.static("public"));

app.use((req, res, next) => {
  next(new NotFoundError());
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;
  res.status(status);
  res.json({
    status,
    message,
  });
});

module.exports = {
  app,
  server,
};