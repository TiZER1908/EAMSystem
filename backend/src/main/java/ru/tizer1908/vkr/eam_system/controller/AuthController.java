package ru.tizer1908.vkr.eam_system.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.LoginRequest;
import ru.tizer1908.vkr.eam_system.dto.LoginResponse;
import ru.tizer1908.vkr.eam_system.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor 
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {
	
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	
	@PostMapping("/login")
	public LoginResponse login(@RequestBody LoginRequest request) {
		try {
		Authentication authentication = authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String token = jwtService.generateToken(userDetails);
		return new LoginResponse(token);
		} catch (AuthenticationException e) {
	        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный логин или пароль");
	    }
	}
}
