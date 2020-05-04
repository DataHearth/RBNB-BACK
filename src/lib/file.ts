// eslint-disable-next-line no-unused-vars
import {Request, Response, NextFunction} from 'express';
import firebase from './firebase';
import logger from './logger';

interface Metadata {
  path: string,
  contentType: string
}

async function uploadFile(metadata: Metadata) {
  try {
    const bucket = firebase.storage().bucket('gs://rbnb-30af7.appspot.com');
    const file = await bucket.upload(metadata.path, {
      public: true,
      destination: `originals/${metadata.path.split('/')[1]}`,
      contentType: metadata.contentType,
      validation: 'crc32c',
    });

    // * Another option with firebase URL
    // * https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase/42959262#42959262
    // * https://code.i-harness.com/fr/q/28f75da
    // * const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file[0].name)}?alt=media&token=${generatedUuid}`;

    return `https://storage.googleapis.com/${bucket.name}/${file[0].name}`;
  } catch (gcloudError) {
    logger.error(gcloudError);
    return null;
  }
}

export default async function parseBody(req: Request, res: Response, next: NextFunction) {
  // eslint-disable-next-line no-nested-ternary
  const files = req.files ? req.files : req.file ? req.file : null;
  const {body} = req;
  const urls = [];

  if (Array.isArray(files)) {
    const filenames = [];
    for (let index = 0; index < files.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      urls.push(await uploadFile({
        contentType: files[index].mimetype,
        path: files[index].path,
      }));

      filenames.push(files[index].filename);
    }

    logger.info(`Uploaded ${files.length} file to originals folder`, {filename: filenames});
    body.pictures = urls;
  } else if (files !== null) {
    body.picture = await uploadFile({
      contentType: <string>files.mimetype,
      path: <string>files.path,
    });

    logger.info('Uploaded 1 file to originals folder', {filename: files.filename});
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(body)) {
    try {
      body[key] = JSON.parse(<any>value);
      if (body[key] !== null && typeof body[key] === 'object') {
        // eslint-disable-next-line no-restricted-syntax
        for (const [key2, value2] of body[key]) {
          try {
            body[key][key2] = JSON.parse(<any>value2);
          // eslint-disable-next-line no-empty
          } catch (error) {}
        }
      }
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  next();
}
