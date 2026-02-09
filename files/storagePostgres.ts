// services/storagePostgres.ts
import Database from './database';
import { User, Employee, Equipment, Loan, EquipmentStatus, Category, Peripheral } from '../types';

export const storagePostgres = {
  // ==================== INICIALIZACIÓN ====================
  init: async () => {
    try {
      await Database.testConnection();
      console.log('Sistema de almacenamiento PostgreSQL inicializado');
    } catch (error) {
      console.error('Error al inicializar PostgreSQL:', error);
      throw error;
    }
  },

  // ==================== USUARIOS ====================
  getUsers: async (): Promise<User[]> => {
    try {
      const result = await Database.query(`
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
      await Database.query(`
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
      await Database.query(`
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
      await Database.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Nota: Esto debería manejarse con sesiones/tokens en producción
    // Por ahora, podrías usar sessionStorage o un estado global
    const userSession = sessionStorage.getItem('current_user');
    return userSession ? JSON.parse(userSession) : null;
  },

  setCurrentUser: async (user: User | null): Promise<void> => {
    if (user) {
      sessionStorage.setItem('current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('current_user');
    }
  },

  // ==================== EMPLEADOS ====================
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const result = await Database.query(`
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
      await Database.query(`
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
      await Database.query(`
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

  // ==================== EQUIPOS ====================
  getEquipment: async (): Promise<Equipment[]> => {
    try {
      const result = await Database.query(`
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

      // Obtener periféricos para cada equipo
      const equipment = result.rows;
      for (const eq of equipment) {
        if (eq.hasPeripherals) {
          const peripheralsResult = await Database.query(`
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
    try {
      await Database.transaction(async (client) => {
        // Insertar equipo
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

        // Insertar periféricos si existen
        if (equipment.hasPeripherals && equipment.peripherals.length > 0) {
          for (const peripheral of equipment.peripherals) {
            await client.query(`
              INSERT INTO equipment_peripherals (id, equipment_id, type, brand_model, specs)
              VALUES ($1, $2, $3, $4, $5)
            `, [peripheral.id, equipment.id, peripheral.type, peripheral.brandModel, peripheral.specs]);
          }
        }
      });
    } catch (error) {
      console.error('Error al agregar equipo:', error);
      throw error;
    }
  },

  updateEquipment: async (equipment: Equipment): Promise<void> => {
    try {
      await Database.transaction(async (client) => {
        // Actualizar equipo
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

        // Actualizar periféricos: eliminar y volver a insertar
        await client.query('DELETE FROM equipment_peripherals WHERE equipment_id = $1', [equipment.id]);
        
        if (equipment.hasPeripherals && equipment.peripherals.length > 0) {
          for (const peripheral of equipment.peripherals) {
            await client.query(`
              INSERT INTO equipment_peripherals (id, equipment_id, type, brand_model, specs)
              VALUES ($1, $2, $3, $4, $5)
            `, [peripheral.id, equipment.id, peripheral.type, peripheral.brandModel, peripheral.specs]);
          }
        }
      });
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  },

  // ==================== CATEGORÍAS ====================
  getCategories: async (): Promise<Category[]> => {
    try {
      const result = await Database.query(`
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
      const result = await Database.query(`
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

      // Obtener items de cada préstamo
      for (const loan of loans) {
        const itemsResult = await Database.query(`
          SELECT 
            equipment_id as "equipmentId", serial_number as "serialNumber",
            category, brand, model, chip_number as "chipNumber",
            exit_condition as "exitCondition", exit_observations as "exitObservations",
            accessories, return_condition as "returnCondition",
            return_observations as "returnObservations",
            return_accessories as "returnAccessories",
            requires_maintenance as "requiresMaintenance",
            maintenance_details as "maintenanceDetails"
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
    try {
      await Database.transaction(async (client) => {
        // Insertar préstamo
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

        // Insertar items del préstamo
        for (const item of loan.items) {
          await client.query(`
            INSERT INTO loan_items (
              loan_id, equipment_id, serial_number, category, brand, model,
              chip_number, exit_condition, exit_observations, accessories
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            loan.id, item.equipmentId, item.serialNumber, item.category,
            item.brand, item.model, item.chipNumber, item.exitCondition,
            item.exitObservations, JSON.stringify(item.accessories)
          ]);

          // Actualizar estado del equipo a "Prestado"
          await client.query(`
            UPDATE equipment SET status = $1 WHERE id = $2
          `, [EquipmentStatus.LOANED, item.equipmentId]);
        }
      });
    } catch (error) {
      console.error('Error al agregar préstamo:', error);
      throw error;
    }
  },

  finalizeReturn: async (loanId: string, returnData: Partial<Loan>): Promise<void> => {
    try {
      await Database.transaction(async (client) => {
        // Actualizar préstamo con información de retorno
        await client.query(`
          UPDATE loans SET
            status = 'returned',
            return_info = $2,
            signatures = $3
          WHERE id = $1
        `, [loanId, JSON.stringify(returnData.returnInfo), JSON.stringify(returnData.signatures)]);

        // Actualizar items del préstamo y estados de equipos
        if (returnData.items) {
          for (const item of returnData.items) {
            // Actualizar item del préstamo
            await client.query(`
              UPDATE loan_items SET
                return_condition = $2,
                return_observations = $3,
                return_accessories = $4,
                requires_maintenance = $5,
                maintenance_details = $6
              WHERE loan_id = $1 AND equipment_id = $7
            `, [
              loanId, item.returnCondition, item.returnObservations,
              JSON.stringify(item.returnAccessories), item.requiresMaintenance,
              item.maintenanceDetails, item.equipmentId
            ]);

            // Determinar nuevo estado del equipo
            let newStatus = EquipmentStatus.AVAILABLE;
            if (item.returnCondition === 'Dañado' || item.requiresMaintenance !== 'No') {
              newStatus = EquipmentStatus.MAINTENANCE;
            }

            // Actualizar estado del equipo
            await client.query(`
              UPDATE equipment SET status = $1 WHERE id = $2
            `, [newStatus, item.equipmentId]);
          }
        }
      });
    } catch (error) {
      console.error('Error al finalizar retorno:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================
  isUsernameAvailable: async (username: string, excludeId?: string): Promise<boolean> => {
    try {
      const query = excludeId
        ? 'SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER($1) AND id != $2'
        : 'SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER($1)';
      
      const params = excludeId ? [username, excludeId] : [username];
      const result = await Database.query(query, params);
      
      return parseInt(result.rows[0].count) === 0;
    } catch (error) {
      console.error('Error al verificar disponibilidad de usuario:', error);
      return false;
    }
  }
};

export default storagePostgres;
