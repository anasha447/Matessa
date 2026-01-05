package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface AddressRepository extends JpaRepository<Address, Long> {
}
