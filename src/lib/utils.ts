import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

// eslint-disable-next-line import/prefer-default-export
export function clearTempDirectory() {
  const temp = path.join(__dirname, '../../../', 'temp');

  if (fs.readdirSync(temp).length !== 0) {
    logger.debug('Cleaning temp directory...');
    fs.readdir(temp, (_, files) => {
      files.forEach((file) => fs.unlink(path.join(temp, file), () => {}));
    });
  }
}
