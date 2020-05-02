import {Router} from 'express';
import * as multer from 'multer';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import badgesModel from '../models/badges';
import fileHandling from '../lib/file';

const upload = multer({dest: 'temp'});

const firestore = admin.firestore();

const router = Router();

router.get('/', upload.none(), async (req, res) => {
  try {
    const badges = await firestore.collection('badges').get();
    if (badges.empty) {
      logger.warn('No badge in collection badges');
      res.status(204).end();
      return;
    }

    logger.info('retrieved all badges');
    const formattedBadges = [];

    badges.forEach((document) => {
      formattedBadges.push({
        id: document.id,
        ...document.data(),
      });
    });

    res.json(formattedBadges);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.get('/:id', upload.none(), async (req, res) => {
  try {
    const badge = await firestore.collection('badges').doc(req.params.id).get();
    if (!badge.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved badge ${req.params.id}`);
    res.json({id: badge.id, ...badge.data()});
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.post('/:id', upload.single('picture'), fileHandling, async (req, res) => {
  const validatedBadge = badgesModel.validate(req.body);
  if (validatedBadge.error) {
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('badges').doc(req.params.id).update(validatedBadge.value);

    res.status(201).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.put('/', upload.single('picture'), fileHandling, async (req, res) => {
  const validatedBadge = badgesModel.validate(req.body);
  if (validatedBadge.error) {
    res.status(400).end();
    return;
  }

  try {
    const badge = await firestore.collection('badges').add(validatedBadge.value);
    logger.info(`Badge added with id ${badge.id}`, {data: validatedBadge.value});

    res.json({
      id: badge.id,
      ...validatedBadge.value,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.delete('/:id', upload.none(), async (req, res) => {
  try {
    await firestore.collection('badges').doc(req.params.id).delete();
    logger.info(`Badge ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
