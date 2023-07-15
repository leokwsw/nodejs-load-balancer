const express2 = require("express")

const handler2 = num => (req, res) => {
  const {method, url, headers, body} = req;
  res.send('Response from server ' + num);
}


let total = 10;
let portStart = 3000

for (let i = 0; i < total; i++) {
  const app = express2();
  const port = portStart + i

  app.get('*', handler2(i + 1)).post('*', handler2(i + 1));

  app.listen(port, err => {
    if (err) {
      console.log(`Failed to listen on PORT ${port}`)
    } else {
      console.log(`Application Server listening on PORT ${port}`);
    }
  });
}
