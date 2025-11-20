package com.ticketing.service;

import com.ticketing.dto.AuthResponse;
import com.ticketing.dto.LoginRequest;
import com.ticketing.dto.RefreshTokenRequest;
import com.ticketing.dto.RegisterRequest;
import com.ticketing.entity.Role;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      JwtTokenProvider tokenProvider, AuthenticationManager authenticationManager,
                      UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(Role.USER);

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            String username = tokenProvider.getUsernameFromToken(request.getRefreshToken());
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!tokenProvider.validateToken(request.getRefreshToken(), userDetails)) {
                throw new RuntimeException("Invalid refresh token");
            }

            String accessToken = tokenProvider.generateAccessToken(userDetails);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails);

            return new AuthResponse(accessToken, refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token", e);
        }
    }
}

