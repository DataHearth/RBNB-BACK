import {Router} from 'express';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import servicesModel from '../models/services';

const firestore = admin.firestore();

const router = Router();

router.get('/', async (req, res) => {
  try {
    const services = await firestore.collection('services').get();
    if (services.empty) {
      logger.warn('No services in collection services');
      res.status(204).end();
      return;
    }

    logger.info('retrieved all services');
    const formattedServices = [];

    services.forEach((document) => {
      formattedServices.push({
        id: document.id,
        ...document.data(),
      });
    });

    res.json(formattedServices);
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await firestore.collection('services').doc(req.params.id).get();
    if (!service.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved service ${req.params.id}`);
    res.json({id: service.id, ...service.data()});
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.post('/:id', async (req, res) => {
  const validatedService = servicesModel.validate(req.body);
  if (validatedService.error) {
    logger.warn('Validation error', {error: validatedService.error});
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('services').doc(req.params.id).update(validatedService.value);

    res.status(201).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.put('/', async (req, res) => {
  const validatedService = servicesModel.validate(req.body);
  if (validatedService.error) {
    logger.warn('Validation error', {error: validatedService.error});
    res.status(400).end();
    return;
  }

  try {
    const service = await firestore.collection('services').add(validatedService.value);
    logger.info(`service added with id ${service.id}`, {data: validatedService.value});

    res.json({
      id: service.id,
      ...validatedService.value,
    });
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await firestore.collection('services').doc(req.params.id).delete();
    logger.info(`service ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

export default router;
