package ru.tizer_tgpa.vkr.eam_system.model;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "assets")
@Data
public class Asset {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(nullable = false)
    private String name;
	
	@Column(name = "serial_number")
    private String serialNumber;
}
