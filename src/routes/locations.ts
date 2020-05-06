import {Router} from 'express';
import * as firebase from 'firebase-admin';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import locationsModel from '../models/locations';

const firestore = admin.firestore();

const router = Router();

router.get('/', async (req, res) => {
  try {
    const locations = await firestore.collection('locations').get();
    if (locations.empty) {
      logger.warn('No locations in collection locations');
      res.status(204).end();
      return;
    }

    logger.info('retrieved all locations');
    const formattedLocations = [];

    locations.forEach((document) => {
      formattedLocations.push({
        id: document.id,
        ...document.data(),
      });
    });

    res.json(formattedLocations);
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const location = await firestore.collection('locations').doc(req.params.id).get();
    if (!location.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved location ${req.params.id}`);
    res.json({id: location.id, ...location.data()});
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.post('/:id', async (req, res) => {
  const {city, longitude, latitude} = req.body;
  const geopoints = new firebase.firestore.GeoPoint(latitude, longitude);

  const validatedLocation = locationsModel.validate({city, coordinates: geopoints});
  if (validatedLocation.error) {
    logger.warn('Validation error', {error: validatedLocation.error});
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('locations').doc(req.params.id).update(validatedLocation.value);

    res.status(201).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.put('/', async (req, res) => {
  const {city, longitude, latitude} = req.body;
  const geopoints = new firebase.firestore.GeoPoint(latitude, longitude);

  const validatedLocation = locationsModel.validate({city, coordinates: geopoints});
  if (validatedLocation.error) {
    logger.warn('Validation error', {error: validatedLocation.error});
    res.status(400).end();
    return;
  }

  try {
    const location = await firestore.collection('locations').add(validatedLocation.value);
    logger.info(`location added with id ${location.id}`, {data: validatedLocation.value});

    res.json({
      id: location.id,
      ...validatedLocation.value,
    });
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await firestore.collection('locations').doc(req.params.id).delete();
    logger.info(`location ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

export default router;
