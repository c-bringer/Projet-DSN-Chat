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
    updateEmail,
    updatePassword,
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
    getDocs,
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
let tinycolor = require("tinycolor2");

var windowFocus = Date.now();
var windowBlur;

window.addEventListener('focus', function() {
    windowFocus = Date.now();
    console.log(windowFocus);
});
window.addEventListener('blur', function() {
    windowBlur = Date.now();
});

// Boutons de la page index
document.getElementById('bouton-connexion').addEventListener('click', function() {
    document.getElementById('index').style.display = "none";
    document.getElementById('connexion').style.display = "block";
});

document.getElementById('bouton-s-inscrire').addEventListener('click', function() {
    document.getElementById('index').style.display = "none";
    document.getElementById('inscription').style.display = "block";
});

document.getElementById('bouton-discuter-sur-le-chat').addEventListener('click', function() {
    dialog.open();
    dialogText.innerHTML = "Vous devez être connecter pour discuter sur le chat.";
});

// Boutons de la page connexion
document.getElementById('connexion-to-index').addEventListener('click', function() {
    document.getElementById('connexion').style.display = "none";
    document.getElementById('index').style.display = "block";
});

document.getElementById('sign-in').addEventListener('click', signIn);

document.getElementById('connexion-to-forgot').addEventListener('click', function() {
    document.getElementById('connexion').style.display = "none";
    document.getElementById('oublie').style.display = "block";
});

// Boutons de la page oublié
document.getElementById('oublie-to-connexion').addEventListener('click', function() {
    document.getElementById('oublie').style.display = "none";
    document.getElementById('connexion').style.display = "block";
});

document.getElementById('bouton-forget').addEventListener('click', resetPassword);

// Boutons de la page connecter
document.getElementById('connecter-to-profil').addEventListener('click', function() {
    document.getElementById('connecter').style.display = "none";

    document.getElementById('email-change').value = auth.currentUser.email;

    document.getElementById('email-span2').classList.add("mdc-floating-label--float-above");

    const queryPseudo = query(collection(getFirestore(), 'users'), where("uid", "==", getAuth().currentUser.uid));
    onSnapshot(queryPseudo, function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            document.getElementById('pseudo-change').innerText = 'Pseudo : ' + change.doc.data().username;
            if(change.doc.data().urlPicture) {
                document.getElementById('A').src = change.doc.data().urlPicture;
            } else {
                document.getElementById('A').src = "./images/profil_picture.png"

            }
        });
    });

    document.getElementById('profil').style.display = "block";
});

document.getElementById('connecter-to-chat').addEventListener('click', function() {
    document.getElementById('connecter').style.display = "none";
    document.getElementById('chat').style.display = "block";
    window.scrollTo(0, document.body.scrollHeight);
});

// Boutons de la page profil
document.getElementById('profil-to-connecter').addEventListener('click', function() {
    document.getElementById('profil').style.display = "none";
    document.getElementById('connecter').style.display = "block";
});

document.getElementById('update-profil').addEventListener('click', udpateUserPorfil);

document.getElementById('sign-out').addEventListener('click', signOutUser);

document.getElementById('delete-user').addEventListener('click', deleteUser);

document.getElementById('password-icon').addEventListener('click', function() {
    if (document.getElementById('password-icon').innerText == "visibility_off") {
        document.getElementById('password-icon').innerText = "visibility";
    } else {
        document.getElementById('password-icon').innerText = "visibility_off";
    }
});

// Boutons de la page inscription
document.getElementById('inscription-to-index').addEventListener('click', function() {
    document.getElementById('inscription').style.display = "none";
    document.getElementById('index').style.display = "block";
});

document.getElementById('sign-up').addEventListener('click', signUp);

// Boutons de la page chat
document.getElementById('chat-to-connecter').addEventListener('click', function() {
    document.getElementById('chat').style.display = "none";
    document.getElementById('connecter').style.display = "block";
});

