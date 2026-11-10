package ru.tizer1908.vkr.eam_system.service;

import java.util.Optional;

import ru.tizer1908.vkr.eam_system.model.User;

public interface UserService {
	Optional<User> findByUsername(String username);
}
