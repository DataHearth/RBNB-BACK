import * as joi from '@hapi/joi';

export default joi.object().keys({
  badges: joi.array().items(joi.string()).required(),
  description: joi.string().required(),
  location: joi.string().required(),
  pictures: joi.array().items(joi.string()),
  technicalSheet: joi.object().keys({
    price: joi.number().required(),
    rentalType: joi.string(), // ! Set valid data
    resident: joi.number().positive().integer().required(),
    rooms: joi.number().positive().integer().required(),
    services: joi.array().items(joi.string()).required(),
    smoking: joi.bool().default(false),
    type: joi.string(),
  }),
});