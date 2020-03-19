import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import logger from './src/lib/logger';
import locationsRoutes from './src/routes/locations';
import usersRoutes from './src/routes/users';
import servicesRoutes from './src/routes/services';

const app = express();

const port = 8080;

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello, world!'));

app.use('/', locationsRoutes);
app.use('/', usersRoutes);
app.use('/', servicesRoutes);
