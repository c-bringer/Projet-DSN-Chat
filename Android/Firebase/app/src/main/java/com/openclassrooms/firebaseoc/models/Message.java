package com.openclassrooms.firebaseoc.models;

import com.google.firebase.firestore.ServerTimestamp;

import java.util.Date;

public class Message {
   private String message;
   private Date dateCreated;
   private User userSender;
   private String urlImage;

   public Message() { }

   public Message(String message, User userSender) {
      this.message = message;
      this.userSender = userSender;
   }

   public Message(String message, String urlImage, User userSender) {
      this.message = message;
      this.urlImage = urlImage;
      this.userSender = userSender;
   }

   public String getMessage() {
      return message;
   }

   public void setMessage(String message) {
      this.message = message;
   }

   @ServerTimestamp
   public Date getDateCreated() {
      return dateCreated;
   }

   public void setDateCreated(Date dateCreated) {
      this.dateCreated = dateCreated;
   }

   public User getUserSender() {
      return userSender;
   }

   public void setUserSender(User userSender) {
      this.userSender = userSender;
   }

   public String getUrlImage() {
      return urlImage;
   }

   public void setUrlImage(String urlImage) {
      this.urlImage = urlImage;
   }
}
