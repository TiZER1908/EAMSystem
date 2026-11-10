package ru.tizer1908.vkr.eam_system.dto;

import lombok.Data;

@Data
public class LoginResponse {
	
	private String token;
	
	public LoginResponse(String token) {
		this.token = token;
	}
}
