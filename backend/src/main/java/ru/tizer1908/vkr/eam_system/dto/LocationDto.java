package ru.tizer1908.vkr.eam_system.dto;

import lombok.Data;

@Data
public class LocationDto {
	private Long id;
	private String name;
	private Long parentLocationId;
	private String description;
}
