import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const appEnv = process.env;
const portHttp = appEnv.PORT || 5000;
const portHttps = appEnv.HTTPS_PORT || 5001;
import { configureProxy } from './proxy.js';
import { configureMockRoutes } from './mocker.js';

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'mock_config.json');
console.log(`Using config file: ${configPath}`);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let messageCounter = 0;
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use((req, res, next) => {
  messageCounter += 1;

  const coloredString = (color, endColor = 'reset') => {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
    };
    if (!(color in colors)) color = 'reset';

    return message => `${colors[color]}${message}${colors[endColor]}`;
  };

  console.log(`
${coloredString('green')(
  `============= START message ${messageCounter} ==============`,
)}

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
${coloredString('blue')(
  `============= END message ${coloredString(
    'red',
    'blue',
  )(messageCounter)} ==============`,
)}

`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Running' });
});

// Proxies
if (config.proxies && config.proxies.length > 0) {
  configureProxy(app, config);
} else {
  console.info('No proxies defined in config.json');
}

Object.entries(config.mocks || {}).forEach(([mockPath, mockDirectory]) => {
  mockPath = mockPath.startsWith('/') ? mockPath : `/${mockPath}`;
  mockPath = mockPath.endsWith('/') ? mockPath.slice(0, -1) : mockPath;

  const target_dir = path.join(__dirname, '..', mockDirectory);
  app.use(mockPath, configureMockRoutes(target_dir));
});

app.use((req, res) => res.status(500).json({ error: 'Error 🤡' }));

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
