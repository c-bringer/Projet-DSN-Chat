package com.openclassrooms.firebaseoc.repository;

import android.content.Context;
import android.util.Log;

import androidx.annotation.Nullable;

import com.firebase.ui.auth.AuthUI;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.openclassrooms.firebaseoc.models.User;

public  final class UserRepository {
    private static volatile UserRepository instance;
    private static final String COLLECTION_NAME = "users";

    private UserRepository() {}

    public static UserRepository getInstance() {
        UserRepository result = instance;

        if(result != null) {
            return result;
        }

        synchronized(UserRepository.class) {
            if (instance == null) {
                instance = new UserRepository();
            }

            return instance;
        }
    }

    @Nullable
    public FirebaseUser getCurrentUser() {
        return FirebaseAuth.getInstance().getCurrentUser();
    }

    @Nullable
    public String getCurrentUserUID() {
        FirebaseUser user = getCurrentUser();
        return (user != null) ? user.getUid() : null;
    }

    public Task<Void> signOut(Context context) {
        return AuthUI.getInstance().signOut(context);
    }

    public Task<Void> deleteUser(Context context) {
        return AuthUI.getInstance().delete(context);
    }

    // Get the Collection Reference
    private CollectionReference getUsersCollection() {
        return FirebaseFirestore.getInstance().collection(COLLECTION_NAME);
    }

    // Create User in Firestore
    public void createUser(String email, String password, String pseudo) {
        FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();

        firebaseAuth.createUserWithEmailAndPassword(email, password)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful()) {
                            FirebaseUser user = firebaseAuth.getCurrentUser();

                            if(user != null) {
                                String urlPicture = (user.getPhotoUrl() != null) ? user.getPhotoUrl().toString() : null;
                                String uid = user.getUid();

                                User userToCreate = new User(uid, pseudo, urlPicture);

                                Task<DocumentSnapshot> userData = getUserData();
                                // If the user already exist in Firestore
                                userData.addOnSuccessListener(documentSnapshot -> {
                                    this.getUsersCollection().document(uid).set(userToCreate);
                                });
                            }
                        } else {
                            Log.w("TAG", "createUserWithEmail:failure", task.getException());
                        }
                    });
    }

    // Get User Data from Firestore
    public Task<DocumentSnapshot> getUserData() {
        String uid = this.getCurrentUserUID();

        if(uid != null) {
            return this.getUsersCollection().document(uid).get();
        } else {
            return null;
        }
    }

    // Delete the User from Firestore
    public void deleteUserFromFirestore() {
        String uid = this.getCurrentUserUID();

        if(uid != null) {
            this.getUsersCollection().document(uid).delete();
        }
    }
}