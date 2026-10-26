package ru.tizer1908.vkr.eam_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.AssetTypeDto;
import ru.tizer1908.vkr.eam_system.model.AssetType;
import ru.tizer1908.vkr.eam_system.repository.AssetTypeRepository;
import ru.tizer1908.vkr.eam_system.service.AssetTypeService;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor 
@CrossOrigin(origins = "http://localhost:5173") 
public class DictionaryController {
	
	private final AssetTypeService assetTypeService;
	
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
    @ResponseStatus(HttpStatus.NO_CONTENT) // 
    public void deleteAssetType(@PathVariable Long id) {
    	assetTypeService.deleteAssetType(id);
    }
}
