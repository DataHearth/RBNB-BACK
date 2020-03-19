import * as joi from '@hapi/joi';

export default joi.object().keys({
  name: joi.string().required(),
  paid: joi.bool().default(false),
});
