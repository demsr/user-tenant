const mongoose = require("mongoose");
const Redis = require("ioredis");
const redis = new Redis();

const Schema = new mongoose.Schema({
  name: String,
});

const Model = mongoose.model("RefTenant", Schema, "RefTenant");

redis.subscribe("tenant", (err, count) => {
  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    console.error("Failed to subscribe: %s", err.message);
  } else {
    // `count` represents the number of channels this client are currently subscribed to.
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});

redis.on("message", (channel, message) => {
  message = JSON.parse(message);

  Model.findById(message._id, (err, tenant) => {
    if (err) return console.log(err);
    if (!tenant) {
      new Model(message).save((err) => {
        if (err) console.log(err);
      });
    } else {
      tenant.name = message.name;
      tenant.save((err) => {
        if (err) console.log(err);
      });
    }
  });
});

module.exports = Model;
