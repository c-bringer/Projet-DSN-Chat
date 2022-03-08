package com.openclassrooms.firebaseoc.models;

import androidx.annotation.Nullable;

public class User {
   private String uid;
   private String username;
   private String password;
   @Nullable
   private String urlPicture;

   public User() { }

   public User(String uid, String username, @Nullable String password, @Nullable String urlPicture) {
      this.uid = uid;
      this.username = username;
      this.urlPicture = urlPicture;
   }

   public String getUid() {
      return uid;
   }

   public void setUid(String uid) {
      this.uid = uid;
   }

   public String getPassword() {
      return password;
   }

   public void setPassword(String password) {
      this.password = password;
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
}
