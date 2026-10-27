package ru.tizer1908.vkr.eam_system.dto;

import lombok.Data;

@Data
public class LocationViewDto {
    private Long id;
    private String name;
    private String description;
    private Long parentLocationId; 
    private String parentLocationName; 
}
