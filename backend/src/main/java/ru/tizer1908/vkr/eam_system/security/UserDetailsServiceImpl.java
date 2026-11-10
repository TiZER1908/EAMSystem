package ru.tizer1908.vkr.eam_system.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.repository.UserRepository;

import ru.tizer1908.vkr.eam_system.model.User;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByUsername(username)
			.orElseThrow(() -> new UsernameNotFoundException("Пользователь с логином " + username + " не найден"));
		
		List<SimpleGrantedAuthority> authorities = List.of(
			new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
		);
		
		return new org.springframework.security.core.userdetails.User(
			user.getUsername(),
			user.getPasswordHash(),
			authorities
		);
	}

}
