package com.tutorials.codegallery.security;

import com.tutorials.codegallery.model.AppUser;
import com.tutorials.codegallery.model.AppUserRole;
import com.tutorials.codegallery.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtil.generateToken(authentication.getName());
        AppUser user = appUserRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found."));
        return ResponseEntity.ok(new AuthResponse(token, authentication.getName(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (registerRequest == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration data is required."));
        }

        String firstName = Optional.ofNullable(registerRequest.getFirstName()).map(String::trim).orElse("");
        String lastName = Optional.ofNullable(registerRequest.getLastName()).map(String::trim).orElse("");
        String email = Optional.ofNullable(registerRequest.getEmail()).map(String::trim).orElse("");
        String mobileNo = Optional.ofNullable(registerRequest.getMobileNo()).map(String::trim).orElse("");
        String password = Optional.ofNullable(registerRequest.getPassword()).orElse("");
        String confirmPassword = Optional.ofNullable(registerRequest.getConfirmPassword()).orElse("");

        if (firstName.isBlank() || lastName.isBlank() || (email.isBlank() && mobileNo.isBlank()) || password.isBlank() || confirmPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All required fields must be filled in."));
        }

        if (!Objects.equals(password, confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Both passwords should match."));
        }

        String username = email.isBlank() ? mobileNo : email;

        if (appUserRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This username already exists."));
        }
        if (!email.isBlank() && appUserRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This email is already registered."));
        }
        if (!mobileNo.isBlank() && appUserRepository.findByMobileNo(mobileNo).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This mobile number is already registered."));
        }

        AppUser appUser = new AppUser();
        appUser.setFirstName(firstName);
        appUser.setLastName(lastName);
        appUser.setEmail(email);
        appUser.setMobileNo(mobileNo);
        appUser.setUsername(username);
        appUser.setPassword(passwordEncoder.encode(password));
        appUser.setRole(AppUserRole.fromInput(registerRequest.getRole()));

        appUserRepository.save(appUser);

        return ResponseEntity.ok(Map.of("message", "Registration successful."));
    }
}
