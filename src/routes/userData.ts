import {Router} from 'express';
import logger from '../lib/logger';
import recursiveDeletion from '../lib/recursiveDeletion';

const router = Router();

router.delete('/:id', async (req, res) => {
  const isDeleted = await recursiveDeletion(req.params.id);
  if (!isDeleted) {
    res.status(400).end();
  }

  logger.info('User data deleted successfully');
  res.status(200).end();
});

export default router;
