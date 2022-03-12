package com.openclassrooms.firebaseoc.manager;

import android.content.Context;

import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseUser;
import com.openclassrooms.firebaseoc.models.User;
import com.openclassrooms.firebaseoc.repository.UserRepository;

public class UserManager {
   private static volatile UserManager instance;
   private UserRepository userRepository;

   private UserManager() {
      userRepository = UserRepository.getInstance();
   }

   public static UserManager getInstance() {
      UserManager result = instance;

      if(result != null) {
         return result;
      }

      synchronized(UserRepository.class) {
         if(instance == null) {
            instance = new UserManager();
         }

         return instance;
      }
   }

   public FirebaseUser getCurrentUser() {
      return userRepository.getCurrentUser();
   }

   public Boolean isCurrentUserLogged() {
      return (this.getCurrentUser() != null);
   }

   public Task<Void> signOut(Context context) {
      return userRepository.signOut(context);
   }

   public void createUser(String email, String password, String pseudo) {
      userRepository.createUser(email, password, pseudo);
   }

   public Task<User> getUserData() {
      // Obtenir l'utilisateur de Firestore et le convertir en un objet de modèle d'utilisateur.
      return userRepository.getUserData().continueWith(task -> task.getResult().toObject(User.class)) ;
   }

   public Task<Void> deleteUser(Context context){
      // Supprimer le compte d'utilisateur de l'Auth
      return userRepository.deleteUser(context).addOnCompleteListener(task -> {
         // Une fois cela fait, supprimez les données de l'utilisateur de Firestore
         userRepository.deleteUserFromFirestore();
      });
   }
}
