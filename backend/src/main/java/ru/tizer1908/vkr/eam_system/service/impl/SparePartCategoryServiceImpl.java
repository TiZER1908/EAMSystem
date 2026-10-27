package ru.tizer1908.vkr.eam_system.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.SparePartCategoryDto;
import ru.tizer1908.vkr.eam_system.model.SparePartCategory;
import ru.tizer1908.vkr.eam_system.repository.SparePartCategoryRepository;
import ru.tizer1908.vkr.eam_system.service.SparePartCategoryService;

@Service
@RequiredArgsConstructor
public class SparePartCategoryServiceImpl implements SparePartCategoryService {

	private final SparePartCategoryRepository repository;
	
	@Override
	public List<SparePartCategory> getAllSparePartCategories() {
		return repository.findAll();
	}

	@Override
	public SparePartCategory createSparePartCategory(SparePartCategoryDto dto) {
		SparePartCategory sparePartCategory = new SparePartCategory();
		sparePartCategory.setName(dto.getName());
		return repository.save(sparePartCategory);
	}

	@Override
	public SparePartCategory updateSparePartCategory(Long id, SparePartCategoryDto dto) {
		SparePartCategory sparePartCategory = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Тип запчасти не найден"));
		sparePartCategory.setName(dto.getName());
		return repository.save(sparePartCategory);
	}

	@Override
	public void deleteSparePartCategory(Long id) {
		repository.deleteById(id);
	}

}
