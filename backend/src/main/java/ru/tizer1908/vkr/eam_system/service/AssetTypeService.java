package ru.tizer1908.vkr.eam_system.service;

import java.util.List;

import ru.tizer1908.vkr.eam_system.dto.AssetTypeDto;
import ru.tizer1908.vkr.eam_system.model.AssetType;

public interface AssetTypeService {
	List<AssetType> getAllAssetTypes();
    AssetType createAssetType(AssetTypeDto dto);
    AssetType updateAssetType(Long id, AssetTypeDto assetTypeDto);
    void deleteAssetType(Long id);
}