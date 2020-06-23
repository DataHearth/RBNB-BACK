import * as joi from '@hapi/joi';

export default joi.object().keys({
  uid: joi.string(),
  firstname: joi.string().required(),
  lastname: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  badges: joi.array().items(joi.string()).default([]),
  picture: joi.string().uri(),
  address: joi.string(),
  phone: joi.string(),
});
