// eslint-disable-next-line no-unused-vars
import {Request, Response, NextFunction} from 'express';
import logger from './logger';
import {uploadFile, deleteFile} from './storage';
import {clearTempDirectory} from './utils';

export default async function parseBody(req: Request, res: Response, next: NextFunction) {
  const {body} = req;
  const urls = [];

  try {
    if (Array.isArray(req.files) && req.files.length > 0) {
      const {files} = req;

      logger.debug(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
      await Promise.all(files.map(async (file) => {
        urls.push(await uploadFile(file.path, file.mimetype));
      }));

      logger.info(`${files.length} files uploaded`);

      body.pictures = urls;
    } else if (req.file) {
      const {file} = req;

      logger.debug('Uploading file...');
      body.picture = await uploadFile(file.path, file.mimetype);

      logger.info('File uploaded', {filename: file.filename});
    } else {
      next();
      return;
    }
  } catch (error) {
    logger.debug('Deleting uploaded files...');
    // * Check how to defer it
    await Promise.all(urls.map(async (url) => {
      const splittedUrl = url.split('/');
      await deleteFile(splittedUrl[splittedUrl.length - 2], splittedUrl[splittedUrl.length - 1]);
    }));

    logger.info('Uploaded files deleted successfully');

    res.status(500).end();
    return;
  }

  clearTempDirectory();

  for (const [key, value] of Object.entries(body)) {
    try {
      body[key] = JSON.parse(<any>value);
    } catch (error) {
      // Don't parse the property
    }
  }

  next();
}
