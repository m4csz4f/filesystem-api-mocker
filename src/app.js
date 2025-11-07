import dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { parse as parseJsonc } from 'jsonc-parser';

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { coloredMessage } from './helpers/colorLog.js';
import { configureMockRoutes } from './mocker.js';
import { configureProxy } from './proxy.js';

const app = express();
const appEnv = process.env;
const portHttp = appEnv.PORT || 5000;
const portHttps = appEnv.HTTPS_PORT || 5001;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'mock_config.json');
console.log(coloredMessage('yellow')(`Using config file: ${configPath}`));

const config = parseJsonc(fs.readFileSync(configPath, 'utf8'));

let messageCounter = 0;
app.use(cors(corsOptions));

app.use(bodyParser.json());

const blue = coloredMessage('blue');
const redBlue = coloredMessage('red', 'blue');
const green = coloredMessage('green');

app.use((req, res, next) => {
  messageCounter += 1;

  console.log(`
${green(`============= START message ${messageCounter} ==============`)}

URL: ${req.originalUrl}
--------
Method: ${req.method}
--------
Params: ${JSON.stringify(req.params, null, 1)}
--------
Query: ${JSON.stringify(req.query, null, 1)}
--------
Headers: ${JSON.stringify(req.headers, null, 1)}
--------
Body: ${JSON.stringify(req.body, null, 1)}
${blue(`============= END message ${redBlue(messageCounter)} ==============`)}

`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Running' });
});

// Proxies
console.log(coloredMessage('blue', 'blue')('Configuring proxies:'));
if (config.proxies && config.proxies.length > 0) {
  configureProxy(app, config);
} else {
  console.log('No proxies defined in config.json');
}

console.log(green('Configuring mock routes:'));
Object.entries(config.mocks || {}).forEach(([mockPath, mockDirectory]) => {
  mockPath = mockPath.startsWith('/') ? mockPath : `/${mockPath}`;
  mockPath = mockPath.endsWith('/') ? mockPath.slice(0, -1) : mockPath;

  const target_dir = path.join(__dirname, '..', mockDirectory);
  console.log(green(` * ${mockPath || '/'}  -> ${target_dir}`));
  app.use(mockPath, configureMockRoutes(target_dir));
});

console.log('No routes matched, sending default response');
app.use((req, res) =>
  res
    .status(config.default_response?.status ?? 500)
    .json(config.default_response?.body || { error: 'No route matched' }),
);

app.listen(portHttp, () => {
  console.log(
    `Mock API Server is up and running at: http://localhost:${portHttp}`,
  );
});

if (
  fs.existsSync('./certs/certificate.pem') &&
  fs.existsSync('./certs/private-key.pem')
) {
  const httpsOptions = {
    key: fs.readFileSync('./certs/private-key.pem'),
    cert: fs.readFileSync('./certs/certificate.pem'),
  };

  const serverHttps = https.createServer(httpsOptions, app);

  serverHttps.listen(portHttps, () => {
    console.log(
      `Mock API Server is up and running at: https://localhost:${portHttps}`,
    );
  });
}
