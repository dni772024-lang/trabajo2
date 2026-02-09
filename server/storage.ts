import { pool } from './db.js';
import { User, Employee, Equipment, Loan, EquipmentStatus, Category, SatelliteChip } from '../types.js';

export const storage = {
    // ==================== INICIALIZACIÓN ====================
    init: async () => {
        try {
            // Just test connection
            const client = await pool.connect();
            client.release();
            console.log('Sistema de almacenamiento PostgreSQL inicializado');
        } catch (error) {
            console.error('Error al inicializar PostgreSQL:', error);
            throw error;
        }
    },

    // ==================== USUARIOS ====================
    getUsers: async (): Promise<User[]> => {
        try {
            const result = await pool.query(`
        SELECT 
          id, name, last_name as "lastName", username, rank, badge_number as "badgeNumber",
          unit, institutional_email as "institutionalEmail", phone, password, role,
          permissions, accessible_modules as "accessibleModules", 
          session_expiration as "sessionExpiration", ip_restriction as "ipRestriction",
          require_password_change as "requirePasswordChange", auto_lock as "autoLock",
          status, created_at as "createdAt"
        FROM users
        ORDER BY created_at DESC
      `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    },

    saveUser: async (user: User): Promise<void> => {
        try {
            await pool.query(`
        INSERT INTO users (
          id, name, last_name, username, rank, badge_number, unit,
          institutional_email, phone, password, role, permissions,
          accessible_modules, session_expiration, ip_restriction,
          require_password_change, auto_lock, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
                user.id, user.name, user.lastName, user.username, user.rank,
                user.badgeNumber, user.unit, user.institutionalEmail, user.phone,
                user.password, user.role, JSON.stringify(user.permissions),
                JSON.stringify(user.accessibleModules), user.sessionExpiration,
                user.ipRestriction, user.requirePasswordChange, user.autoLock, user.status
            ]);
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            throw error;
        }
    },

    updateUser: async (user: User): Promise<void> => {
        try {
            await pool.query(`
        UPDATE users SET
          name = $2, last_name = $3, username = $4, rank = $5,
          badge_number = $6, unit = $7, institutional_email = $8,
          phone = $9, password = $10, role = $11, permissions = $12,
          accessible_modules = $13, session_expiration = $14,
          ip_restriction = $15, require_password_change = $16,
          auto_lock = $17, status = $18
        WHERE id = $1
      `, [
                user.id, user.name, user.lastName, user.username, user.rank,
                user.badgeNumber, user.unit, user.institutionalEmail, user.phone,
                user.password, user.role, JSON.stringify(user.permissions),
                JSON.stringify(user.accessibleModules), user.sessionExpiration,
                user.ipRestriction, user.requirePasswordChange, user.autoLock, user.status
            ]);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    deleteUser: async (id: string): Promise<void> => {
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    },

    // ==================== EMPLEADOS ====================
    getEmployees: async (): Promise<Employee[]> => {
        try {
            const result = await pool.query(`
        SELECT 
          id, name, last_name as "lastName", rank, badge_number as "badgeNumber",
          unit, department, position, hire_date as "hireDate",
          institutional_email as "institutionalEmail", phone, photo,
          supervisor_id as "supervisorId", physical_location as "physicalLocation",
          observations, loan_limit as "loanLimit", critical_access as "criticalAccess",
          access_level as "accessLevel", created_at as "createdAt"
        FROM employees
        ORDER BY created_at DESC
      `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            return [];
        }
    },

    addEmployee: async (employee: Employee): Promise<void> => {
        try {
            await pool.query(`
        INSERT INTO employees (
          id, name, last_name, rank, badge_number, unit, department,
          position, hire_date, institutional_email, phone, photo,
          supervisor_id, physical_location, observations, loan_limit,
          critical_access, access_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
                employee.id, employee.name, employee.lastName, employee.rank,
                employee.badgeNumber, employee.unit, employee.department,
                employee.position, employee.hireDate, employee.institutionalEmail,
                employee.phone, employee.photo, employee.supervisorId,
                employee.physicalLocation, employee.observations, employee.loanLimit,
                employee.criticalAccess, employee.accessLevel
            ]);
        } catch (error) {
            console.error('Error al agregar empleado:', error);
            throw error;
        }
    },

    updateEmployee: async (employee: Employee): Promise<void> => {
        try {
            await pool.query(`
        UPDATE employees SET
          name = $2, last_name = $3, rank = $4, badge_number = $5,
          unit = $6, department = $7, position = $8, hire_date = $9,
          institutional_email = $10, phone = $11, photo = $12,
          supervisor_id = $13, physical_location = $14, observations = $15,
          loan_limit = $16, critical_access = $17, access_level = $18
        WHERE id = $1
      `, [
                employee.id, employee.name, employee.lastName, employee.rank,
                employee.badgeNumber, employee.unit, employee.department,
                employee.position, employee.hireDate, employee.institutionalEmail,
                employee.phone, employee.photo, employee.supervisorId,
                employee.physicalLocation, employee.observations, employee.loanLimit,
                employee.criticalAccess, employee.accessLevel
            ]);
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            throw error;
        }
    },

    deleteEmployee: async (id: string): Promise<void> => {
        try {
            await pool.query('DELETE FROM employees WHERE id = $1', [id]);
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            throw error;
        }
    },

    // ==================== EQUIPOS ====================
    getEquipment: async (): Promise<Equipment[]> => {
        try {
            const result = await pool.query(`
        SELECT 
          e.id, e.category, e.sub_category as "subCategory", e.brand, e.model,
          e.serial_number as "serialNumber", e.internal_id as "internalId",
          e.internal_label as "internalLabel", e.color, e.features_list as "featuresList",
          e.has_screen as "hasScreen", e.screen_details as "screenDetails",
          e.has_keyboard as "hasKeyboard", e.keyboard_details as "keyboardDetails",
          e.has_battery as "hasBattery", e.battery_details as "batteryDetails",
          e.has_peripherals as "hasPeripherals", e.purchase_date as "purchaseDate",
          e.provider, e.invoice_number as "invoiceNumber", e.initial_value as "initialValue",
          e.warranty_until as "warrantyUntil", e.status, e.condition, e.location,
          e.responsible_id as "responsibleId", e.photos, e.chip_number as "chipNumber"
        FROM equipment e
        ORDER BY e.created_at DESC
      `);

            const equipment = result.rows;
            for (const eq of equipment) {
                if (eq.hasPeripherals) {
                    const peripheralsResult = await pool.query(`
            SELECT id, type, brand_model as "brandModel", specs
            FROM equipment_peripherals
            WHERE equipment_id = $1
          `, [eq.id]);
                    eq.peripherals = peripheralsResult.rows;
                } else {
                    eq.peripherals = [];
                }
            }

            return equipment;
        } catch (error) {
            console.error('Error al obtener equipos:', error);
            return [];
        }
    },

    addEquipment: async (equipment: Equipment): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
        INSERT INTO equipment (
          id, category, sub_category, brand, model, serial_number,
          internal_id, internal_label, color, features_list, has_screen,
          screen_details, has_keyboard, keyboard_details, has_battery,
          battery_details, has_peripherals, purchase_date, provider,
          invoice_number, initial_value, warranty_until, status,
          condition, location, responsible_id, photos, chip_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      `, [
                equipment.id, equipment.category, equipment.subCategory,
                equipment.brand, equipment.model, equipment.serialNumber,
                equipment.internalId, equipment.internalLabel, equipment.color,
                JSON.stringify(equipment.featuresList), equipment.hasScreen,
                JSON.stringify(equipment.screenDetails), equipment.hasKeyboard,
                JSON.stringify(equipment.keyboardDetails), equipment.hasBattery,
                JSON.stringify(equipment.batteryDetails), equipment.hasPeripherals,
                equipment.purchaseDate, equipment.provider, equipment.invoiceNumber,
                equipment.initialValue, equipment.warrantyUntil, equipment.status,
                equipment.condition, equipment.location, equipment.responsibleId,
                JSON.stringify(equipment.photos), equipment.chipNumber
            ]);

            if (equipment.hasPeripherals && equipment.peripherals.length > 0) {
                for (const peripheral of equipment.peripherals) {
                    await client.query(`
            INSERT INTO equipment_peripherals (id, equipment_id, type, brand_model, specs)
            VALUES ($1, $2, $3, $4, $5)
          `, [peripheral.id, equipment.id, peripheral.type, peripheral.brandModel, peripheral.specs]);
                }
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al agregar equipo:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    updateEquipment: async (equipment: Equipment): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
          UPDATE equipment SET
            category = $2, sub_category = $3, brand = $4, model = $5,
            serial_number = $6, internal_id = $7, internal_label = $8,
            color = $9, features_list = $10, has_screen = $11,
            screen_details = $12, has_keyboard = $13, keyboard_details = $14,
            has_battery = $15, battery_details = $16, has_peripherals = $17,
            purchase_date = $18, provider = $19, invoice_number = $20,
            initial_value = $21, warranty_until = $22, status = $23,
            condition = $24, location = $25, responsible_id = $26,
            photos = $27, chip_number = $28
          WHERE id = $1
        `, [
                equipment.id, equipment.category, equipment.subCategory,
                equipment.brand, equipment.model, equipment.serialNumber,
                equipment.internalId, equipment.internalLabel, equipment.color,
                JSON.stringify(equipment.featuresList), equipment.hasScreen,
                JSON.stringify(equipment.screenDetails), equipment.hasKeyboard,
                JSON.stringify(equipment.keyboardDetails), equipment.hasBattery,
                JSON.stringify(equipment.batteryDetails), equipment.hasPeripherals,
                equipment.purchaseDate, equipment.provider, equipment.invoiceNumber,
                equipment.initialValue, equipment.warrantyUntil, equipment.status,
                equipment.condition, equipment.location, equipment.responsibleId,
                JSON.stringify(equipment.photos), equipment.chipNumber
            ]);

            await client.query('DELETE FROM equipment_peripherals WHERE equipment_id = $1', [equipment.id]);

            if (equipment.hasPeripherals && equipment.peripherals.length > 0) {
                for (const peripheral of equipment.peripherals) {
                    await client.query(`
              INSERT INTO equipment_peripherals (id, equipment_id, type, brand_model, specs)
              VALUES ($1, $2, $3, $4, $5)
            `, [peripheral.id, equipment.id, peripheral.type, peripheral.brandModel, peripheral.specs]);
                }
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al actualizar equipo:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    deleteEquipment: async (id: string): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM equipment_peripherals WHERE equipment_id = $1', [id]);
            await client.query('DELETE FROM equipment WHERE id = $1', [id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al eliminar equipo:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    // ==================== CHIPS SATELITALES ====================
    getSatelliteChips: async (): Promise<SatelliteChip[]> => {
        try {
            const result = await pool.query('SELECT * FROM satellite_chips ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('Error al obtener chips:', error);
            return [];
        }
    },

    addSatelliteChip: async (chip: SatelliteChip): Promise<void> => {
        try {
            await pool.query(`
                INSERT INTO satellite_chips (id, type, number, status, plan, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [chip.id, chip.type, chip.number, chip.status, chip.plan, chip.notes]);
        } catch (error) {
            console.error('Error al agregar chip:', error);
            throw error;
        }
    },

    updateSatelliteChip: async (chip: SatelliteChip): Promise<void> => {
        try {
            await pool.query(`
                UPDATE satellite_chips SET
                    type = $2, number = $3, status = $4, plan = $5, notes = $6
                WHERE id = $1
            `, [chip.id, chip.type, chip.number, chip.status, chip.plan, chip.notes]);
        } catch (error) {
            console.error('Error al actualizar chip:', error);
            throw error;
        }
    },

    deleteSatelliteChip: async (id: string): Promise<void> => {
        try {
            await pool.query('DELETE FROM satellite_chips WHERE id = $1', [id]);
        } catch (error) {
            console.error('Error al eliminar chip:', error);
            throw error;
        }
    },

    // ==================== CATEGORÍAS ====================
    getCategories: async (): Promise<Category[]> => {
        try {
            const result = await pool.query(`
        SELECT 
          id, name, code, description, parent_id as "parentId",
          custom_fields as "customFields", require_approval as "requireApproval",
          max_loan_days as "maxLoanDays", is_critical as "isCritical",
          maintenance_every_months as "maintenanceEveryMonths",
          tag_color as "tagColor", icon, prefix, sub_categories as "subCategories"
        FROM categories
        ORDER BY name
      `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    },

    // ==================== PRÉSTAMOS ====================
    getLoans: async (): Promise<Loan[]> => {
        try {
            const result = await pool.query(`
        SELECT 
          l.id, l.id_orden as "idOrden", l.loan_date as "loanDate",
          l.exit_time as "exitTime", l.status, l.solicitante,
          l.entrega_responsable as "entregaResponsable", l.mission,
          l.return_info as "returnInfo", l.signatures, l.notes,
          l.liability_accepted as "liabilityAccepted"
        FROM loans l
        ORDER BY l.created_at DESC
      `);

            const loans = result.rows;

            for (const loan of loans) {
                const itemsResult = await pool.query(`
          SELECT 
            equipment_id as "equipmentId", serial_number as "serialNumber",
            category, brand, model, chip_number as "chipNumber", chip_id as "chipId",
            exit_condition as "exitCondition", exit_observations as "exitObservations",
            accessories, return_condition as "returnCondition",
            return_observations as "returnObservations",
            return_accessories as "returnAccessories",
            requires_maintenance as "requiresMaintenance",
            maintenance_details as "maintenanceDetails",
            is_device_returned as "isDeviceReturned",
            is_chip_returned as "isChipReturned"
          FROM loan_items
          WHERE loan_id = $1
        `, [loan.id]);
                loan.items = itemsResult.rows;
            }

            return loans;
        } catch (error) {
            console.error('Error al obtener préstamos:', error);
            return [];
        }
    },

    addLoan: async (loan: Loan): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
          INSERT INTO loans (
            id, id_orden, loan_date, exit_time, status, solicitante,
            entrega_responsable, mission, return_info, signatures,
            notes, liability_accepted
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
                loan.id, loan.idOrden, loan.loanDate, loan.exitTime,
                loan.status, JSON.stringify(loan.solicitante),
                JSON.stringify(loan.entregaResponsable), JSON.stringify(loan.mission),
                JSON.stringify(loan.returnInfo), JSON.stringify(loan.signatures),
                loan.notes, loan.liabilityAccepted
            ]);

            for (const item of loan.items) {
                await client.query(`
            INSERT INTO loan_items (
              loan_id, equipment_id, serial_number, category, brand, model,
              chip_number, chip_id, exit_condition, exit_observations, accessories
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
                    loan.id, item.equipmentId, item.serialNumber, item.category,
                    item.brand, item.model, item.chipNumber, item.chipId || null,
                    item.exitCondition, item.exitObservations, JSON.stringify(item.accessories)
                ]);

                await client.query(`
            UPDATE equipment SET status = $1 WHERE id = $2
          `, [EquipmentStatus.LOANED, item.equipmentId]);

                if (item.chipId) {
                    await client.query(`
                        UPDATE satellite_chips SET status = 'Prestado' WHERE id = $1
                     `, [item.chipId]);
                }
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al agregar préstamo:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    updateLoan: async (loan: Loan): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Update Loan Header
            await client.query(`
          UPDATE loans SET
            id_orden = $2, loan_date = $3, exit_time = $4, status = $5,
            solicitante = $6, entrega_responsable = $7, mission = $8,
            return_info = $9, signatures = $10, notes = $11, liability_accepted = $12
          WHERE id = $1
        `, [
                loan.id, loan.idOrden, loan.loanDate, loan.exitTime,
                loan.status, JSON.stringify(loan.solicitante),
                JSON.stringify(loan.entregaResponsable), JSON.stringify(loan.mission),
                JSON.stringify(loan.returnInfo), JSON.stringify(loan.signatures),
                loan.notes, loan.liabilityAccepted
            ]);

            // 2. Release currently assigned assets (from DB state)
            const currentItems = await client.query('SELECT * FROM loan_items WHERE loan_id = $1', [loan.id]);
            for (const item of currentItems.rows) {
                if (!item.is_device_returned) {
                    await client.query('UPDATE equipment SET status = $1 WHERE id = $2', ['Disponible', item.equipment_id]);
                }
                if (item.chip_id && !item.is_chip_returned) {
                    await client.query("UPDATE satellite_chips SET status = 'Disponible' WHERE id = $1", [item.chip_id]);
                }
            }

            // 3. Delete old items
            await client.query('DELETE FROM loan_items WHERE loan_id = $1', [loan.id]);

            // 4. Insert new items
            for (const item of loan.items) {
                await client.query(`
            INSERT INTO loan_items (
              loan_id, equipment_id, serial_number, category, brand, model,
              chip_number, chip_id, exit_condition, exit_observations, accessories,
              return_condition, return_observations, return_accessories,
              requires_maintenance, maintenance_details, is_device_returned, is_chip_returned
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
                    loan.id, item.equipmentId, item.serialNumber, item.category,
                    item.brand, item.model, item.chipNumber, item.chipId || null,
                    item.exitCondition, item.exitObservations, JSON.stringify(item.accessories),
                    item.returnCondition || null, item.returnObservations || '', JSON.stringify(item.returnAccessories || []),
                    item.requiresMaintenance || 'No', item.maintenanceDetails || '', item.isDeviceReturned || false, item.isChipReturned || false
                ]);

                // 5. Re-lock assets if not returned
                if (!item.isDeviceReturned) {
                    await client.query(`UPDATE equipment SET status = $1 WHERE id = $2`, [EquipmentStatus.LOANED, item.equipmentId]);
                }
                if (item.chipId && !item.isChipReturned) {
                    await client.query(`UPDATE satellite_chips SET status = 'Prestado' WHERE id = $1`, [item.chipId]);
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al actualizar préstamo:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    finalizeReturn: async (loanId: string, returnData: Partial<Loan>): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Actualizar items devueltos
            if (returnData.items) {
                for (const item of returnData.items) {
                    // Actualizar estado del item en el préstamo
                    await client.query(`
              UPDATE loan_items SET
                return_condition = $2,
                return_observations = $3,
                return_accessories = $4,
                requires_maintenance = $5,
                maintenance_details = $6,
                is_device_returned = $7,
                is_chip_returned = $8
              WHERE loan_id = $1 AND equipment_id = $9
            `, [
                        loanId, item.returnCondition, item.returnObservations,
                        JSON.stringify(item.returnAccessories), item.requiresMaintenance,
                        item.maintenanceDetails, item.isDeviceReturned, item.isChipReturned,
                        item.equipmentId
                    ]);

                    // 2. Gestionar Devolución del Equipo
                    if (item.isDeviceReturned) {
                        let newStatus = EquipmentStatus.AVAILABLE;
                        if (item.returnCondition === 'Dañado' || item.requiresMaintenance !== 'No') {
                            newStatus = EquipmentStatus.MAINTENANCE;
                        }
                        await client.query(`UPDATE equipment SET status = $1 WHERE id = $2`, [newStatus, item.equipmentId]);
                    }

                    // 3. Gestionar Devolución del Chip
                    if (item.isChipReturned && item.chipId) {
                        // Si el chip se devuelve, lo ponemos disponible, salvo que haya condición de daño (no especificado, asumimos disponible)
                        await client.query(`UPDATE satellite_chips SET status = 'Disponible' WHERE id = $1`, [item.chipId]);
                    }
                }
            }

            // 4. Verificar si todo el préstamo está concluido
            // Obtenemos todos los items del préstamo para verificar su estado
            const itemsCheck = await client.query(`
                SELECT equipment_id, chip_id, is_device_returned, is_chip_returned 
                FROM loan_items 
                WHERE loan_id = $1
            `, [loanId]);

            let allReturned = true;
            for (const row of itemsCheck.rows) {
                if (!row.is_device_returned) allReturned = false;
                // Si tiene chip y no se ha devuelto, entonces no está todo devuelto
                if (row.chip_id && !row.is_chip_returned) allReturned = false;
            }

            // 5. Actualizar estado del préstamo
            if (allReturned) {
                await client.query(`
                  UPDATE loans SET
                    status = 'returned',
                    return_info = $2,
                    signatures = $3
                  WHERE id = $1
                `, [loanId, JSON.stringify(returnData.returnInfo), JSON.stringify(returnData.signatures)]);
            } else {
                // Si es parcial, actualizamos info pero mantenemos estatus 'active' (o podríamos tener un estatus 'partial')
                // Por ahora mantenemos 'active' pero guardamos la info de retorno parcial
                await client.query(`
                  UPDATE loans SET
                    return_info = $2,
                    signatures = $3
                  WHERE id = $1
                `, [loanId, JSON.stringify(returnData.returnInfo), JSON.stringify(returnData.signatures)]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al finalizar retorno:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    isUsernameAvailable: async (username: string, excludeId?: string): Promise<boolean> => {
        try {
            const query = excludeId
                ? 'SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER($1) AND id != $2'
                : 'SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER($1)';

            const params = excludeId ? [username, excludeId] : [username];
            const result = await pool.query(query, params);

            return parseInt(result.rows[0].count) === 0;
        } catch (error) {
            console.error('Error al verificar disponibilidad de usuario:', error);
            return false;
        }
    }
};
