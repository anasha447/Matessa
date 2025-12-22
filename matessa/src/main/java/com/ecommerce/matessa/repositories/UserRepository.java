package com.ecommerce.matessa.repositories;


import com.ecommerce.matessa.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUserName(String username);

    Optional<User> findByEmail(String email);

    long count();

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    Optional<User> findByUserNameOrEmail(String userName, String email);

}
