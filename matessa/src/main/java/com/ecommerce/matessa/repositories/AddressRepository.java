package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
