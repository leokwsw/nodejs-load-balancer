const express = require('express');
const app = express();
const axios = require('axios');

class ServerConfig {
  host: string
  weight: number

  constructor(host: string)
  constructor(host: string, weight: number)

  constructor(...arr: any[]) {
    this.host = arr[0]
    this.weight = arr.length == 2 ? arr[1] : 1
  }
}

const servers: ServerConfig[] = [
  new ServerConfig("http://localhost:3000"),
  new ServerConfig("http://localhost:3001"),
  new ServerConfig("http://localhost:3002"),
  new ServerConfig("http://localhost:3003"),
  new ServerConfig("http://localhost:3004"),
  new ServerConfig("http://localhost:3005"),
  new ServerConfig("http://localhost:3006"),
  new ServerConfig("http://localhost:3007"),
  new ServerConfig("http://localhost:3008"),
  new ServerConfig("http://localhost:3009")
]

let current = -1; // for round-robin
let connectsCount: Map<string, number> = new Map([]) // for least-

let loadBalancerType: "round-robin" | "least-connected" = "least-connected"
let port = 8080


app.use(async (req, res) => {
  const {method, url, headers, body} = req;

  let server: string = ""

  if (loadBalancerType == "round-robin") {
    current += 1
    server = servers[current].host;
    if (current == servers.length) current = -1
  } else if (loadBalancerType == "least-connected") {
    if (connectsCount.size == 0) {
      server = servers[0].host
      for (const url of servers) connectsCount.set(url.host, server == url.host ? 1 : 0)
    } else {
      server = [...connectsCount.entries()].sort((a, b) => a[1] - b[1])[0][0]
      connectsCount.set(server, connectsCount.get(server) + 1)
    }
  }

  if (server == undefined) server = servers[0].host

  try {
    const response = await axios({
      url: `${server}${url}`,
      method: method,
      headers: headers,
      data: body
    });
    res.send(response.data)
  } catch (err) {
    console.log("err", err)
    res.status(500).send("Server error!")
  }
});

app.listen(port, err => {
  if (err) {
    console.log("Failed to listen on PORT " + port)
  } else {
    console.log("Load Balancer Server listening on PORT " + port);
  }
});
