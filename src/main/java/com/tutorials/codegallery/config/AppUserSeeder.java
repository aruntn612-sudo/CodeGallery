package com.tutorials.codegallery.config;

import com.tutorials.codegallery.model.AppUser;
import com.tutorials.codegallery.model.AppUserRole;
import com.tutorials.codegallery.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppUserSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserSeeder(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.findByUsername("admin").isEmpty()) {
            AppUser adminUser = new AppUser("admin", passwordEncoder.encode("admin123"), AppUserRole.ADMIN);
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setEmail("admin@codegallery.com");
            adminUser.setMobileNo("9999999999");
            appUserRepository.save(adminUser);
        }
    }
}
