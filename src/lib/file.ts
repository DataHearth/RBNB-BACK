// eslint-disable-next-line no-unused-vars
import {Request, Response, NextFunction} from 'express';
import * as fs from 'fs';
import * as path from 'path';
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
  } catch (error) {
    logger.error('Google storage error', {error});
    throw 'Google storage error';
  }
}

function clearTempDirectory() {
  const temp = path.join(__dirname, '../../../', 'temp');

  if (fs.readdirSync(temp).length !== 0) {
    logger.debug('Cleaning temp directory...');
    fs.readdir(temp, (_, files) => {
      files.forEach((file) => fs.unlink(path.join(temp, file), () => {}));
    });
  }
}

async function deleteUploadedFiles(urls: Array<string>) {
  try {
    const bucket = firebase.storage().bucket('gs://rbnb-30af7.appspot.com');

    logger.debug('Deleting files...');
    await Promise.all(urls.map(async (url) => {
      const splittedUrl = url.split('/');
      await bucket.file(`${splittedUrl[splittedUrl.length - 2]}/${splittedUrl[splittedUrl.length - 1]}`).delete();
    }));

    logger.debug(`${urls.length} files deleted`);
  } catch (error) {
    logger.error('Storage deletion error', {error});
    throw 'Google storage error';
  }
}

export default async function parseBody(req: Request, res: Response, next: NextFunction) {
  const {body} = req;
  const urls = [];

  try {
    if (Array.isArray(req.files) && req.files.length > 0) {
      const {files} = req;

      logger.debug(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
      await Promise.all(files.map(async (file) => {
        urls.push(await uploadFile({
          contentType: file.mimetype,
          path: file.path,
        }));
      }));

      logger.info(`${files.length} files uploaded`);

      body.pictures = urls;
    } else if (req.file) {
      const {file} = req;
      logger.debug('Uploading file...');
      body.picture = await uploadFile({
        contentType: <string>file.mimetype,
        path: <string>file.path,
      });

      logger.info('File uploaded', {filename: file.filename});
    }

    clearTempDirectory();
  } catch (error) {
    await deleteUploadedFiles(urls);
    res.status(500).end();
    return;
  }

  for (const [key, value] of Object.entries(body)) {
    try {
      body[key] = JSON.parse(<any>value);
    } catch (error) {
      // Don't parse the property
    }
  }

  next();
}
