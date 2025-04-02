package com.example.skillshare.repository;

//package com.skillshare.repository;

import com.example.skillshare.model.ERole;
import com.example.skillshare.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
