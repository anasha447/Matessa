package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.payLoad.SubscriberDTO;
import com.ecommerce.matessa.services.SubscriberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class SubscriberController {

    @Autowired
    private SubscriberService subscriberService;

    @PostMapping("/subscribe")
    public ResponseEntity<SubscriberDTO> subscribeUser(@Valid @RequestBody SubscriberDTO subscriberDTO) {
        SubscriberDTO savedSubscriber = subscriberService.addSubscriber(subscriberDTO);
        return new ResponseEntity<>(savedSubscriber, HttpStatus.CREATED);
    }

    @GetMapping("/admin/subscribers")
    public ResponseEntity<List<SubscriberDTO>> getSubscribers() {
        List<SubscriberDTO> subscribers = subscriberService.getAllSubscribers();
        return new ResponseEntity<>(subscribers, HttpStatus.OK);
    }
}