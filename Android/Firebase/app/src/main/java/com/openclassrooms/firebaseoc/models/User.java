package com.openclassrooms.firebaseoc.models;

import androidx.annotation.Nullable;

public class User {
   private String uid;
   private String username;
   @Nullable
   private String urlPicture;
   private String messageColor;

   public User() { }

   public User(String uid, String username, @Nullable String urlPicture, String messageColor) {
      this.uid = uid;
      this.username = username;
      this.urlPicture = urlPicture;
      this.messageColor = messageColor;
   }

   public String getUid() {
      return uid;
   }

   public void setUid(String uid) {
      this.uid = uid;
   }

   public String getUsername() {
      return username;
   }

   public void setUsername(String username) {
      this.username = username;
   }

   @Nullable
   public String getUrlPicture() {
      return urlPicture;
   }

   public void setUrlPicture(@Nullable String urlPicture) {
      this.urlPicture = urlPicture;
   }

   public String getMessageColor() {
      return messageColor;
   }

   public void setMessageColor(String messageColor) {
      this.messageColor = messageColor;
   }
}
