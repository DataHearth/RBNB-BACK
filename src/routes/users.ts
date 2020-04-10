import {Router} from 'express';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import usersModel from '../models/users';

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
    const formattedUsers = [];

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
  const validatedUser = usersModel.validate(req.body);
  if (validatedUser.error) {
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('users').doc(req.params.id).update(validatedUser.value);

    res.status(201).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.put('/users', async (req, res) => {
  const validatedUser = usersModel.validate(req.body);
  if (validatedUser.error) {
    res.status(400).end();
    return;
  }

  try {
    const user = await firestore.collection('users').add(validatedUser.value);
    logger.info(`User added with id ${user.id}`, {data: validatedUser.value});

    res.json({
      id: user.id,
      ...validatedUser.value,
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