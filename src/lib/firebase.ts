import * as admin from 'firebase-admin';

import * as serviceAccount from '../../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(<any>serviceAccount),
  databaseURL: 'https://rbnb-261207.firebaseio.com',
});

export default admin;
