package ru.tizer1908.vkr.eam_system.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "asset_types")
@Data
public class AssetType {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, unique = true, length = 100)
	private String name;
	
	@Column(columnDefinition = "TEXT")
	private String description;
}
