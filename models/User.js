const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const redis = require("../db/Redis");

const privateKEY = fs.readFileSync("./private.key", "utf8");

const Schema = new mongoose.Schema({
  name: String,
  tenant: { type: mongoose.Types.ObjectId, ref: "RefTenant" },
  permissions: [String],
});

Schema.methods.generateJWT = async function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      tenant: this.tenant,
      permissions: this.permissions,
      exp: moment().add(5, "minutes").toDate() / 1000,
    },
    privateKEY,
    { algorithm: "RS256" }
  );
};

module.exports = mongoose.model("User", Schema);
