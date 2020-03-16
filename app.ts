import * as express from 'express';
import * as cors from 'cors';
import logger from './src/lib/logger';

const app = express();

const port = 8080;

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
app.use(cors());