async function signUp() {

    let usernameCreate = document.getElementById('pseudo-create').value;
    let email = document.getElementById('email-create').value;
    let password = document.getElementById('password-create').value;
    let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%?,;.:/^&*])(?=.{8,})");

    let usernameNeverUse = true;
    let emailNeverUse = true;

    let q = query(collection(getFirestore(), "users"), where('username', '==', usernameCreate));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
            usernameNeverUse = false;
    });

    let q2 = query(collection(getFirestore(), "users"), where('username', '==', usernameCreate));
    let querySnapshot2 = await getDocs(q2);
    querySnapshot.forEach((doc) => {
        usernameNeverUse = false;
    });

    if (usernameNeverUse) {
            if (regex.test(password)) {
                createUserWithEmailAndPassword(auth, email, password)
                    .then(async (userCredential) => {
                        // Signed in
                        const user = userCredential.user;
                        let file = null;
                        try {
                            await setDoc(doc(getFirestore(), 'users/' + user.uid), {
                                messageColor: '#' + (Math.random() * 0xFFFFFF << 0).toString(16),
                                uid: user.uid,
                                urlPicture: file,
                                username: usernameCreate
                            });
                        } catch (error) {
                            console.error('Error writing new message to Firebase Database', error);
                        }
                    })
                    .catch((error) => {
                        //pour la creation de user
                        if (error.code == 'auth/invalid-email') {
                            dialog.open();
                            dialogText.innerHTML = "Adresse mail non valide.";
                        }

                        if (error.code == 'auth/email-already-in-use') {
                            dialog.open();
                            dialogText.innerHTML = "Adresse mail déja utilisé.";
                        }
                        if (error.code == "auth/weak-password") {
                            dialog.open();
                            dialogText.innerHTML = "Mot de passe trop faible.";
                        }

                        const errorCode = error.code;
                        const errorMessage = error.message;
                        // ..
                    });
            } else {
                dialog.open();
                dialogText.innerHTML = "Le mot de passe doit contenir au minimum 8 charactères :<br>- 1 Minuscule<br>- 1 Majuscule<br>- 1 charactère spéciale";
            }
        } else {
            dialog.open();
            dialogText.innerHTML = "Un compte possédant ce pseudo existe déjà.";
        }

    /*console.log('emailNeverUse ' + emailNeverUse);
    console.log('usernameNeverUse ' + usernameNeverUse);

    if (regex.test(password) && usernameNeverUse) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;
                let file = null;
                try {
                    await setDoc(doc(getFirestore(), 'users/' + user.uid), {
                        messageColor: '#' + (Math.random() * 0xFFFFFF << 0).toString(16),
                        uid: user.uid,
                        urlPicture: file,
                        username: usernameCreate
                    });
                } catch (error) {
                    console.error('Error writing new message to Firebase Database', error);
                }
            })
            .catch((error) => {
                //pour la creation de user
                if (error.code == 'auth/invalid-email') {
                    dialog.open();
                    dialogText.innerHTML = "Adresse mail non valide.";
                }

                if (error.code == 'auth/email-already-in-use') {
                    dialog.open();
                    dialogText.innerHTML = "Adresse mail déja utilisé.";
                }
                if (error.code == "auth/weak-password") {
                    dialog.open();
                    dialogText.innerHTML = "Mot de passe trop faible.";
                }

                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    } else {
        dialog.open();
        dialogText.innerHTML = "Mot de passe pas assez fort.";
    }*/
}

