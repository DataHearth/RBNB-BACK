import {Router} from 'express';
import admin from '../lib/firebase';
import logger from '../lib/logger';

const firestore = admin.firestore();

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const users = await firestore.collection('users').get();
    if (users.empty) {
      logger.warn('No users in collection users');
      res.status(204).end();
      return;
    }

    logger.info('retrieved all users');
    let formattedUsers: Array<object>;

    users.forEach((document) => {
      formattedUsers.push({
        id: document.id,
        ...document.data(),
      });
    });

    res.json(formattedUsers);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await firestore.collection('users').doc(req.params.id).get();
    if (!user.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved user ${req.params.id}`);
    res.json({id: user.id, ...user.data()});
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.post('/users/:id', async (req, res) => {
  try {
    await firestore.collection('users').doc(req.params.id).update(req.body.data);

    res.status(201).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.put('/users', async (req, res) => {
  try {
    const user = await firestore.collection('users').add(req.body.data);
    logger.info(`User added with id ${user.id}`, {data: req.body.data});

    res.json({
      id: user.id,
      ...req.body.data,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await firestore.collection('users').doc(req.params.id).delete();
    logger.info(`User ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
