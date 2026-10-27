package ru.tizer1908.vkr.eam_system.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.LocationDto;
import ru.tizer1908.vkr.eam_system.dto.LocationViewDto;
import ru.tizer1908.vkr.eam_system.model.Location;
import ru.tizer1908.vkr.eam_system.repository.LocationRepository;
import ru.tizer1908.vkr.eam_system.service.LocationService;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

	private final LocationRepository repository;
	
	@Override
	public List<LocationViewDto> getAllLocations() {
		return repository.findAll().stream()
	            .map(this::mapToViewDto) 
	            .collect(Collectors.toList());
	}

	@Override
	public Location createLocation(LocationDto dto) {
		Location location = new Location();
		location.setName(dto.getName());
		location.setDescription(dto.getDescription());
		
		if (dto.getParentLocationId() != null) {
	        Location parent = repository.findById(dto.getParentLocationId())
	                .orElseThrow(() -> new RuntimeException("Родительская локация не найдена"));
	        location.setParentLocation(parent);
		location.setDescription(dto.getDescription());
		} else {
	        location.setParentLocation(null);
	    }
		
		return repository.save(location);
	}

	@Override
	public Location updateLocation(Long id, LocationDto dto) {
		Location location = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Тип оборудования не найден"));
		
		location.setName(dto.getName());
		location.setDescription(dto.getDescription());
		
		if (dto.getParentLocationId() != null) {
	        Location parent = repository.findById(dto.getParentLocationId())
	                .orElseThrow(() -> new RuntimeException("Родительская локация не найдена"));
	        location.setParentLocation(parent);
		location.setDescription(dto.getDescription());
		} else {
	        location.setParentLocation(null);
	    }
		
		return repository.save(location);
	}

	@Override
	public void deleteLocation(Long id) {
		repository.deleteById(id);
	}
	
	@Override
	public LocationViewDto mapToViewDto(Location location) {
	    LocationViewDto dto = new LocationViewDto();
	    dto.setId(location.getId());
	    dto.setName(location.getName());
	    dto.setDescription(location.getDescription());
	    
	    if (location.getParentLocation() != null) {
	        dto.setParentLocationId(location.getParentLocation().getId());
	        dto.setParentLocationName(location.getParentLocation().getName());
	    }
	    
	    return dto;
	}

}
