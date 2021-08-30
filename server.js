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
const Tenant = require("./models/Tenant");

const publicKey = fs.readFileSync("./public.key", "utf8");

app.use(jwt({ secret: publicKey, algorithms: ["RS256"] }));

app.use(guard.check("tenant:read"));

app.get("/", (req, res) => {
  Tenant.find({}, (err, tenants) => {
    if (err) return res.status(500).send("app.find err");
    res.send(tenants);
  });
});

mdb.once("open", () => {
  console.log(chalk.green("MongoDB connected"));
  app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
  });
});
