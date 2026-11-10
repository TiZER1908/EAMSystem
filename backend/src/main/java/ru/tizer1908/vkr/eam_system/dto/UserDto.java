package ru.tizer1908.vkr.eam_system.dto;

import java.time.LocalDateTime;

import lombok.Data;
import ru.tizer1908.vkr.eam_system.model.UserRole;
import ru.tizer1908.vkr.eam_system.model.UserStatus;

@Data
public class UserDto {
	private Long id;
	private String username;
	private String email;
	private String password;
	private String lastName;
	private String firstName;
	private String middleName;
	private String phone;
	private UserRole role;
	private UserStatus status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
}
