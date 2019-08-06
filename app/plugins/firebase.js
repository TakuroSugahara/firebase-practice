import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyA6wIEbbtvg3lx1a0P6QHtA6DvH5_gJSBM',
  authDomain: 'sample-project-c53d1.firebaseapp.com',
  databaseURL: 'https://sample-project-c53d1.firebaseio.com',
  projectId: 'sample-project-c53d1',
  storageBucket: 'sample-project-c53d1.appspot.com',
  messagingSenderId: '835514488912',
  appId: '1:835514488912:web:1f0e89a6e621bf5d'
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export default firebase
