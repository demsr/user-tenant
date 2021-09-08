require("dotenv").config();
const express = require("express");
const app = express();
const chalk = require("chalk");
const cors = require("cors");
const mdb = require("./db/MongoDB");
const fs = require("fs");
const jwt = require("express-jwt");
const guard = require("express-jwt-permissions")();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const User = require("./models/User");

const publicKey = fs.readFileSync("./public.key", "utf8");

app.use(jwt({ secret: publicKey, algorithms: ["RS256"] }));

app.use(guard.check("user:read"));

app.get("/", (req, res) => {
  User.find({}, (err, users) => {
    if (err) return res.status(500).send("app.find err");
    res.send(users);
  });
});

app.get("/:userId", (req, res) => {
  let { userId } = req.params;
  User.findById(userId, (err, users) => {
    if (err) return res.status(500).send("app.find err");
    res.send(users);
  });
});

app.post("/", guard.check("user:create"), (req, res) => {
  let data = req.body;

  new User(data).save((err, user) => {
    if (err) return res.status(500).send();
    res.send(user);
  });
});

app.patch("/:userId", (req, res) => {
  let { userId } = req.params;
  let data = req.body;

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).send();

    Object.assign(user, data);

    user.save((err) => {
      if (err) return res.status(500).send();
      res.send(user);
    });
  });
});

mdb.once("open", () => {
  console.log(chalk.green("MongoDB connected"));
  app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
  });
});
