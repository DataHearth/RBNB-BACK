import * as joi from '@hapi/joi';

export default joi.object().keys({
  user: joi.string().required(),
  title: joi.string().required(),
  description: joi.string().required(),
  price: joi.number().required(),
  resident: joi.number().positive().integer().required(),
  rentalType: joi.string(), // ! Set valid data
  smoking: joi.bool().default(false),
  type: joi.string(),
  pictures: joi.array().items(joi.string().uri()).default(['http://icons.iconarchive.com/icons/icons8/windows-8/512/City-No-Camera-icon.png']),
  rooms: joi.number().positive().integer().required(),
  services: joi.array().items(joi.string()).required(),
  badges: joi.array().items(joi.string()).required(),
  location: joi.string().required(), // ? Probably could move the collection in an object here
});
