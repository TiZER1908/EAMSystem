package ru.tizer1908.vkr.eam_system.service;

import java.util.List;

import ru.tizer1908.vkr.eam_system.dto.SparePartCategoryDto;
import ru.tizer1908.vkr.eam_system.model.SparePartCategory;

public interface SparePartCategoryService {
	List<SparePartCategory> getAllSparePartCategories();
	SparePartCategory createSparePartCategory(SparePartCategoryDto dto);
	SparePartCategory updateSparePartCategory(Long id, SparePartCategoryDto dto);
    void deleteSparePartCategory(Long id);
}
