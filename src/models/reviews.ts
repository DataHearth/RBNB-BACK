import * as joi from '@hapi/joi';
import firebase from '../lib/firebase';

export default joi.object().keys({
  date: joi.date().timestamp().default(firebase.firestore.Timestamp.now()),
  description: joi.string().required(),
  multilingual: joi.bool().required(),
  responseAllowed: joi.bool().default(true),
  stars: joi.number().valid(1, 2, 3, 4, 5),
  title: joi.string().required(),
  user: joi.string().required(),
});
