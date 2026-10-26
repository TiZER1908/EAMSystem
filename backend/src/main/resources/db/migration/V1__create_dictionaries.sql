CREATE TABLE asset_types (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	description TEXT
);

CREATE TABLE locations (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	parent_location_id BIGINT,
	description TEXT,
	CONSTRAINT fk_locations_parent 
        FOREIGN KEY (parent_location_id) 
        REFERENCES locations (id)
        ON DELETE SET NULL
        
);

CREATE TABLE spare_part_categories (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE units (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE,
	short_name VARCHAR(10) NOT NULL
)
