import * as joi from '@hapi/joi';

export default joi.object().keys({
  address: joi.string(),
  badges: joi.array().items(joi.string()).default([]),
  firstname: joi.string().required(),
  lastname: joi.string().required(),
  phone: joi.string(),
  picture: joi.string().uri(),
});
