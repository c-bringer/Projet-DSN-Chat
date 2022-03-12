package com.openclassrooms.firebaseoc.ui;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityRegisterBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;

import java.util.regex.Pattern;

public class RegisterActivity extends BaseActivity<ActivityRegisterBinding> {
   private UserManager userManager = UserManager.getInstance();
   private static final String COLLECTION_NAME = "users";
   private static final String USERNAME_FIELD_NAME = "username";
   private static final String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

   @Override
   protected ActivityRegisterBinding getViewBinding() {
      return ActivityRegisterBinding.inflate(getLayoutInflater());
   }

   @Override
   protected void onResume() {
      super.onResume();

      if(userManager.isCurrentUserLogged()) {
         startMainActivity();
      }
   }

   @Override
   public void onCreate(@Nullable Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setupListeners();
   }

   // Montrer Snack Bar avec un message
   private void showSnackBar( String message) {
      Snackbar.make(binding.registerLayout, message, Snackbar.LENGTH_SHORT).show();
   }

   private void setupListeners() {
      // Bouton inscription
      binding.registerButton.setOnClickListener(view -> {
         FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();

         String email = binding.emailEditText.getText().toString();
         String pseudo = binding.pseudoEditText.getText().toString();
         String password = binding.passwordEditText.getText().toString();

         if(!email.equals("") && !email.isEmpty()) {
            firebaseAuth.fetchSignInMethodsForEmail(email)
                        .addOnCompleteListener(task -> {
                           boolean isNewUser = task.getResult().getSignInMethods().isEmpty();

                           if(isNewUser) {
                              if(!pseudo.equals("") && !pseudo.isEmpty()) {
                                 FirebaseFirestore rootRef = FirebaseFirestore.getInstance();
                                 CollectionReference allUsersRef = rootRef.collection(COLLECTION_NAME);
                                 Query userNameQuery = allUsersRef.whereEqualTo(USERNAME_FIELD_NAME, pseudo);

                                 userNameQuery.get().addOnCompleteListener(task1 -> {
                                    if(task1.isSuccessful()) {
                                       for(DocumentSnapshot documentSnapshot : task1.getResult()){
                                          String user = documentSnapshot.getString(USERNAME_FIELD_NAME);

                                          if(user.equals(pseudo)) {
                                             showSnackBar(getString(R.string.pseudo_exist));
                                          }
                                       }
                                    }

                                    if(task1.getResult().size() == 0) {
                                       if(!password.equals("") && !password.isEmpty() && Pattern.matches(passwordPattern, password)) {
                                          userManager.createUser(email, password, pseudo);
                                          showSnackBar(getString(R.string.register_valid));
                                       } else {
                                          showSnackBar(getString(R.string.password_not_valid));
                                       }
                                    }
                                 });
                              } else {
                                 showSnackBar(getString(R.string.pseudo_not_valid));
                              }
                           } else {
                              showSnackBar(getString(R.string.email_exist));
                           }
                        });
         } else {
            showSnackBar(getString(R.string.email_not_valid));
         }
      });
   }

   // Lancer Main Activity
   private void startMainActivity() {
      Intent intent = new Intent(this, MainActivity.class);
      startActivity(intent);
   }
}
