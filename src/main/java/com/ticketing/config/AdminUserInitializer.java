package com.ticketing.config;

import com.ticketing.entity.Role;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@ticketing.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
            adminUser.setFullName("System Administrator");
            adminUser.setRole(Role.ADMIN);
            
            userRepository.save(adminUser);
            logger.info("Admin user created: {}", adminEmail);
        } else {
            logger.debug("Admin user already exists: {}", adminEmail);
        }
    }
}

