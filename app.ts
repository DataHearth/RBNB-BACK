import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import logger from './src/lib/logger';
import locationsRoutes from './src/routes/locations';
import usersRoutes from './src/routes/users';
import servicesRoutes from './src/routes/services';
import reviewsRoutes from './src/routes/reviews';
import dwellingsRoutes from './src/routes/dwellings';
import badgesRoutes from './src/routes/badges';
import fileHandling from './src/lib/file';

const app = express();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
app.use(cors());
app.use(bodyParser.json());

app.use('/', locationsRoutes);
app.use('/', usersRoutes);
app.use('/', servicesRoutes);
app.use('/', reviewsRoutes);
app.use('/', dwellingsRoutes);
app.use('/', badgesRoutes);
app.use('/file', fileHandling);
