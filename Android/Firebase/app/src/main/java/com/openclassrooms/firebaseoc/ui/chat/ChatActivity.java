package com.openclassrooms.firebaseoc.ui.chat;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.firebase.ui.firestore.FirestoreRecyclerOptions;
import com.google.firebase.firestore.Query;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ActivityChatBinding;
import com.openclassrooms.firebaseoc.manager.ChatManager;
import com.openclassrooms.firebaseoc.manager.UserManager;
import com.openclassrooms.firebaseoc.models.Message;
import com.openclassrooms.firebaseoc.ui.BaseActivity;

import pub.devrel.easypermissions.AfterPermissionGranted;
import pub.devrel.easypermissions.EasyPermissions;

public class ChatActivity extends BaseActivity<ActivityChatBinding> implements ChatAdapter.Listener {
    private ChatAdapter chatAdapter;
    private String currentChatName;
    private Uri uriImageSelected;

    private static final String PERMS = Manifest.permission.READ_EXTERNAL_STORAGE;
    private static final int RC_IMAGE_PERMS = 100;
    private static final int RC_CHOOSE_PHOTO = 200;

    // Rajouter ici si nouveau channel
    private static final String CHAT_NAME_GENERAL = "general";

    private UserManager userManager = UserManager.getInstance();
    private ChatManager chatManager = ChatManager.getInstance();

    @Override
    protected ActivityChatBinding getViewBinding() {
        return ActivityChatBinding.inflate(getLayoutInflater());
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureRecyclerView(CHAT_NAME_GENERAL);
        setupListeners();
    }

    private void setupListeners(){
        // Chat boutton, rajouter la redirection ici en fonction des futurs canaux
        binding.generalChatButton.setOnClickListener(view -> { this.configureRecyclerView(CHAT_NAME_GENERAL); });

        // Bouton envoyer
        binding.sendButton.setOnClickListener(view -> {
            if(binding.chatEditText.length() <= 1000) {
                sendMessage();
            } else {
                Toast.makeText(this, getString(R.string.toast_title_message_long), Toast.LENGTH_SHORT).show();
            }
        });

        // Bouton Plus
        binding.addFileButton.setOnClickListener(view -> { addFile(); });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        this.handleResponse(requestCode, resultCode, data);
    }

    @AfterPermissionGranted(RC_IMAGE_PERMS)
    private void addFile() {
        if (!EasyPermissions.hasPermissions(this, PERMS)) {
            EasyPermissions.requestPermissions(this, getString(R.string.popup_title_permission_files_access), RC_IMAGE_PERMS, PERMS);
            return;
        }
        Intent i = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(i, RC_CHOOSE_PHOTO);
    }

    // Gérer la réponse de l'activité (après que l'utilisateur ait choisi ou non une image)
    private void handleResponse(int requestCode, int resultCode, Intent data) {
        if (requestCode == RC_CHOOSE_PHOTO) {
            if (resultCode == RESULT_OK) {
                this.uriImageSelected = data.getData();
                Glide.with(this) // Preview de l'image
                        .load(this.uriImageSelected)
                        .apply(RequestOptions.circleCropTransform())
                        .into(binding.imagePreview);
            } else {
                Toast.makeText(this, getString(R.string.toast_title_no_image_chosen), Toast.LENGTH_SHORT).show();
            }
        }
    }

    // Configure RecyclerView
    private void configureRecyclerView(String chatName) {
        this.currentChatName = chatName;
        //Configure Adapter & RecyclerView
        this.chatAdapter = new ChatAdapter(
                generateOptionsForAdapter(chatManager.getAllMessageForChat(this.currentChatName)),
                Glide.with(this), this);

        chatAdapter.registerAdapterDataObserver(new RecyclerView.AdapterDataObserver() {
            @Override
            public void onItemRangeInserted(int positionStart, int itemCount) {
                binding.chatRecyclerView.smoothScrollToPosition(chatAdapter.getItemCount()); // Scroll vers le bas avec le nouveaux messages
            }
        });

        binding.chatRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        binding.chatRecyclerView.setAdapter(this.chatAdapter);
    }

    // Créer des options pour RecyclerView à partir d'une requête
    private FirestoreRecyclerOptions<Message> generateOptionsForAdapter(Query query) {
        return new FirestoreRecyclerOptions.Builder<Message>()
                .setQuery(query, Message.class)
                .setLifecycleOwner(this)
                .build();
    }

    public void onDataChanged() {
        // Afficher le TextView dans le cas où le RecyclerView est vide
        binding.emptyRecyclerView.setVisibility(this.chatAdapter.getItemCount() == 0 ? View.VISIBLE : View.GONE);
    }

    private void sendMessage() {
        // Check si l'utilisateur est connecté et que le message ne soit pas vide
        boolean canSendMessage = !TextUtils.isEmpty(binding.chatEditText.getText()) && userManager.isCurrentUserLogged();

        if(canSendMessage) {
            String messageText = binding.chatEditText.getText().toString();

            if(binding.imagePreview.getDrawable() == null) {
                chatManager.createMessageForChat(messageText, this.currentChatName);
            } else {
                chatManager.sendMessageWithImageForChat(messageText, this.uriImageSelected, this.currentChatName);
                binding.imagePreview.setImageDrawable(null);
            }

            binding.chatEditText.setText("");
        }
    }
}
