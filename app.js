const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
let port = new SerialPort({ path: 'COM3',  baudRate: 9600, autoOpen: false });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'FelixItsMe#1412',
    port: 5432,
});

client.connect();

const http = require('http')

const server = http.createServer((req, res) => {

  // res.setHeader('Content-Type', 'application/json')

  switch (req.url) {

    case '/open':
      res.write(JSON.stringify({status: 'ok'}))
      port.open((err) => {
        console.log('Port open');
        console.log(err);
      })
      break;

    case '/close':
      res.write(JSON.stringify({status: 'ok'}))
      port.close((err) => {
        console.log('Port close');
        console.log(err);
      })
      break;

    case '/get-data':
      client.query(`SELECT * FROM telemetri`, (err, resD) => {
        if (err) {
          console.error(err);
        }
        res.end(JSON.stringify(resD.rows))
      });
      break;
  
    default:
      break;
  }

  res.end()
});

server.listen(3000, 'localhost', () => {
  console.log('Listening to request');
})

// Read the port data
// port.on("open", () => {
//   console.log('serial port open');
// });

// port.open((err) => {
//   console.log(err);
// })

parser.on('data', data =>{
  console.log('got word from arduino:');
  const val = JSON.parse(data)
  console.log(val);
  const query = `
  INSERT INTO telemetri
  VALUES ('`+val['ID']+`', '`+val['sensorType']+`', `+val['suhu']+`)
  `;
  client.query(query, (err, res) => {
    if (err) {
        console.error(err);
    }
    console.log('Data insert successful');
  });
});