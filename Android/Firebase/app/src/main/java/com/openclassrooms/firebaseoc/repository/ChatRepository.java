package com.openclassrooms.firebaseoc.repository;

import android.net.Uri;

import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;
import com.openclassrooms.firebaseoc.manager.UserManager;
import com.openclassrooms.firebaseoc.models.Message;

import java.util.UUID;

public final class ChatRepository {
    private static final String CHAT_COLLECTION = "chats";
    private static final String MESSAGE_COLLECTION = "messages";
    private static volatile ChatRepository instance;

    private UserManager userManager;

    private ChatRepository() {
        this.userManager = UserManager.getInstance();
    }

    public static ChatRepository getInstance() {
        ChatRepository result = instance;

        if (result != null) {
            return result;
        }

        synchronized(ChatRepository.class) {
            if (instance == null) {
                instance = new ChatRepository();
            }

            return instance;
        }
    }

    public CollectionReference getChatCollection(){
        return FirebaseFirestore.getInstance().collection(CHAT_COLLECTION);
    }

    public Query getAllMessageForChat(String chat){
        return this.getChatCollection()
                .document(chat)
                .collection(MESSAGE_COLLECTION)
                .orderBy("dateCreated");
    }

    public void createMessageForChat(String textMessage, String chat) {
        userManager.getUserData().addOnSuccessListener(user -> {
            Message message = new Message(textMessage, user);

            // Enregistre le message dans firestore
            this.getChatCollection()
                    .document(chat)
                    .collection(MESSAGE_COLLECTION)
                    .add(message);
        });
    }

    public UploadTask uploadImage(Uri imageUri, String chat) {
        String uuid = UUID.randomUUID().toString();
        StorageReference mImageRef = FirebaseStorage.getInstance().getReference(chat + "/" + uuid);
        return mImageRef.putFile(imageUri);
    }

    public void createMessageWithImageForChat(String urlImage, String textMessage, String chat) {
        userManager.getUserData().addOnSuccessListener(user -> {
            Message message = new Message(textMessage, urlImage, user);

            // Enregiste le message dans Firestore
            this.getChatCollection()
                    .document(chat)
                    .collection(MESSAGE_COLLECTION)
                    .add(message);
        });
    }
}
