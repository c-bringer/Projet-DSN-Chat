package com.openclassrooms.firebaseoc.ui;

import androidx.annotation.Nullable;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.google.android.material.snackbar.Snackbar;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityMainBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;
import com.openclassrooms.firebaseoc.ui.chat.ChatActivity;

public class MainActivity extends BaseActivity<ActivityMainBinding> {
    private UserManager userManager = UserManager.getInstance();

    @Override
    protected ActivityMainBinding getViewBinding() {
        return ActivityMainBinding.inflate(getLayoutInflater());
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateLoginButton();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupListeners();
    }

    private void setupListeners() {
        // Button connexion/profil
        binding.loginButton.setOnClickListener(view -> {
            if(userManager.isCurrentUserLogged()) {
                startProfileActivity();
            } else {
                startLoginActivity();
            }
        });

        // Bouton inscription
        binding.registerButton.setOnClickListener(view -> {
            if(!userManager.isCurrentUserLogged()) {
                startSignInActivity();
            }
        });

        // Bouton chat
        binding.chatButton.setOnClickListener(view -> {
            if(userManager.isCurrentUserLogged()){
                startMentorChatActivity();
            }else{
                showSnackBar(getString(R.string.error_not_connected));
            }
        });
    }

    // Montrer Snack Bar avec un message
    private void showSnackBar( String message) {
        Snackbar.make(binding.mainLayout, message, Snackbar.LENGTH_SHORT).show();
    }

    private void startSignInActivity() {
        Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
    }

    // Lancer Profile Activity
    private void startProfileActivity() {
        Intent intent = new Intent(this, ProfileActivity.class);
        startActivity(intent);
    }

    // Lancer Login Activity
    private void startLoginActivity() {
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }

    // Lancer Chat Activity
    private void startMentorChatActivity(){
        Intent intent = new Intent(this, ChatActivity.class);
        startActivity(intent);
    }

    // Mise à jour du bouton de connexion lors de la reprise de l'activité
    private void updateLoginButton() {
        binding.registerButton.setVisibility(userManager.isCurrentUserLogged() ? View.GONE : View.VISIBLE);
        binding.loginButton.setText(userManager.isCurrentUserLogged() ? getString(R.string.button_login_text_logged) : getString(R.string.button_login_text_not_logged));
    }
}