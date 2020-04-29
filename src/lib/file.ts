// eslint-disable-next-line no-unused-vars
import {Request} from 'express';
import * as Busboy from 'busboy';
import * as path from 'path';
import * as fs from 'fs';
import firebase from './firebase';
import logger from './logger';

interface Metadata {
  path: string,
  type: string,
}

function setupTempFile(filename: string) {
  const temp = path.join(__dirname, '../..', 'temp');
  if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
  }

  return fs.createWriteStream(path.join(temp, filename));
}

async function uploadFile(metadata: Metadata) {
  try {
    const bucket = firebase.storage().bucket('gs://rbnb-30af7.appspot.com');
    const file = await bucket.upload(metadata.path, {
      metadata: {
        contentType: metadata.type,
      },
    });

    await file[0].makePublic();

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

export default function parseBody(req: Request) {
  const uploadMetadata: Array<Metadata> = [];
  const urls: Array<string> = [];

  const busboy = new Busboy({headers: req.headers});

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const writeStream = setupTempFile(filename);
    file.pipe(writeStream);
    uploadMetadata.push({
      path: <string>writeStream.path,
      type: mimetype,
    });
  });

  busboy.on('finish', () => {
    uploadMetadata.forEach(async (metadata) => {
      urls.push(await uploadFile(metadata));
    });
  });

  req.pipe(busboy);

  return urls;
}
