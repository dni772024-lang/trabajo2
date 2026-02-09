-- Crear tabla satellite_chips
CREATE TABLE IF NOT EXISTS satellite_chips (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Iridium', 'Inmarsat')),
    number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Prestado', 'Mantenimiento', 'Baja')),
    plan VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chips_number ON satellite_chips(number);
CREATE INDEX IF NOT EXISTS idx_chips_status ON satellite_chips(status);

-- Actualizar tabla loan_items
ALTER TABLE loan_items ADD COLUMN IF NOT EXISTS chip_id VARCHAR(50);
ALTER TABLE loan_items ADD COLUMN IF NOT EXISTS is_device_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE loan_items ADD COLUMN IF NOT EXISTS is_chip_returned BOOLEAN DEFAULT FALSE;

-- Agregar FK si no existe (el IF NOT EXISTS no funciona directo para constraints en todas las versiones, pero intentaremos bloques seguros o ignorar error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loan_items_chip_id_fkey') THEN
        ALTER TABLE loan_items ADD CONSTRAINT loan_items_chip_id_fkey FOREIGN KEY (chip_id) REFERENCES satellite_chips(id) ON DELETE SET NULL;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_loan_items_chip ON loan_items(chip_id);
