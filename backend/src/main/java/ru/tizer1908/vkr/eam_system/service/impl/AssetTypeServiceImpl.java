package ru.tizer1908.vkr.eam_system.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.AssetTypeDto;
import ru.tizer1908.vkr.eam_system.model.AssetType;
import ru.tizer1908.vkr.eam_system.repository.AssetTypeRepository;
import ru.tizer1908.vkr.eam_system.service.AssetTypeService;

@Service 
@RequiredArgsConstructor
public class AssetTypeServiceImpl implements AssetTypeService {

	private final AssetTypeRepository repository;
	
	@Override 
	public List<AssetType> getAllAssetTypes(){
		return repository.findAll();
	}
	
	@Override
	public AssetType createAssetType(AssetTypeDto dto) {
		AssetType assetType = new AssetType();
		assetType.setName(dto.getName());
		assetType.setDescription(dto.getDescription());
        
        return repository.save(assetType);
	}

	@Override
	public AssetType updateAssetType(Long id, AssetTypeDto assetTypeDto) {
		AssetType assetType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тип оборудования не найден"));
		assetType.setName(assetTypeDto.getName());
		assetType.setDescription(assetTypeDto.getDescription());
		return repository.save(assetType);
	}

	@Override
	public void deleteAssetType(Long id) {
		repository.deleteById(id);
	}

}
