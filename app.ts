import * as express from 'express';
import * as cors from 'cors';
import * as multer from 'multer';
import * as responseTime from 'response-time';
import logger from './src/lib/logger';
import locationsRoutes from './src/routes/locations';
import usersRoutes from './src/routes/users';
import servicesRoutes from './src/routes/services';
import reviewsRoutes from './src/routes/reviews';
import dwellingsRoutes from './src/routes/dwellings';
import badgesRoutes from './src/routes/badges';
import userDataRoutes from './src/routes/userData';

const upload = multer();
const app = express();

const port = process.env.PORT || 8080;

app.use(responseTime((req: express.Request, res: express.Response, time: any) => {
  const ms = Math.round(time * 100) / 100;
  logger.http(`${req.method} ${req.baseUrl} - ${ms} ms`);
  res.setHeader('X-Reponse-Time', ms);
}));
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
app.use(cors());

app.use('/locations', upload.none(), locationsRoutes);
app.use('/reviews', upload.none(), reviewsRoutes);
app.use('/services', upload.none(), servicesRoutes);
app.use('/users', usersRoutes);
app.use('/badges', badgesRoutes);
app.use('/dwellings', dwellingsRoutes);
app.use('/user-data', upload.none(), userDataRoutes);
