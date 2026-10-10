package ru.tizer_tgpa.vkr.eam_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ru.tizer_tgpa.vkr.eam_system.model.Asset;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
}
