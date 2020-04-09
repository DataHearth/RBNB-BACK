// eslint-disable-next-line no-unused-vars
import * as express from 'express';
import firebase from './firebase';
import logger from './logger';

// eslint-disable-next-line max-len
export default async function authenticate(req:express.Request, res:express.Response, next:express.NextFunction) {
  const token = req.headers['www-authenticate'];

  try {
    const {uid} = await firebase.auth().verifyIdToken(token);
    logger.info(`User logged: uid ${uid}`);
    next();
  } catch (error) {
    logger.warn(`User with token ${token} can't be authenticate`, error);
    res.status(401).end();
  }
}
