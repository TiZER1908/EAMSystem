package ru.tizer1908.vkr.eam_system.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.tizer1908.vkr.eam_system.dto.UnitDto;
import ru.tizer1908.vkr.eam_system.model.Unit;
import ru.tizer1908.vkr.eam_system.repository.UnitRepository;
import ru.tizer1908.vkr.eam_system.service.UnitService;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

	private final UnitRepository repository;
	
	@Override
	public List<Unit> getAllUnits() {
		return repository.findAll();
	}

	@Override
	public Unit createUnit(UnitDto dto) {
		Unit unit = new Unit();
		unit.setName(dto.getName());
		unit.setShortName(dto.getShortName());
		return repository.save(unit);
	}

	@Override
	public Unit updateUnit(Long id, UnitDto dto) {
		Unit unit = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Единица измерения не найдена"));
		unit.setName(dto.getName());
		unit.setShortName(dto.getShortName());
		return repository.save(unit);
	}

	@Override
	public void deleteUnit(Long id) {
		repository.deleteById(id);
	}

}
