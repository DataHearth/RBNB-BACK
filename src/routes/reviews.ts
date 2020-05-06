import {Router} from 'express';
import admin from '../lib/firebase';
import logger from '../lib/logger';
import reviewsModel from '../models/reviews';

const firestore = admin.firestore();

const router = Router();

router.get('/:dwelling/:id', async (req, res) => {
  try {
    const review = await firestore.collection('dwellings').doc(req.params.dwelling).collection('reviews').doc(req.params.id)
      .get();
    if (!review.exists) {
      logger.warn(`${req.params.id} doesn't exists`);
      res.status(204).end();
      return;
    }

    logger.info(`retrieved review ${req.params.id}`);
    res.json({id: review.id, ...review.data()});
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.post('/:dwelling/:id', async (req, res) => {
  const validatedReview = reviewsModel.validate(req.body);
  if (validatedReview.error) {
    logger.warn('Validation error', {error: validatedReview.error});
    res.status(400).end();
    return;
  }

  try {
    await firestore.collection('dwellings').doc(req.params.dwelling).collection('reviews').doc(req.params.id)
      .update(validatedReview.value);

    res.status(201).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.put('/:id', async (req, res) => {
  const validatedReview = reviewsModel.validate(req.body);
  if (validatedReview.error) {
    logger.warn('Validation error', {error: validatedReview.error});
    res.status(400).end();
    return;
  }

  try {
    const review = await firestore.collection('dwellings').doc(req.params.id).collection('reviews').add(validatedReview.value);
    logger.info(`Review added with id ${review.id}`, {data: validatedReview.value});

    res.json({
      id: review.id,
      ...validatedReview.value,
    });
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

router.delete('/:dwelling/:id', async (req, res) => {
  try {
    await firestore.collection('dwellings').doc(req.params.dwelling).collection('reviews').doc(req.params.id)
      .delete();
    logger.info(`Review ${req.params.id} deleted`);

    res.status(200).end();
  } catch (error) {
    logger.error('Firestore error', {error});
    res.status(500).end();
  }
});

export default router;
