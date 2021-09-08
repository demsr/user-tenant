const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Redis = require("ioredis");
const redis = new Redis();
const RefTenant = require("./RefTenant");

const Schema = new mongoose.Schema({
  name: String,

  tenant: { type: mongoose.Types.ObjectId, ref: "RefTenant" },
});

Schema.post("save", (model) => {
  redis.publish("user", JSON.stringify(model));
});

module.exports = mongoose.model("User", Schema);
