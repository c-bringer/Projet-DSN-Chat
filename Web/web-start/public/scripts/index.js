/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getPerformance } from 'firebase/performance';

import { getFirebaseConfig } from './firebase-config.js';

const titre = document.location.pathname.split('/')[3];
switch (titre) {
  case 'index.html':
    console.log('C est la la page index');
    break;
  default:
    console.log(`Sorry, we are out of ${titre}.`);
}/*

document.getElementById('sign-in').addEventListener('click', signIn);
document.getElementById('sign-up').addEventListener('click', signUp);
document.getElementById('reset-password').addEventListener('click', resetPassword);
document.getElementById('delete-user').addEventListener('click', deleteUser);

function signUp() {
    let usernameCreate = document.getElementById('username-create').value;
    let email = document.getElementById('email-create').value;
    let password = document.getElementById('password-create').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
            const user = userCredential.user;
            let file = null;
            try {
                await setDoc(doc(getFirestore(), 'users/'+user.uid), {
                    messageColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                    uid: user.uid,
                    urlPicture: file,
                    username: usernameCreate
                });
            } catch (error) {
                console.error('Error writing new message to Firebase Database', error);
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}

// Signs-in Friendly Chat.
async function signIn() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            console.log('#'+(Math.random()*0xFFFFFF<<0).toString(16));
            console.log("TEST");
            location.href = 'connecter.html';
            // ...
        })
        .catch((error) => {
            console.log("ERREUR");
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}

function resetPassword() {
  sendPasswordResetEmail(getAuth(), getAuth().currentUser.email).then(function () {
  });
}

function deleteUser() {
  const userQuery = query(collection(getFirestore(), 'users'));
  onSnapshot(userQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if(change.doc.data().uid == getAuth().currentUser.uid) {
        deleteDoc(doc(getFirestore(), 'users', getAuth().currentUser.uid)).then(function () {
          getAuth().currentUser.delete().then(function () {
          });
        });
      }
    });
  });
}

// Signs-out of Friendly Chat.
function signOutUser() {
  // Sign out of Firebase.
  signOut(getAuth());
}

// Initiate firebase auth
function initFirebaseAuth() {
  // Listen to auth state changes.
  onAuthStateChanged(getAuth(), authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return getAuth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!getAuth().currentUser;
}

// Saves a new message to Cloud Firestore.
async function saveMessage(messageText, file) {
  if(file==null){
    file=null;
  }
  const authUser = query(collection(getFirestore(), 'users'), where("uid", "==", getAuth().currentUser.uid));

  onSnapshot(authUser, async function (snapshot) {
    for (const change of snapshot.docChanges()) {
      try {
        await addDoc(collection(getFirestore(), 'chats/general/messages'), {
          dateCreated: serverTimestamp(),
          message: messageText,
          urlImage: file,
          userSender: {
            messageColor: change.doc.data().messageColor,
            uid: change.doc.data().uid,
            urlPicture: change.doc.data().urlPicture,
            username: change.doc.data().username,
          }
        });
      } catch (error) {
        console.error('Error writing new message to Firebase Database', error);
      }
    }
  });
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  //const recentMessagesQuery = query(collection(getFirestore(), 'chats/general/messages'), orderBy('timestamp', 'desc'), limit(12));
  const recentMessagesQuery = query(collection(getFirestore(), 'chats/general/messages'));
  onSnapshot(recentMessagesQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        if (change.doc.data().userSender.uid == getAuth().lastNotifiedUid){
          displayMessage(change.doc.id, message.dateCreated, message.userSender.username,
              message.message, message.userSender.urlPicture, message.urlImage, true);
        } else {
          displayMessage(change.doc.id, message.dateCreated, message.userSender.username,
              message.message, message.userSender.urlPicture, message.urlImage, false);
        }
      }
    });
  });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
async function saveImageMessage(file, messageText) {
  if(messageText==null){
    messageText=null;
  }

  const authUser = query(collection(getFirestore(), 'users'), where("uid", "==", getAuth().currentUser.uid));
  onSnapshot(authUser, async function (snapshot) {
    for (const change of snapshot.docChanges()) {
      try {
        // 1 - We add a message with a loading icon that will get updated with the shared image.
        const messageRef = await addDoc(collection(getFirestore(), 'chats/general/messages'), {
          dateCreated: serverTimestamp(),
          message: messageText,
          urlImage: LOADING_IMAGE_URL,
          userSender: {
            messageColor: change.doc.data().messageColor,
            uid: change.doc.data().uid,
            urlPicture: change.doc.data().urlPicture,
            username: change.doc.data().username,
          }
        });

        // 2 - Upload the image to Cloud Storage.
        const filePath = `${getAuth().currentUser.uid}/${messageRef.id}/${file.name}`;
        const newImageRef = ref(getStorage(), filePath);
        const fileSnapshot = await uploadBytesResumable(newImageRef, file);

        // 3 - Generate a public URL for the file.
        const publicImageUrl = await getDownloadURL(newImageRef);
        console.log(publicImageUrl);
        console.log(messageRef);

        // 4 - Update the chat message placeholder with the image's URL.
        await updateDoc(messageRef, {
          urlImage: publicImageUrl,
        });
      } catch (error) {
        console.error('There was an error uploading a file to Cloud Storage:', error);
      }
    }
  });

}

// Saves the messaging device token to Cloud Firestore.
async function saveMessagingDeviceToken() {
  // TODO 10: Save the device token in Cloud Firestore
}

// Requests permissions to show notifications.
async function requestNotificationsPermissions() {
  // TODO 11: Request permissions to send notifications.
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000,
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function () {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage =
      'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000,
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    deleteDoc(doc(getFirestore(), 'chats/general/messages', id));
    div.parentNode.removeChild(div);
  }
}

function createAndInsertMessage(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, picUrl, imageUrl, isAuthor) {
  var div =
    document.getElementById(id) || createAndInsertMessage(id, timestamp);

  // profile picture
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage =
      'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }

  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');

  if (isAuthor) {
    if (text && imageUrl) {
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.textContent = text;
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
      messageElement.appendChild(image);
      var crossDelete = document.createElement('span');
      crossDelete.innerHTML = "❌";
      crossDelete.addEventListener('click', function () {
        deleteMessage(id);
      });
      messageElement.appendChild(crossDelete);
    } else if (text) {
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
      var crossDelete = document.createElement('span');
      crossDelete.innerHTML = "❌";
      crossDelete.addEventListener('click', function () {
        deleteMessage(id);
      });
      messageElement.appendChild(crossDelete);
    } else if (imageUrl) {
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.innerHTML = '';
      messageElement.appendChild(image);
      var crossDelete = document.createElement('span');
      crossDelete.innerHTML = "❌";
      crossDelete.addEventListener('click', function () {
        deleteMessage(id);
      });
      messageElement.appendChild(crossDelete);
    }
  } else {
    if (text && imageUrl) {
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.textContent = text;
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
      messageElement.appendChild(image);
    } else if (text) {
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    } else if (imageUrl) {
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.innerHTML = '';
      messageElement.appendChild(image);
    }
  }

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () {
    div.classList.add('visible');
  }, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOutUser);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
imageButtonElement.addEventListener('click', function (e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

const firebaseAppConfig = getFirebaseConfig();
const app = initializeApp(firebaseAppConfig);
const auth = getAuth(app);

// TODO 12: Initialize Firebase Performance Monitoring

initFirebaseAuth();
//loadMessages();*/