// Signs-in Friendly Chat.
async function signIn() {
    let email = document.getElementById('email-connect').value;
    let password = document.getElementById('password-connect').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            document.getElementById('connexion').style.display = "none";
            document.getElementById('connecter').style.display = "block";
            // ...
        })
        .catch((error) => {
            if(error.code == 'auth/invalid-email')
            {
                dialog.open();
                dialogText.innerHTML = "Adresse mail non valide.";
            }
            if(error.code == 'auth/wrong-password')
            {
                dialog.open();
                dialogText.innerHTML = "Mauvais mot de passe / email.";
            }
            if(error.code == 'auth/user-not-found')
            {
                dialog.open();
                dialogText.innerHTML = "Utilisateur inexistant.";
            }
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}

function resetPassword() {
    let email = document.getElementById('email-forgot').value;
    sendPasswordResetEmail(getAuth(), email).then(function () {
        document.getElementById('oublie').style.display = "none";
        document.getElementById('connexion').style.display = "block";
        dialog.open();
        dialogText.innerHTML = "Un mail vous a était envoyé a l'adresse : " + email + " veuillez vérifier vos spams.";
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
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
    document.getElementById('profil').style.display = "none";
    document.getElementById('index').style.display = "block";
}

//Fonction update profil
function udpateUserPorfil() {
    let email = document.getElementById('email-change').value;
    let password = document.getElementById('password-change').value;
    let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%?,;.:/^&*])(?=.{8,})");
    if(regex.test(password))
    {
        let auth = getAuth();

        updateEmail(auth.currentUser, email).then(() => {
            dialog.open();
            dialogText.innerHTML = "Adresse mail mise à jour.";

            if (password!='') {
                updatePassword(auth.currentUser, password).then(() => {
                    dialog.open();
                    dialogText.innerHTML = "Mot de passe mis à jour.";
                }).catch((error) => {
                    // An error ocurred
                    // ...
                });
            }
        }).catch((error) => {
            // An error occurred
            // ...
        });
    } else{
        dialog.open();
        dialogText.innerHTML = "Mot de passe pas assez fort.";
    }
}

// Initiate firebase auth
function initFirebaseAuth() {
    // Listen to auth state changes.
    onAuthStateChanged(getAuth(), (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const uid = user.uid;
            // ...
        } else {
            // User is signed out
            // ...
        }
    });
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
    window.scrollTo(-67, document.body.scrollHeight);
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
                let colorBackground = change.doc.data().userSender.messageColor;
                let colorText = tinycolor.mostReadable(colorBackground, ['#000000'], {includeFallbackColors:true}).toString();
                if (change.doc.data().userSender.uid === getAuth().lastNotifiedUid){
                    displayMessage(change.doc.id, message.dateCreated, message.userSender.username,
                        message.message, message.userSender.urlPicture, message.urlImage, message.userSender.messageColor,colorText, true);
                } else {
                    displayMessage(change.doc.id, message.dateCreated, message.userSender.username,
                        message.message, message.userSender.urlPicture, message.urlImage, message.userSender.messageColor,colorText,false);
                }

                if (windowFocus < windowBlur ) {
                    Notification.requestPermission().then((permission) => {
                        // Si l'utilisateur accepte, créons une notification
                        if (permission === 'granted') {
                            const notification = new Notification(message.userSender.username + ' a envoyé ' + message.message);
                            notification.addEventListener('click', function (){
                                window.focus();
                            })
                        }
                    })
                }
            }
        });
    });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
