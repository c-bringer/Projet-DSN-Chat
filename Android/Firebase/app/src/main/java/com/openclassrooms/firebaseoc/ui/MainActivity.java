package com.openclassrooms.firebaseoc.ui;

import androidx.annotation.Nullable;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityMainBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;

public class MainActivity extends BaseActivity<ActivityMainBinding> {
    private UserManager userManager = UserManager.getInstance();

    @Override
    ActivityMainBinding getViewBinding() {
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
        // Login/Profile Button
        binding.loginButton.setOnClickListener(view -> {
            if(userManager.isCurrentUserLogged()) {
                startProfileActivity();
            } else {
                startLoginActivity();
            }
        });

        binding.registerButton.setOnClickListener(view -> {
            if(!userManager.isCurrentUserLogged()) {
                startSignInActivity();
            }
        });
    }

    private void startSignInActivity() {
        Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
    }

    // Launching Profile Activity
    private void startProfileActivity() {
        Intent intent = new Intent(this, ProfileActivity.class);
        startActivity(intent);
    }

    // Launching Login Activity
    private void startLoginActivity() {
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }

    // Update Login Button when activity is resuming
    private void updateLoginButton() {
        if(userManager.isCurrentUserLogged()) {
            binding.registerButton.setVisibility(View.GONE);
        } else {
            binding.registerButton.setVisibility(View.VISIBLE);
        }

        binding.loginButton.setText(userManager.isCurrentUserLogged() ? getString(R.string.button_login_text_logged) : getString(R.string.button_login_text_not_logged));
    }
}