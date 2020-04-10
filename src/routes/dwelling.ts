import {Router} from 'express';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import dwellingsDwelling from '../models/dwellings';

const firestore = admin.firestore();

const router = Router();

router.get('/dwellings', async (req, res) => {
  try {
    const dwellings = await firestore.collection('dwellings').get();
    if (dwellings.empty) {
      logger.warn('No dwelling in collection dwellings');
      res.status(204).end();
      return;
    }

    logger.info('retrieved all dwellings');
    const formatteddwellings = [];

    dwellings.forEach((document) => {
      formatteddwellings.push({
        id: document.id,
        ...document.data(),
      });
    });

    res.json(formatteddwellings);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.get('/dwellings/:id', async (req, res) => {
  try {
    const dwelling = await firestore.collection('dwellings').doc(req.params.id).get();
    if (!dwelling.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved dwelling ${req.params.id}`);
    res.json({id: dwelling.id, ...dwelling.data()});
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.post('/dwellings/:id', async (req, res) => {
  const validatedDwelling = dwellingsDwelling.validate(req.body);
  if (validatedDwelling.error) {
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('dwellings').doc(req.params.id).update(validatedDwelling.value);

    res.status(201).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.put('/dwellings', async (req, res) => {
  const validatedDwelling = dwellingsDwelling.validate(req.body);
  if (validatedDwelling.error) {
    res.status(400).end();
    return;
  }

  try {
    const dwelling = await firestore.collection('dwellings').add(validatedDwelling.value);
    logger.info(`Dwelling added with id ${dwelling.id}`, {data: validatedDwelling.value});

    res.json({
      id: dwelling.id,
      ...validatedDwelling.value,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.delete('/dwellings/:id', async (req, res) => {
  try {
    await firestore.collection('dwellings').doc(req.params.id).delete();
    logger.info(`Dwelling ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
