package com.openclassrooms.firebaseoc.ui;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.auth.FirebaseAuth;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityForgetPasswordBinding;
import com.openclassrooms.firebaseoc.manager.UserManager;

public class ForgetPasswordActivity extends BaseActivity<ActivityForgetPasswordBinding> {
    private UserManager userManager = UserManager.getInstance();

    @Override
    protected ActivityForgetPasswordBinding getViewBinding() {
        return ActivityForgetPasswordBinding.inflate(getLayoutInflater());
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
        Snackbar.make(binding.forgetPasswordActivity, message, Snackbar.LENGTH_SHORT).show();
    }

    private void setupListeners() {
        // Bouton connexion
        binding.loginButton.setOnClickListener(view -> {
            FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();

            String email = binding.emailEditText.getText().toString();

            if(!email.equals("") && !email.isEmpty()) {
                firebaseAuth.sendPasswordResetEmail(email)
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()) {
                                showSnackBar(getString(R.string.email_reset_password_send));
                            } else {
                                showSnackBar(getString(R.string.email_doesnt_exist));
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