package ru.tizer1908.vkr.eam_system.service.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.model.User;
import ru.tizer1908.vkr.eam_system.repository.UserRepository;
import ru.tizer1908.vkr.eam_system.service.UserService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository repository;
	
	@Override
	public Optional<User> findByUsername(String username) {
		 return repository.findByUsername(username);
	}

}
