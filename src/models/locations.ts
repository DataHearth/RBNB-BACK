import * as joi from '@hapi/joi';

export default joi.object().keys({
  city: joi.string().required(),
  coordinates: joi.any(), // Any because it will be a map object
});
