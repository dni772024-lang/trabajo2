-- Script de Creación de Base de Datos para Sistema de Préstamos de Equipos
-- PostgreSQL

-- Eliminar tablas si existen (en orden inverso por dependencias)
DROP TABLE IF EXISTS loan_items CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS equipment_peripherals CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- =============================================================================
-- TABLA: categories
-- =============================================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id VARCHAR(50),
    custom_fields JSONB DEFAULT '[]',
    require_approval BOOLEAN DEFAULT FALSE,
    max_loan_days INTEGER DEFAULT 30,
    is_critical BOOLEAN DEFAULT FALSE,
    maintenance_every_months INTEGER DEFAULT 12,
    tag_color VARCHAR(50),
    icon VARCHAR(50),
    prefix VARCHAR(20),
    sub_categories JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Índices para categories
CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- =============================================================================
-- TABLA: users
-- =============================================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    rank VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    institutional_email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Supervisor', 'Operador', 'Consulta')),
    permissions JSONB DEFAULT '[]',
    accessible_modules JSONB DEFAULT '[]',
    session_expiration VARCHAR(20) DEFAULT '8h' CHECK (session_expiration IN ('1h', '8h', '24h', 'Permanente')),
    ip_restriction VARCHAR(100),
    require_password_change BOOLEAN DEFAULT FALSE,
    auto_lock BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'Activo' CHECK (status IN ('Activo', 'Suspendido')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(institutional_email);
CREATE INDEX idx_users_badge ON users(badge_number);
CREATE INDEX idx_users_status ON users(status);

-- =============================================================================
-- TABLA: employees
-- =============================================================================
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    rank VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    unit VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    institutional_email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    photo TEXT,
    supervisor_id VARCHAR(50),
    physical_location VARCHAR(200),
    observations TEXT,
    loan_limit INTEGER DEFAULT 3,
    critical_access BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'Básico' CHECK (access_level IN ('Básico', 'Intermedio', 'Avanzado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Índices para employees
CREATE INDEX idx_employees_badge ON employees(badge_number);
CREATE INDEX idx_employees_email ON employees(institutional_email);
CREATE INDEX idx_employees_unit ON employees(unit);
CREATE INDEX idx_employees_supervisor ON employees(supervisor_id);

-- =============================================================================
-- TABLA: equipment
-- =============================================================================
CREATE TABLE equipment (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    internal_id VARCHAR(100) NOT NULL UNIQUE,
    internal_label VARCHAR(100),
    color VARCHAR(50),
    features_list JSONB DEFAULT '[]',
    
    -- Detalle Hardware
    has_screen BOOLEAN DEFAULT FALSE,
    screen_details JSONB,
    has_keyboard BOOLEAN DEFAULT FALSE,
    keyboard_details JSONB,
    has_battery BOOLEAN DEFAULT FALSE,
    battery_details JSONB,
    
    -- Periféricos (se manejará en tabla separada)
    has_peripherals BOOLEAN DEFAULT FALSE,
    
    -- Adquisición
    purchase_date DATE,
    provider VARCHAR(200),
    invoice_number VARCHAR(100),
    initial_value DECIMAL(10, 2),
    warranty_until DATE,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Prestado', 'Mantenimiento', 'Retirado', 'Dañado')),
    condition VARCHAR(20) DEFAULT 'Excelente' CHECK (condition IN ('Excelente', 'Bueno', 'Regular', 'Malo')),
    location VARCHAR(200),
    responsible_id VARCHAR(50),
    photos JSONB DEFAULT '[]',
    chip_number VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsible_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Índices para equipment
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_internal_id ON equipment(internal_id);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_responsible ON equipment(responsible_id);

-- =============================================================================
-- TABLA: equipment_peripherals
-- =============================================================================
CREATE TABLE equipment_peripherals (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    brand_model VARCHAR(150) NOT NULL,
    specs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

-- Índices para equipment_peripherals
CREATE INDEX idx_peripherals_equipment ON equipment_peripherals(equipment_id);

-- =============================================================================
-- TABLA: loans
-- =============================================================================
CREATE TABLE loans (
    id VARCHAR(50) PRIMARY KEY,
    id_orden VARCHAR(100) NOT NULL UNIQUE,
    loan_date DATE NOT NULL,
    exit_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'cancelled')),
    
    -- Solicitante (JSON)
    solicitante JSONB NOT NULL,
    
    -- Responsable que entrega (JSON)
    entrega_responsable JSONB NOT NULL,
    
    -- Misión (JSON)
    mission JSONB NOT NULL,
    
    -- Retorno (JSON, opcional)
    return_info JSONB,
    
    -- Firmas (JSON con base64)
    signatures JSONB DEFAULT '{}',
    
    notes TEXT,
    liability_accepted BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para loans
CREATE INDEX idx_loans_orden ON loans(id_orden);
CREATE INDEX idx_loans_date ON loans(loan_date);
CREATE INDEX idx_loans_status ON loans(status);

-- =============================================================================
-- TABLA: satellite_chips
-- =============================================================================
CREATE TABLE satellite_chips (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Iridium', 'Inmarsat')),
    number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Prestado', 'Mantenimiento', 'Baja')),
    plan VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para satellite_chips
CREATE INDEX idx_chips_number ON satellite_chips(number);
CREATE INDEX idx_chips_status ON satellite_chips(status);

-- =============================================================================
-- TABLA: loan_items (Actualizada)
-- =============================================================================
CREATE TABLE loan_items (
    id SERIAL PRIMARY KEY,
    loan_id VARCHAR(50) NOT NULL,
    equipment_id VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    chip_number VARCHAR(100), -- Mantener por compatibilidad, pero usar chip_id preferiblemente
    
    -- Nuevo campo para relaciÃ³n con chips
    chip_id VARCHAR(50),

    -- Condición de salida
    exit_condition VARCHAR(50) DEFAULT 'Excelente' CHECK (exit_condition IN ('Excelente', 'Bueno', 'Regular', 'Con observaciones')),
    exit_observations TEXT,
    accessories JSONB DEFAULT '[]',
    
    -- Condición de retorno
    return_condition VARCHAR(50) CHECK (return_condition IN ('Excelente', 'Bueno', 'Regular', 'Dañado')),
    return_observations TEXT,
    return_accessories JSONB,
    requires_maintenance VARCHAR(50) CHECK (requires_maintenance IN ('No', 'Preventivo', 'Correctivo', 'Urgente')),
    maintenance_details TEXT,

    -- Control de devoluciones parciales
    is_device_returned BOOLEAN DEFAULT FALSE,
    is_chip_returned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,
    FOREIGN KEY (chip_id) REFERENCES satellite_chips(id) ON DELETE SET NULL
);

-- Índices para loan_items
CREATE INDEX idx_loan_items_loan ON loan_items(loan_id);
CREATE INDEX idx_loan_items_equipment ON loan_items(equipment_id);
CREATE INDEX idx_loan_items_chip ON loan_items(chip_id);

-- =============================================================================
-- TRIGGERS para actualizar updated_at
-- =============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_items_updated_at BEFORE UPDATE ON loan_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Insertar categorías iniciales
INSERT INTO categories (id, name, code, description, custom_fields, require_approval, max_loan_days, is_critical, maintenance_every_months, tag_color, icon, prefix, sub_categories) VALUES
('CAT-001', 'Computación', 'CAT-001', 'Computadoras, laptops, tablets', '[]', FALSE, 30, TRUE, 6, 'blue', 'Laptop', 'CMP', '["Laptop", "Desktop", "Tablet", "All-in-One", "Notebook"]'),
('CAT-005', 'Satelital', 'CAT-005', 'Monitores satelitales, terminales, antenas', '[]', TRUE, 10, TRUE, 6, 'purple', 'Satellite', 'SAT', '["Terminal Satelital", "Monitor Satelital", "Antena Satelital", "Teléfono Satelital", "Módem Satelital"]'),
('CAT-006', 'Navegación', 'CAT-006', 'GPS, trackers, navegadores', '[]', FALSE, 20, FALSE, 24, 'orange', 'Navigation', 'NAV', '["GPS Portátil", "GPS Vehicular", "Tracker Satelital", "Receptor GNSS"]');

-- Insertar usuario administrador inicial
INSERT INTO users (id, name, last_name, username, rank, badge_number, unit, institutional_email, password, role, permissions, accessible_modules, session_expiration, require_password_change, auto_lock, status) VALUES
('USR-' || REPLACE(gen_random_uuid()::text, '-', ''), 'Admin', 'Maestro', 'admin.pro.001', 'Oficial', '000', 'Centro de Control', 'admin.pro@sistema.com', 'Admin123', 'Administrador', '["all"]', '["Dashboard", "Inventario", "Préstamos", "Devoluciones", "Personal", "Configuración"]', '8h', FALSE, TRUE, 'Activo');

-- Insertar empleados de ejemplo
INSERT INTO employees (id, name, last_name, rank, badge_number, unit, department, position, hire_date, institutional_email, phone, loan_limit, critical_access, access_level) VALUES
('EMP-001', 'Javier', 'Solís', 'Capitán', '9088', 'Inteligencia', 'DNI', 'Analista Senior', '2015-06-01', 'j.solis@senan.gob.pa', '6677-8899', 5, TRUE, 'Avanzado'),
('EMP-002', 'Elena', 'Martínez', 'Teniente', '7765', 'Comunicaciones', 'DNI', 'Operador BGAN', '2018-02-15', 'e.martinez@senan.gob.pa', '6554-3322', 3, FALSE, 'Intermedio'),
('EMP-003', 'Carlos', 'Ruiz', 'Sargento Primero', '5541', 'Operaciones', 'DNI', 'Táctico de Campo', '2010-10-10', 'c.ruiz@senan.gob.pa', '6611-0099', 3, TRUE, 'Avanzado'),
('EMP-004', 'Ana', 'Vega', 'Agente', '3321', 'Administración', 'DNI', 'Auxiliar Técnico', '2022-01-05', 'a.vega@senan.gob.pa', '6445-5566', 2, FALSE, 'Básico');

-- Insertar equipos de ejemplo
INSERT INTO equipment (id, category, sub_category, brand, model, serial_number, internal_id, internal_label, color, features_list, has_screen, screen_details, has_keyboard, keyboard_details, has_battery, battery_details, has_peripherals, purchase_date, provider, invoice_number, initial_value, warranty_until, status, condition, location, photos) VALUES
('EQ-001', 'Computación', 'Laptop', 'Dell', 'Latitude 5420', '5XJ8K93', 'INV-2024-001', 'DNI-LAP-01', 'Gris Plata', '["16GB RAM", "512GB SSD"]', TRUE, '{"brand": "Dell", "model": "FHD 14", "serial": "SN-SCR-1", "specs": "1920x1080"}', TRUE, '{"brand": "Dell", "model": "Backlit", "serial": "N/A", "language": "Español"}', TRUE, '{"brand": "Dell", "model": "Lithium", "serial": "BAT-01", "capacity": "63Wh"}', TRUE, '2024-01-15', 'Dell Panama', 'FAC-9901', 1200.00, '2026-01-15', 'Disponible', 'Excelente', 'Almacén', '[]'),
('EQ-002', 'Computación', 'Desktop', 'HP', 'ProDesk 600 G6', 'MXL12345', 'INV-2024-002', NULL, 'Negro', '["Intel i7", "1TB HDD"]', FALSE, NULL, FALSE, NULL, FALSE, NULL, TRUE, '2023-11-20', 'HP Store', 'FAC-8822', 850.00, '2025-11-20', 'Disponible', 'Bueno', 'Oficina 101', '[]'),
('EQ-003', 'Navegación', 'GPS Portátil', 'Garmin', 'Montana 700i', 'GRM-88229', 'INV-2024-003', NULL, 'Negro/Verde', '["InReach Technology", "TopoActive Maps"]', TRUE, '{"brand": "Garmin", "model": "5 inch Touch", "serial": "G-SCR-99", "specs": "Dual Orientation"}', FALSE, NULL, TRUE, '{"brand": "Garmin", "model": "Li-ion", "serial": "GBAT-01", "capacity": "18h duration"}', TRUE, '2024-02-10', 'Outdoor World', 'FAC-0012', 600.00, '2025-02-10', 'Disponible', 'Excelente', 'Laboratorio', '[]');

-- Insertar periféricos para los equipos
INSERT INTO equipment_peripherals (id, equipment_id, type, brand_model, specs) VALUES
('PER-001', 'EQ-001', 'Cargador AC', 'Dell 65W', 'USB-C'),
('PER-002', 'EQ-002', 'Cable Poder', 'HP Universal', '1.8m'),
('PER-003', 'EQ-002', 'Mouse', 'HP Optical', 'USB'),
('PER-004', 'EQ-002', 'Teclado', 'HP Slim', 'USB'),
('PER-005', 'EQ-003', 'Cable USB', 'MicroUSB', 'Carga/Datos');

-- =============================================================================
-- COMENTARIOS EN LAS TABLAS
-- =============================================================================
COMMENT ON TABLE categories IS 'Categorías de equipos y sus configuraciones';
COMMENT ON TABLE users IS 'Usuarios del sistema con permisos de acceso';
COMMENT ON TABLE employees IS 'Empleados que pueden solicitar préstamos';
COMMENT ON TABLE equipment IS 'Inventario de equipos disponibles';
COMMENT ON TABLE equipment_peripherals IS 'Periféricos asociados a cada equipo';
COMMENT ON TABLE loans IS 'Registro de préstamos de equipos';
COMMENT ON TABLE loan_items IS 'Detalle de equipos incluidos en cada préstamo';

-- Fin del script
