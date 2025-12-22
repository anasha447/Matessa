package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.SubscriberDTO;
import java.util.List;

public interface SubscriberService {
    SubscriberDTO addSubscriber(SubscriberDTO subscriberDTO);
    List<SubscriberDTO> getAllSubscribers();
}