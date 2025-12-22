package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.AppRole;
import com.ecommerce.matessa.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(AppRole appRole);
}
