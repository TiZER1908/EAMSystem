package ru.tizer1908.vkr.eam_system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@MappedSuperclass
public class BaseEntity {
	
	@Column(name = "is_deleted", nullable = false)
	private Boolean isDeleted = false;
	
	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;
	
	@Column (name = "deleted_by")
	private Long deletedBy;
	
}
