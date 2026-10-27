package ru.tizer1908.vkr.eam_system.service;

import java.util.List;

import ru.tizer1908.vkr.eam_system.dto.LocationDto;
import ru.tizer1908.vkr.eam_system.dto.LocationViewDto;
import ru.tizer1908.vkr.eam_system.model.Location;

public interface LocationService {
	List<LocationViewDto> getAllLocations();
	Location createLocation(LocationDto dto);
	Location updateLocation(Long id, LocationDto dto);
    void deleteLocation(Long id);
	LocationViewDto mapToViewDto(Location location);
	
}
