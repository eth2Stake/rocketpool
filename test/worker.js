const express = require("express");
const bodyParser = require("body-parser");

const {
  isMainThread,
  Worker,
  parentPort,
  threadId,
} = require('worker_threads');

const app = express();
app.use(function (req, res, next) {
  res.append("access-control-allow-origin", "*");
  res.append("content-type", "application/json; charset=utf-8");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  parentPort.postMessage("hello");
  res.send("Hello World");
  // worker.postMessage()
});

app.post("/v1/validator_pk",async function (req,res){
  const params = req.body;
  console.log("recive validator_pk success");
  parentPort.postMessage(params);
  return res.json();
})

app.post("/v1/prestake_signature",async function (req,res){
  const params = req.body;
  console.log("recive prestake_signature success");
  parentPort.postMessage(params);
  return res.json();
})

app.post("/v1/stake_signature",async function (req,res){
  const params = req.body;
  console.log("recive stake_signature success");
  parentPort.postMessage(params);
  return res.json();
})

app.listen(1234, () =>
  console.log("Start Server, listening on port " + 1234 + "!")
);