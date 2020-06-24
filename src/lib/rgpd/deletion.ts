import firebase from '../firebase';
import logger from '../logger';

const firestore = firebase.firestore();

const errorMessage = {
  noDwellingsFound: 'No dwellings found for given objectID',
  noReviewsFound: 'No reviews found for given objectID',
  noUsersFound: 'No user found for given objectID',
  firestoreError: 'A firestore error occured',
};

async function deleteDwellings(objectID: string) {
  const usersDocs: Array<string> = [];
  const dwellingsPromises: Array<Promise<firebase.firestore.WriteResult>> = [];
  let userDwellings: firebase.firestore.DocumentData;

  try {
    userDwellings = await firestore.collection('dwellings').where('user', '==', objectID).get();
  } catch (error) {
    logger.error(errorMessage.firestoreError, {error});
    throw errorMessage.firestoreError;
  }

  if (userDwellings.empty) {
    logger.error(errorMessage.noDwellingsFound);
    return;
  }

  for (let index = 0; index < userDwellings.docs.length; index += 1) {
    usersDocs.push(userDwellings.docs[index].id);
  }

  for (let index = 0; index < usersDocs.length; index += 1) {
    dwellingsPromises.push(firestore.collection('dwellings').doc(usersDocs[index]).delete());
  }

  // eslint-disable-next-line consistent-return
  return dwellingsPromises;
}

async function deleteReviews(objectID: string) {
  const usersDocs: Array<string> = [];
  const reviewsPromises: Array<Promise<firebase.firestore.WriteResult>> = [];
  let userDwellings: firebase.firestore.DocumentData;

  try {
    userDwellings = await firestore.collection('reviews').where('user', '==', objectID).get();
  } catch (error) {
    logger.error(errorMessage.firestoreError, {error});
    throw errorMessage.firestoreError;
  }

  if (userDwellings.empty) {
    logger.error(errorMessage.noReviewsFound);
    return;
  }

  for (let index = 0; index < userDwellings.docs.length; index += 1) {
    usersDocs.push(userDwellings.docs[index].id);
  }

  for (let index = 0; index < usersDocs.length; index += 1) {
    reviewsPromises.push(firestore.collection('reviews').doc(usersDocs[index]).delete());
  }

  // eslint-disable-next-line consistent-return
  return reviewsPromises;
}

async function deleteUsers(objectID: string) {
  let user: firebase.firestore.DocumentData;
  try {
    user = await firestore.collection('users').doc(objectID).get();
  } catch (error) {
    logger.error(errorMessage.firestoreError, {error});
    throw errorMessage.firestoreError;
  }

  if (!user.exists) {
    logger.error(errorMessage.noUsersFound);
    return;
  }

  await firestore.collection('users').doc(objectID).delete();
}

export default async function deleteRecursivly(user: string) {
  const promisesArray = [];
  promisesArray.concat(deleteReviews(user), deleteDwellings(user));

  try {
    await Promise.all(promisesArray);
    await deleteUsers(user);

    return true;
  } catch (error) {
    return false;
  }
}
