package com.openclassrooms.firebaseoc.ui;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.auth.FirebaseAuth;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityLoginBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;

public class LoginActivity extends BaseActivity<ActivityLoginBinding> {
    private UserManager userManager = UserManager.getInstance();

    @Override
    ActivityLoginBinding getViewBinding() {
        return ActivityLoginBinding.inflate(getLayoutInflater());
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

    // Show Snack Bar with a message
    private void showSnackBar( String message) {
        Snackbar.make(binding.loginLayout, message, Snackbar.LENGTH_SHORT).show();
    }

    private void setupListeners() {
        // Login Button
        binding.loginButton.setOnClickListener(view -> {
            FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();

            String email = binding.emailEditText.getText().toString();
            String password = binding.passwordEditText.getText().toString();

            if(!email.equals("") && !email.isEmpty()) {
                if(!password.equals("") && !password.isEmpty()) {
                    firebaseAuth.signInWithEmailAndPassword(email, password)
                                .addOnCompleteListener(this, task -> {
                                    if (task.isSuccessful()) {
                                        startProfileActivity();
                                    } else {
                                        showSnackBar(getString(R.string.login_valid));
                                    }
                                });
                } else {
                    showSnackBar(getString(R.string.password_not_valid));
                }
            } else {
                showSnackBar(getString(R.string.email_not_valid));
            }
        });
    }

    // Launching Main Activity
    private void startMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
    }

    // Launching Profile Activity
    private void startProfileActivity() {
        Intent intent = new Intent(this, ProfileActivity.class);
        startActivity(intent);
    }
}