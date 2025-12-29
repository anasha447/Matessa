package com.ecommerce.matessa.services;

import com.ecommerce.matessa.models.ContactMessage;
import com.ecommerce.matessa.payLoad.ContactDTO;
import java.util.List;

public interface ContactService {

    // Saves a new message from the contact form
    ContactMessage saveMessage(ContactDTO contactDTO);

    // Retrieves all messages for the admin inbox (sorted by date)
    List<ContactMessage> getAllMessages();

    // Marks a specific message as read
    ContactMessage markAsRead(Long messageId);

    // Deletes a specific message
    void deleteMessage(Long messageId);
}