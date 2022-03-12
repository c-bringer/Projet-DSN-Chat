package com.openclassrooms.firebaseoc.ui;

import android.app.AlertDialog;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;

import androidx.annotation.Nullable;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.auth.FirebaseUser;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityProfileBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;

import java.util.regex.Pattern;

public class ProfileActivity extends BaseActivity<ActivityProfileBinding> {
   private UserManager userManager = UserManager.getInstance();

   @Override
   protected ActivityProfileBinding getViewBinding() {
      return ActivityProfileBinding.inflate(getLayoutInflater());
   }

   @Override
   public void onCreate(@Nullable Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setupListeners();
      updateUIWithUserData();
   }

   private void setupListeners() {
      // Bouton déconnexion
      binding.signOutButton.setOnClickListener(view -> {
         userManager.signOut(this).addOnSuccessListener(aVoid -> {
            finish();
         });
      });

      // Bouton mettre à jour
      binding.updateButton.setOnClickListener(view -> {
         binding.progressBar.setVisibility(View.VISIBLE);

//         AuthCredential credential = EmailAuthProvider.getCredential(
//                 userManager.getCurrentUser().getEmail(),
//                 "corentin"
//         );

//         userManager.getCurrentUser().reauthenticate(credential)
//                    .addOnSuccessListener(aVoid -> {
                       if(!userManager.getCurrentUser().getEmail().equals(binding.emailEditText.getText().toString())) {
                          userManager.getCurrentUser().updateEmail(binding.emailEditText.getText().toString())
                                     .addOnSuccessListener(aVoid2 -> {
                                        binding.progressBar.setVisibility(View.INVISIBLE);
                                        showSnackBar(getString(R.string.updated_succeed));
                                     });
                       }

                       if(!binding.passwordEditText.getText().toString().equals("")) {
                          String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
                          String password = binding.passwordEditText.getText().toString();

                          if(Pattern.matches(regex, password)) {
                             userManager.getCurrentUser().updatePassword(binding.passwordEditText.getText().toString())
                                        .addOnSuccessListener(aVoid2 -> {
                                           binding.progressBar.setVisibility(View.INVISIBLE);
                                           showSnackBar(getString(R.string.updated_succeed));
                                        });
                          } else {
                             showSnackBar(getString(R.string.updated_password_not_succeed));
                          }
                       }


//                    });
      });

      // Bouton supprimer
      binding.deleteButton.setOnClickListener(view -> {
         new AlertDialog.Builder(this)
                 .setMessage(R.string.popup_message_confirmation_delete_account)
                 .setPositiveButton(R.string.popup_message_choice_yes, (dialogInterface, i) ->
                         userManager.deleteUser(ProfileActivity.this)
                                    .addOnSuccessListener(aVoid -> {
                                                             finish();
                                                          }))
                 .setNegativeButton(R.string.popup_message_choice_no, null)
                 .show();

         showSnackBar(getString(R.string.delete_succeed));
      });
   }

   private void updateUIWithUserData() {
      if(userManager.isCurrentUserLogged()) {
         FirebaseUser user = userManager.getCurrentUser();

         if(user.getPhotoUrl() != null) {
            setProfilePicture(user.getPhotoUrl());
         }

         setTextUserData(user);
         getUserData();
      }
   }

   private void getUserData() {
      userManager.getUserData().addOnSuccessListener(user -> {
         // Définir les données avec les informations de l'utilisateur
         String username = TextUtils.isEmpty(user.getUsername()) ? getString(R.string.info_no_username_found) : user.getUsername();
         binding.pseudoTextView.setText(username);
      });
   }

   private void setProfilePicture(Uri profilePictureUrl) {
      Glide.with(this)
           .load(profilePictureUrl)
           .apply(RequestOptions.circleCropTransform())
           .into(binding.profileImageView);
   }

   private void setTextUserData(FirebaseUser user) {
      // Obtenir l'email et le nom d'utilisateur de l'utilisateur
      String email = TextUtils.isEmpty(user.getEmail()) ? getString(R.string.info_no_email_found) : user.getEmail();
      String username = TextUtils.isEmpty(user.getDisplayName()) ? getString(R.string.info_no_username_found) : user.getDisplayName();

      // Mise à jour des vues avec des données
      binding.emailEditText.setText(email);
      binding.pseudoTextView.setText(username);
   }

   // Montrer Snack Bar avec un message
   private void showSnackBar( String message) {
      Snackbar.make(binding.profileLayout, message, Snackbar.LENGTH_SHORT).show();
   }
}
