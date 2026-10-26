package ru.tizer1908.vkr.eam_system.repository;

import ru.tizer1908.vkr.eam_system.model.AssetType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetTypeRepository extends JpaRepository<AssetType, Long> {

}
