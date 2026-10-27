package ru.tizer1908.vkr.eam_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ru.tizer1908.vkr.eam_system.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

}
