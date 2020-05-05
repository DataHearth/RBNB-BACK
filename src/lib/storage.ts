import firebase from './firebase';
import logger from './logger';

const bucket = firebase.storage().bucket();

function formatUrl(filename: string) {
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function deleteFile(filename: string, folder: string) {
  try {
    await bucket.file(`${folder}/${filename}`).delete();
  } catch (error) {
    logger.error('Storage deletion error', {error});
    throw 'Google storage error';
  }
}

export async function uploadFile(path: string, contentType: string) {
  try {
    const file = await bucket.upload(path, {
      public: true,
      destination: `originals/${path.split('/')[1]}`,
      contentType,
      validation: 'crc32c',
    });

    // * Another option with firebase URL
    // * https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase/42959262#42959262
    // * https://code.i-harness.com/fr/q/28f75da
    // * const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file[0].name)}?alt=media&token=${generatedUuid}`;

    return formatUrl(file[0].name);
  } catch (error) {
    logger.error('Google storage error', {error});
    throw 'Google storage error';
  }
}
