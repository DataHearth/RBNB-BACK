import * as joi from '@hapi/joi';

export default joi.object().keys({
  address: joi.string(),
  // eslint-disable-next-line max-len
  badges: joi.array().items(joi.string()).default([]), // ? Again, probably could move the badges collection here with verification (limitation)
  firstname: joi.string().required(),
  lastname: joi.string().required(),
  phone: joi.string(),
  picture: joi.string().uri(),
});
