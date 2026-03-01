package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.models.ContactMessage;
import com.ecommerce.matessa.payLoad.ContactDTO;
import com.ecommerce.matessa.services.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ContactController {

    @Autowired
    private ContactService contactService;

    // ✅ PUBLIC: Send Message
    @PostMapping("/public/contact")
    public ResponseEntity<String> sendMessage(@Valid @RequestBody ContactDTO contactDTO) {
        contactService.saveMessage(contactDTO);
        return new ResponseEntity<>("Message sent successfully!", HttpStatus.CREATED);
    }

    // ✅ ADMIN: Get All Messages
    @GetMapping("/admin/contact/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return new ResponseEntity<>(contactService.getAllMessages(), HttpStatus.OK);
    }

    // ✅ ADMIN: Mark as Read (When admin clicks a message)
    @PutMapping("/admin/contact/messages/{id}/read")
    public ResponseEntity<ContactMessage> markAsRead(@PathVariable Long id) {
        return new ResponseEntity<>(contactService.markAsRead(id), HttpStatus.OK);
    }

    // ✅ ADMIN: Delete Message
    @DeleteMapping("/admin/contact/messages/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return new ResponseEntity<>("Message deleted", HttpStatus.OK);
    }
}