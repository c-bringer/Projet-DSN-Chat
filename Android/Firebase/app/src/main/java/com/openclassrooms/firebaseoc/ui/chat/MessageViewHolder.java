package com.openclassrooms.firebaseoc.ui.chat;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.RequestManager;
import com.bumptech.glide.request.RequestOptions;
import com.openclassrooms.firebaseoc.R;
import com.openclassrooms.firebaseoc.databinding.ItemChatBinding;
import com.openclassrooms.firebaseoc.models.Message;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MessageViewHolder extends RecyclerView.ViewHolder {
    private ItemChatBinding binding;

    private final int colorCurrentUser;
//    private final int colorRemoteUser;
    private int colorRemoteUser;

    private boolean isSender;

    public MessageViewHolder(@NonNull View itemView, boolean isSender) {
        super(itemView);
        this.isSender = isSender;
        binding = ItemChatBinding.bind(itemView);

        // Couleur par defaut
        colorCurrentUser = ContextCompat.getColor(itemView.getContext(), R.color.colorAccent);
//        colorRemoteUser = ContextCompat.getColor(itemView.getContext(), R.color.colorPrimary);
    }

    @SuppressLint("ResourceType")
    public void updateWithMessage(Message message, RequestManager glide) {
        binding.messageTextView.setText(message.getMessage());
        binding.messageTextView.setTextAlignment(isSender ? View.TEXT_ALIGNMENT_TEXT_END : View.TEXT_ALIGNMENT_TEXT_START);

        if(message.getUserSender().getMessageColor() != null) {
            colorRemoteUser = Color.parseColor(message.getUserSender().getMessageColor());
        } else {
            colorRemoteUser = ContextCompat.getColor(itemView.getContext(), R.color.colorPrimary);
        }

        if(message.getUserSender().getUsername() != null) {
            binding.pseudoTextView.setText(message.getUserSender().getUsername());
        }

        if(message.getDateCreated() != null) {
            binding.dateTextView.setText(this.convertDateToHour(message.getDateCreated()));
        }

        if(message.getUserSender().getUrlPicture() != null) {
            glide.load(message.getUserSender().getUrlPicture())
                    .apply(RequestOptions.circleCropTransform())
                    .into(binding.profileImage);
        }

        if(message.getUrlImage() != null) {
            glide.load(message.getUrlImage())
                    .into(binding.senderImageView);

            binding.senderImageView.setVisibility(View.VISIBLE);
        } else {
            binding.senderImageView.setVisibility(View.GONE);
        }

        updateLayoutFromSenderType();
    }

    private void updateLayoutFromSenderType() {
        // Mets à jour la couleur de fond de la bulle de message
        ((GradientDrawable) binding.messageTextContainer.getBackground()).setColor(isSender ? colorCurrentUser : colorRemoteUser);
        binding.messageTextContainer.requestLayout();

        if(!isSender) {
            updateProfileContainer();
            updateMessageContainer();
        }
    }

    private void updateProfileContainer(){
        // Mettre à jour la contrainte pour le conteneur de profil (le pousser vers la gauche pour le message du récepteur)
        ConstraintLayout.LayoutParams profileContainerLayoutParams = (ConstraintLayout.LayoutParams) binding.profileContainer.getLayoutParams();
        profileContainerLayoutParams.endToEnd = ConstraintLayout.LayoutParams.UNSET;
        profileContainerLayoutParams.startToStart = ConstraintLayout.LayoutParams.PARENT_ID;
        binding.profileContainer.requestLayout();
    }

    private void updateMessageContainer(){
        // Mettre à jour la contrainte pour le conteneur de message (le pousser à droite du conteneur de profil pour le message récepteur)
        ConstraintLayout.LayoutParams messageContainerLayoutParams = (ConstraintLayout.LayoutParams) binding.messageContainer.getLayoutParams();
        messageContainerLayoutParams.startToStart = ConstraintLayout.LayoutParams.UNSET;
        messageContainerLayoutParams.endToStart = ConstraintLayout.LayoutParams.UNSET;
        messageContainerLayoutParams.startToEnd = binding.profileContainer.getId();
        messageContainerLayoutParams.endToEnd = ConstraintLayout.LayoutParams.PARENT_ID;
        messageContainerLayoutParams.horizontalBias = 0.0f;
        binding.messageContainer.requestLayout();

        // Mettre à jour la contrainte (gravité) pour le texte du message (contenu + date) (l'aligner à gauche pour le message du récepteur)
        LinearLayout.LayoutParams messageTextLayoutParams = (LinearLayout.LayoutParams) binding.messageTextContainer.getLayoutParams();
        messageTextLayoutParams.gravity = Gravity.START;
        binding.messageTextContainer.requestLayout();

        LinearLayout.LayoutParams dateLayoutParams = (LinearLayout.LayoutParams) binding.dateTextView.getLayoutParams();
        dateLayoutParams.gravity = Gravity.BOTTOM | Gravity.START;
        binding.dateTextView.requestLayout();

    }

    private String convertDateToHour(Date date) {
        DateFormat dfTime = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
        return dfTime.format(date);
    }
}