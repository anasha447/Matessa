package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.models.Subscriber;
import com.ecommerce.matessa.payLoad.SubscriberDTO;
import com.ecommerce.matessa.repositories.SubscriberRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriberServiceImpl implements SubscriberService {

    @Autowired
    private SubscriberRepository subscriberRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public SubscriberDTO addSubscriber(SubscriberDTO subscriberDTO) {
        // 1. Validation: Check duplicates
        if (subscriberRepository.existsByEmail(subscriberDTO.getEmail())) {
            throw new ApisExceptionHandler("Email is already subscribed!");
        }

        // 2. Map DTO -> Entity
        Subscriber subscriber = modelMapper.map(subscriberDTO, Subscriber.class);

        // 3. Save to DB
        Subscriber savedSubscriber = subscriberRepository.save(subscriber);

        // 4. Map Entity -> DTO
        return modelMapper.map(savedSubscriber, SubscriberDTO.class);
    }

    @Override
    public List<SubscriberDTO> getAllSubscribers() {
        return subscriberRepository.findAll().stream()
                .map(sub -> modelMapper.map(sub, SubscriberDTO.class))
                .collect(Collectors.toList());
    }
}