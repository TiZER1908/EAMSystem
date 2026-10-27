package ru.tizer1908.vkr.eam_system.service;

import java.util.List;

import ru.tizer1908.vkr.eam_system.dto.UnitDto;
import ru.tizer1908.vkr.eam_system.model.Unit;

public interface UnitService {
	List<Unit> getAllUnits();
	Unit createUnit(UnitDto dto);
	Unit updateUnit(Long id, UnitDto dto);
    void deleteUnit(Long id);
}
