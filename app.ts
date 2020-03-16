import * as express from 'express';
import logger from './src/lib/logger';

const app = express();

const port = 8080;

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});
