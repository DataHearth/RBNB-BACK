import * as joi from '@hapi/joi';

export default joi.object().keys({
  firstname: joi.string().required(),
  lastname: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  badges: joi.array().items(joi.string()).default([]),
  picture: joi.string().uri().default('http://www.einstein.yu.edu/uploadedImages/PollardLab/PhotoNotAvailable.gif?n=5454'),
  address: joi.string(),
  phone: joi.string(),
});
