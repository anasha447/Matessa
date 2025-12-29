package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.ContactMessage;
import com.ecommerce.matessa.payLoad.ContactDTO;
import com.ecommerce.matessa.repositories.ContactRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactServiceImpl implements ContactService {

    @Autowired private ContactRepository contactRepository;
    @Autowired private ModelMapper modelMapper;

    // 1. Save Message (Public)
    @Override
    public ContactMessage saveMessage(ContactDTO contactDTO) {
        ContactMessage message = modelMapper.map(contactDTO, ContactMessage.class);
        message.setSubmittedAt(LocalDateTime.now());
        message.setRead(false);
        return contactRepository.save(message);
    }

    // 2. Get All (Admin)
    @Override
    public List<ContactMessage> getAllMessages() {
        return contactRepository.findAllByOrderBySubmittedAtDesc();
    }

    // 3. Mark as Read (Admin)
    @Override
    public ContactMessage markAsRead(Long messageId) {
        ContactMessage msg = contactRepository.findById(messageId)
                .orElseThrow(() -> new ResourceExceptionHandler("Message", "id", messageId));
        msg.setRead(true);
        return contactRepository.save(msg);
    }

    // 4. Delete (Admin)
    @Override
    public void deleteMessage(Long messageId) {
        ContactMessage msg = contactRepository.findById(messageId)
                .orElseThrow(() -> new ResourceExceptionHandler("Message", "id", messageId));
        contactRepository.delete(msg);
    }
}