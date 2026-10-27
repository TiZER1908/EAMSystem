package ru.tizer1908.vkr.eam_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.AssetTypeDto;
import ru.tizer1908.vkr.eam_system.dto.LocationDto;
import ru.tizer1908.vkr.eam_system.dto.LocationViewDto;
import ru.tizer1908.vkr.eam_system.dto.SparePartCategoryDto;
import ru.tizer1908.vkr.eam_system.dto.UnitDto;
import ru.tizer1908.vkr.eam_system.model.AssetType;
import ru.tizer1908.vkr.eam_system.model.Location;
import ru.tizer1908.vkr.eam_system.model.SparePartCategory;
import ru.tizer1908.vkr.eam_system.model.Unit;
import ru.tizer1908.vkr.eam_system.service.AssetTypeService;
import ru.tizer1908.vkr.eam_system.service.LocationService;
import ru.tizer1908.vkr.eam_system.service.SparePartCategoryService;
import ru.tizer1908.vkr.eam_system.service.UnitService;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor 
@CrossOrigin(origins = "http://localhost:5173") 
public class DictionaryController {
	
	private final AssetTypeService assetTypeService;
	private final LocationService locationService;
	private final SparePartCategoryService sparePartCategoryService;
	private final UnitService unitService;
	
    @GetMapping("/asset-types")
    public List<AssetType> getAssetTypes() {
        return assetTypeService.getAllAssetTypes();
    }
    @PostMapping("/asset-types")
    public AssetType createAssetType(@RequestBody AssetTypeDto assetTypeDto) {
    	return assetTypeService.createAssetType(assetTypeDto); 
    }
    @PutMapping("/asset-types/{id}")
    public AssetType updateAssetType(@PathVariable Long id, @RequestBody AssetTypeDto assetTypeDto) {
        return assetTypeService.updateAssetType(id, assetTypeDto);
    }
    @DeleteMapping("/asset-types/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) 
    public void deleteAssetType(@PathVariable Long id) {
    	assetTypeService.deleteAssetType(id);
    }
    
    @GetMapping("/locations")
    public List<LocationViewDto> getLocations() {
        return locationService.getAllLocations();
    }
    @PostMapping("/locations")
    public Location createLocation(@RequestBody LocationDto locationDto) {
    	return locationService.createLocation(locationDto); 
    }
    @PutMapping("/locations/{id}")
    public Location updateLocation(@PathVariable Long id, @RequestBody LocationDto locationDto) {
        return locationService.updateLocation(id, locationDto);
    }
    @DeleteMapping("/locations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) 
    public void deleteLocation(@PathVariable Long id) {
    	locationService.deleteLocation(id);
    }
    
    @GetMapping("/spare-part-categories")
    public List<SparePartCategory> getSparePartCategories() {
        return sparePartCategoryService.getAllSparePartCategories();
    }
    @PostMapping("/spare-part-categories")
    public SparePartCategory createSparePartCategory(@RequestBody SparePartCategoryDto sparePartCategoryDto) {
    	return sparePartCategoryService.createSparePartCategory(sparePartCategoryDto); 
    }
    @PutMapping("/spare-part-categories/{id}")
    public SparePartCategory updateSparePartCategory(@PathVariable Long id, @RequestBody SparePartCategoryDto sparePartCategoryDto) {
        return sparePartCategoryService.updateSparePartCategory(id, sparePartCategoryDto);
    }
    @DeleteMapping("/spare-part-categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSparePartCategory(@PathVariable Long id) {
    	sparePartCategoryService.deleteSparePartCategory(id);
    }
    
    @GetMapping("/units")
    public List<Unit> getUnits() {
        return unitService.getAllUnits();
    }
    @PostMapping("/units")
    public Unit createUnit(@RequestBody UnitDto unitDto) {
    	return unitService.createUnit(unitDto); 
    }
    @PutMapping("/units/{id}")
    public Unit updateUnit(@PathVariable Long id, @RequestBody UnitDto unitDto) {
        return unitService.updateUnit(id, unitDto);
    }
    @DeleteMapping("/units/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) 
    public void deleteUnit(@PathVariable Long id) {
    	unitService.deleteUnit(id);
    }
    
    
}