async function saveImageMessage(file, messageText) {
    let uuid = self.crypto.randomUUID();

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
                const filePath = `general/${uuid}`;
                const newImageRef = ref(getStorage(), filePath);
                const fileSnapshot = await uploadBytesResumable(newImageRef, file);

                // 3 - Generate a public URL for the file.
                const publicImageUrl = await getDownloadURL(newImageRef);

                // 4 - Update the chat message placeholder with the image's URL.
                await updateDoc(messageRef, {
                    urlImage: publicImageUrl,
                });
            } catch (error) {
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
    const regex1000 = new RegExp('^.{1,1000}$');
    // Check that the user entered a message and is signed in.
    if (regex1000.test(messageInputElement.value)) {
        if (messageInputElement.value && checkSignedInWithMessage()) {
            saveMessage(messageInputElement.value).then(function () {
                // Clear message text field and re-enable the SEND button.
                resetMaterialTextfield(messageInputElement);
                toggleButton();
                counterChar.innerHTML = messageInputElement.value.length + '/1000'
            });
        }
    }
    else {
        dialog.open();
        dialogText.innerHTML = "Votre message est trop long."
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

var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="pic"><img class="pp"></div>' +
    '<div class="message"><div class="text"></div><img class="img"><div class="name"></div><div class="time"></div></div>' +
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
/*function displayMessage(id, timestamp, name, text, picUrl, imageUrl, isAuthor) {
  let div = document.getElementById(id) || createAndInsertMessage(id, timestamp);

  // profile picture
  var pp = document.createElement('img');
  if (picUrl) {
    pp.src = picUrl;
    div.querySelector('.pic').appendChild(pp);
  }
  else {
      pp.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      div.querySelector('.pic').appendChild(pp);
  }

  div.querySelector('.name').textContent = name;
    let messageElement = div.querySelector('.message');

    if (isAuthor) {
    if (text && imageUrl) {
      let image = document.createElement('img');
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
        messageElement.appendChild(pp);
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
}*/

function displayMessage(id, timestamp, name, text, picUrl, imageUrl, messageColor, colorText, isAuthor) {

    let div = document.getElementById(id) || createAndInsertMessage(id, timestamp);

    // Image de profil
    if (picUrl) {
        div.querySelector('.pp').src = picUrl;
    }
    else {
        //div.querySelector('.pp').src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        div.querySelector('.pp').src = "../public/images/profil_picture.png";
    }

    // Nom d'utilisateur
    div.querySelector('.name').textContent = name;

    // Date
    div.querySelector('.time').textContent = timestamp.toDate().toLocaleDateString('fr')+' '+timestamp.toDate().getHours()+':'+timestamp.toDate().getMinutes();

    //Texte
    let texte = div.querySelector('.text');
    texte.style.backgroundColor = messageColor;
    texte.style.color = colorText;

    let image  = div.querySelector('.img');

    if (isAuthor) {
        div.classList.add('author');
        if (text && imageUrl) {
            image.src = imageUrl;
            texte.textContent = text;
        } else if (text) {
            image.style.display = 'none';
            texte.textContent = text;
        } else if (imageUrl) {
            texte.style.display = 'none';
            image.src = imageUrl;
        }
        var crossDelete = document.createElement('span');
        crossDelete.classList.add("delete");
        crossDelete.innerHTML = "❌";
        crossDelete.addEventListener('click', function () {
            deleteMessage(id);
        });
        div.appendChild(crossDelete);
    } else {
        div.classList.add('not-author');
        if (text && imageUrl) {
            image.src = imageUrl;
            texte.textContent = text;
        } else if (text) {
            image.style.display = 'none';
            texte.textContent = text;
        } else if (imageUrl) {
            texte.style.display = 'none';
            image.src = imageUrl;
        }
    }

    // Show the card fading-in and scroll to view the new message.
    setTimeout(function () {
        div.classList.add('visible');
    }, 1);
    messageListElement.scrollTop = messageListElement.scrollHeight;
    messageInputElement.focus();
    window.scrollTo(0, document.body.scrollHeight);
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        //NOTIFICATION
        Notification.requestPermission().then((permission) => {
            // Si l'utilisateur accepte, créons une notification
            const permissionNotification = permission;
            /*if (permission === 'granted') {
                const notification = new Notification(message.userSender.username + ' a envoyé ' + message.message);
                notification.addEventListener('click', function (){
                    window.focus();
                })
            }*/
        })
        loadMessages();
        var pseudo;
        const queryPseudo = query(collection(getFirestore(), 'users'), where("uid", "==", getAuth().currentUser.uid));
        onSnapshot(queryPseudo, function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                pseudo = change.doc.data().username;
            });
        });
        document.getElementById('index').style.display = "none";
        document.getElementById('inscription').style.display = "none";
        document.getElementById('connecter').style.display = "block";
    } else {
        document.getElementById('connecter').style.display = "none";
        document.getElementById('profil').style.display = "none";
        document.getElementById('index').style.display = "block";
    }
});

// TODO 12: Initialize Firebase Performance Monitoring

initFirebaseAuth();

import {MDCTextField} from '@material/textfield';

const email = new MDCTextField(document.querySelector('.email'));
const passwordConnection = new MDCTextField(document.querySelector('.password-connection'));
const emailInscription = new MDCTextField(document.querySelector('.email-inscription'));
const pseudoInscription = new MDCTextField(document.querySelector('.pseudo-inscription'));
const passwordInscription = new MDCTextField(document.querySelector('.password-inscription'));
const username = new MDCTextField(document.querySelector('.username'));
const password = new MDCTextField(document.querySelector('.password'));

import {MDCDialog} from '@material/dialog';
const dialog = new MDCDialog(document.querySelector('.mdc-dialog'));
const dialogText = document.getElementById('my-dialog-content');
const counterChar = document.getElementById('counter-char');

messageInputElement.addEventListener('input', function() {
    counterChar.innerHTML = messageInputElement.value.length + '/1000'
});