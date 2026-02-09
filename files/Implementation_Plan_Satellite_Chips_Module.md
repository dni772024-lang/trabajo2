Implementation Plan - Satellite Chips Module
Goal Description
Implement a new module to manage Satellite Chips independently from devices. This includes a new inventory section for chips, the ability to assign chips dynamically during satellite phone loans, and handling partial returns (returning just the chip or just the phone).
User Review Required
IMPORTANT
This change introduces a new table satellite_chips, a new audit table chip_audit_log, and modifies the loan_items and loans tables.
DATA MIGRATION: Existing data in equipment.chip_number will be automatically migrated to the new satellite_chips table using the provided migration script. The loan status logic will be updated to support a new "Parcialmente Devuelto" status for partial returns.

Proposed Changes
Database Changes
[NEW] satellite_chips table
sqlCREATE TABLE satellite_chips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(50) NOT NULL, -- 'Iridium' or 'Inmarsat'
  number VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'Disponible', -- 'Disponible', 'Prestado', 'Mantenimiento', 'Baja'
  plan VARCHAR(100),
  compatible_with VARCHAR(200), -- Compatible device models
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER, -- FK to users (optional)
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_chip_number ON satellite_chips(number);
CREATE INDEX idx_chip_status ON satellite_chips(status);
[NEW] chip_audit_log table
sqlCREATE TABLE chip_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chip_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'assigned', 'returned', 'updated', 'status_changed'
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  loan_id INTEGER,
  changed_by INTEGER, -- FK to users
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (chip_id) REFERENCES satellite_chips(id),
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX idx_chip_audit_chip_id ON chip_audit_log(chip_id);
CREATE INDEX idx_chip_audit_loan_id ON chip_audit_log(loan_id);
[MODIFY] loan_items table
sqlALTER TABLE loan_items ADD COLUMN chip_id INTEGER;
ALTER TABLE loan_items ADD COLUMN is_chip_returned BOOLEAN DEFAULT 0;
ALTER TABLE loan_items ADD COLUMN is_device_returned BOOLEAN DEFAULT 0;
ALTER TABLE loan_items ADD COLUMN chip_returned_at TIMESTAMP;
ALTER TABLE loan_items ADD COLUMN device_returned_at TIMESTAMP;

ALTER TABLE loan_items ADD FOREIGN KEY (chip_id) REFERENCES satellite_chips(id);

CREATE INDEX idx_loan_items_chip_id ON loan_items(chip_id);
[MODIFY] loans table
sql-- Add new status option to support partial returns
-- Existing: 'Activo', 'Completado'
-- New: 'Parcialmente Devuelto'
-- Update status column to allow: 'Activo', 'Parcialmente Devuelto', 'Completado'
[MIGRATION] Data Migration Script
sql-- Step 1: Migrate existing chip numbers from equipment table
INSERT INTO satellite_chips (type, number, status, notes)
SELECT 
    CASE 
        WHEN UPPER(e.category) LIKE '%INMARSAT%' THEN 'Inmarsat'
        WHEN UPPER(e.category) LIKE '%IRIDIUM%' THEN 'Iridium'
        ELSE 'Inmarsat' -- default for satellite phones
    END as type,
    e.chip_number as number,
    CASE 
        WHEN e.status = 'Disponible' THEN 'Disponible'
        WHEN e.status = 'Prestado' THEN 'Prestado'
        ELSE 'Disponible'
    END as status,
    'Migrado automáticamente desde equipo S/N: ' || e.serial_number as notes
FROM equipment e
WHERE e.chip_number IS NOT NULL 
  AND e.chip_number != '' 
  AND e.chip_number != 'N/A'
  AND LOWER(e.type) = 'satelital';

-- Step 2: Link existing active loans with their chips
UPDATE loan_items 
SET chip_id = (
    SELECT sc.id 
    FROM satellite_chips sc
    JOIN equipment e ON e.chip_number = sc.number
    WHERE e.id = loan_items.equipment_id
    LIMIT 1
)
WHERE equipment_id IN (
    SELECT e.id FROM equipment e 
    WHERE e.chip_number IS NOT NULL 
      AND e.chip_number != '' 
      AND e.chip_number != 'N/A'
);

-- Step 3: Create audit log entries for migrated chips
INSERT INTO chip_audit_log (chip_id, action, new_status, notes, changed_at)
SELECT 
    id,
    'created',
    status,
    'Chip creado durante migración de datos',
    created_at
FROM satellite_chips
WHERE notes LIKE 'Migrado automáticamente%';

Backend (Node/Express + TypeScript)
[NEW] types.ts
typescript// Add new interface
interface SatelliteChip {
  id: number;
  type: 'Iridium' | 'Inmarsat';
  number: string;
  status: 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Baja';
  plan?: string;
  compatible_with?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
}

interface ChipAuditLog {
  id: number;
  chip_id: number;
  action: 'created' | 'assigned' | 'returned' | 'updated' | 'status_changed';
  previous_status?: string;
  new_status?: string;
  loan_id?: number;
  changed_by?: number;
  changed_at: Date;
  notes?: string;
}

// Update LoanItem interface
interface LoanItem {
  // ... existing fields
  chip_id?: number | null;
  is_chip_returned: boolean;
  is_device_returned: boolean;
  chip_returned_at?: Date | null;
  device_returned_at?: Date | null;
}

// Update Loan status type
type LoanStatus = 'Activo' | 'Parcialmente Devuelto' | 'Completado';
[MODIFY] server/storage.ts
Add new methods for Satellite Chips:
typescript// CRUD for Satellite Chips
async getSatelliteChips(filters?: { status?: string; type?: string }): Promise<SatelliteChip[]>
async getSatelliteChipById(id: number): Promise<SatelliteChip | null>
async addSatelliteChip(chipData: Omit<SatelliteChip, 'id' | 'created_at' | 'updated_at'>): Promise<SatelliteChip>
async updateSatelliteChip(id: number, chipData: Partial<SatelliteChip>): Promise<SatelliteChip>
async deleteSatelliteChip(id: number): Promise<void>

// Audit log
async addChipAuditLog(logData: Omit<ChipAuditLog, 'id' | 'changed_at'>): Promise<void>
async getChipAuditHistory(chipId: number): Promise<ChipAuditLog[]>
Update existing methods:
typescript// Update addLoan method
async addLoan(loanData) {
  // VALIDATION: Check chip availability and compatibility
  if (loanData.chipId) {
    const chip = await this.getSatelliteChipById(loanData.chipId);
    
    if (!chip) {
      throw new Error('Chip no encontrado');
    }
    
    if (chip.status !== 'Disponible') {
      throw new Error(`Chip no disponible. Estado actual: ${chip.status}`);
    }
    
    // Validate chip type matches equipment type
    const equipment = await this.getEquipmentById(loanData.equipmentId);
    if (equipment.type === 'Satelital') {
      const expectedChipType = equipment.category.includes('INMARSAT') ? 'Inmarsat' : 'Iridium';
      if (chip.type !== expectedChipType) {
        throw new Error(`Chip tipo ${chip.type} no compatible con equipo ${equipment.category}`);
      }
    }
    
    // Update chip status to 'Prestado'
    await this.updateSatelliteChip(chip.id, { status: 'Prestado', updated_at: new Date() });
    
    // Log in audit
    await this.addChipAuditLog({
      chip_id: chip.id,
      action: 'assigned',
      previous_status: 'Disponible',
      new_status: 'Prestado',
      loan_id: loanData.id,
      changed_by: loanData.created_by,
      notes: `Chip asignado al préstamo #${loanData.id}`
    });
  }
  
  // ... continue with loan creation
  // Set is_chip_returned and is_device_returned to false initially
}

// Update updateLoan method (for Returns)
async updateLoan(loanId: number, returnData: {
  itemId: number;
  returnDevice: boolean;
  returnChip: boolean;
  notes?: string;
  returned_by?: number;
}) {
  const item = await this.getLoanItem(returnData.itemId);
  
  if (!item) {
    throw new Error('Item de préstamo no encontrado');
  }
  
  // VALIDATION: Cannot return already returned items
  if (returnData.returnDevice && item.is_device_returned) {
    throw new Error('El dispositivo ya fue devuelto previamente');
  }
  
  if (returnData.returnChip && item.is_chip_returned) {
    throw new Error('El chip ya fue devuelto previamente');
  }
  
  // VALIDATION: Must return at least one item
  if (!returnData.returnDevice && !returnData.returnChip) {
    throw new Error('Debe devolver al menos un elemento (dispositivo o chip)');
  }
  
  const now = new Date();
  
  // Update device return status
  if (returnData.returnDevice) {
    await this.updateLoanItem(returnData.itemId, {
      is_device_returned: true,
      device_returned_at: now
    });
  }
  
  // Update chip return status and chip table
  if (returnData.returnChip && item.chip_id) {
    await this.updateLoanItem(returnData.itemId, {
      is_chip_returned: true,
      chip_returned_at: now
    });
    
    // Update chip status to 'Disponible'
    await this.updateSatelliteChip(item.chip_id, { 
      status: 'Disponible',
      updated_at: now 
    });
    
    // Log in audit
    await this.addChipAuditLog({
      chip_id: item.chip_id,
      action: 'returned',
      previous_status: 'Prestado',
      new_status: 'Disponible',
      loan_id: loanId,
      changed_by: returnData.returned_by,
      notes: returnData.notes || `Chip devuelto del préstamo #${loanId}`
    });
  }
  
  // Update overall loan status
  await this.updateLoanStatus(loanId);
}

// NEW: Helper method to determine loan status
async updateLoanStatus(loanId: number) {
  const items = await this.getLoanItems(loanId);
  
  const allReturned = items.every(item => {
    if (item.chip_id) {
      // Has chip: both must be returned
      return item.is_device_returned && item.is_chip_returned;
    } else {
      // No chip: only device needs to be returned
      return item.is_device_returned;
    }
  });
  
  const someReturned = items.some(item => 
    item.is_device_returned || item.is_chip_returned
  );
  
  let newStatus: LoanStatus;
  if (allReturned) {
    newStatus = 'Completado';
  } else if (someReturned) {
    newStatus = 'Parcialmente Devuelto';
  } else {
    newStatus = 'Activo';
  }
  
  await this.updateLoanField(loanId, 'status', newStatus);
}

// NEW: Edit loan (for fixing errors)
async editLoan(loanId: number, editData: {
  itemId: number;
  newChipId?: number | null;
  responsable?: string;
  fecha_estimada_devolucion?: Date;
  observaciones?: string;
  edited_by?: number;
  edit_reason: string;
}) {
  const item = await this.getLoanItem(editData.itemId);
  
  if (!item) {
    throw new Error('Item de préstamo no encontrado');
  }
  
  const changes: any = {};
  let auditNotes = `Préstamo editado. Razón: ${editData.edit_reason}. `;
  
  // Handle chip change
  if (editData.newChipId !== undefined) {
    // If changing from one chip to another or removing chip
    if (item.chip_id !== editData.newChipId) {
      
      // Release old chip
      if (item.chip_id) {
        await this.updateSatelliteChip(item.chip_id, { 
          status: 'Disponible',
          updated_at: new Date()
        });
        
        await this.addChipAuditLog({
          chip_id: item.chip_id,
          action: 'returned',
          previous_status: 'Prestado',
          new_status: 'Disponible',
          loan_id: loanId,
          changed_by: editData.edited_by,
          notes: `Chip liberado durante edición de préstamo`
        });
        
        auditNotes += `Chip anterior (ID: ${item.chip_id}) liberado. `;
      }
      
      // Assign new chip
      if (editData.newChipId) {
        const newChip = await this.getSatelliteChipById(editData.newChipId);
        
        if (!newChip) {
          throw new Error('Nuevo chip no encontrado');
        }
        
        if (newChip.status !== 'Disponible') {
          throw new Error(`Chip no disponible. Estado: ${newChip.status}`);
        }
        
        await this.updateSatelliteChip(editData.newChipId, { 
          status: 'Prestado',
          updated_at: new Date()
        });
        
        await this.addChipAuditLog({
          chip_id: editData.newChipId,
          action: 'assigned',
          previous_status: 'Disponible',
          new_status: 'Prestado',
          loan_id: loanId,
          changed_by: editData.edited_by,
          notes: `Chip asignado durante edición de préstamo`
        });
        
        auditNotes += `Nuevo chip asignado (ID: ${editData.newChipId}). `;
      } else {
        auditNotes += `Chip removido del préstamo. `;
      }
      
      changes.chip_id = editData.newChipId;
    }
  }
  
  // Update loan item
  await this.updateLoanItem(editData.itemId, changes);
  
  // Update loan-level fields if provided
  const loanUpdates: any = {};
  if (editData.responsable) loanUpdates.responsable = editData.responsable;
  if (editData.fecha_estimada_devolucion) loanUpdates.fecha_estimada_devolucion = editData.fecha_estimada_devolucion;
  if (editData.observaciones) loanUpdates.observaciones = editData.observaciones;
  
  if (Object.keys(loanUpdates).length > 0) {
    await this.updateLoanFields(loanId, loanUpdates);
  }
  
  // Log edit in general audit (if you have one) or notes
  // For now, we'll update loan notes
  const currentLoan = await this.getLoanById(loanId);
  const updatedNotes = `${currentLoan.observaciones || ''}\n[EDITADO ${new Date().toISOString()}]: ${auditNotes}`;
  await this.updateLoanFields(loanId, { observaciones: updatedNotes });
}

Frontend (React)
[NEW] pages/ChipsInventory.tsx
typescript// Complete CRUD interface for Satellite Chips
// Features:
// - List all chips with filters (status, type)
// - Add new chip
// - Edit existing chip
// - Delete chip (only if status = 'Disponible')
// - View chip history/audit log
// - Search by chip number
Key components:

Table with columns: Type, Number, Status, Plan, Compatible With, Actions
Filter dropdowns: Status, Type
Search bar: By number
Modal for Add/Edit chip form
Button to view audit history for each chip

[MODIFY] pages/Loans.tsx
In EquipmentSelector component:
typescript// Detect if selected equipment is Satelital
const isSatellite = selectedEquipment?.type === 'Satelital';

// State for chip selection
const [includeChip, setIncludeChip] = useState(false);
const [selectedChipId, setSelectedChipId] = useState<number | null>(null);
const [availableChips, setAvailableChips] = useState<SatelliteChip[]>([]);

// Fetch available chips when satellite equipment is selected
useEffect(() => {
  if (isSatellite && includeChip) {
    const chipType = selectedEquipment.category.includes('INMARSAT') ? 'Inmarsat' : 'Iridium';
    
    fetch(`/api/satellite-chips?status=Disponible&type=${chipType}`)
      .then(res => res.json())
      .then(chips => setAvailableChips(chips));
  }
}, [isSatellite, includeChip, selectedEquipment]);

// Render in form
{isSatellite && (
  <div className="chip-selection">
    <label>
      <input 
        type="checkbox"
        checked={includeChip}
        onChange={(e) => {
          setIncludeChip(e.target.checked);
          if (!e.target.checked) setSelectedChipId(null);
        }}
      />
      ¿Incluye Chip?
    </label>
    
    {includeChip && !availableChips.length && (
      <Alert variant="warning">
        ⚠️ No hay chips {selectedEquipment.category} disponibles
      </Alert>
    )}
    
    {includeChip && availableChips.length > 0 && (
      <>
        <label htmlFor="chip-select">Seleccionar Chip:</label>
        <select 
          id="chip-select"
          value={selectedChipId || ''}
          onChange={(e) => setSelectedChipId(Number(e.target.value))}
          required
        >
          <option value="">-- Seleccione un chip --</option>
          {availableChips.map(chip => (
            <option key={chip.id} value={chip.id}>
              {chip.type} #{chip.number} {chip.plan ? `(${chip.plan})` : ''}
            </option>
          ))}
        </select>
      </>
    )}
    
    {isSatellite && !includeChip && (
      <Alert variant="warning">
        ⚠️ Está prestando un teléfono satelital SIN chip.
        El equipo no podrá realizar llamadas.
      </Alert>
    )}
  </div>
)}
In handleSave (loan creation):
typescriptconst loanData = {
  // ... existing fields
  items: selectedEquipment.map(eq => ({
    equipment_id: eq.id,
    chip_id: eq.isSatellite ? selectedChipId : null,
    // other fields
  }))
};

// Submit to API
[MODIFY] pages/Returns.tsx / LoanViewer
In return modal:
typescript// State for partial returns
const [returnDevice, setReturnDevice] = useState(true);
const [returnChip, setReturnChip] = useState(true);

// Render return options
{item.chip_id && (
  <div className="partial-return-section">
    <h4>Devolución de elementos</h4>
    <p className="info-text">
      <strong>Este préstamo incluye chip satelital</strong><br/>
      Chip: {item.chip_number} ({item.chip_type})<br/>
      Puede devolver los elementos por separado
    </p>
    
    <div className="return-checkboxes">
      <label>
        <input 
          type="checkbox" 
          checked={returnDevice}
          onChange={(e) => setReturnDevice(e.target.checked)}
          disabled={item.is_device_returned}
        />
        {item.is_device_returned ? '✅ Teléfono devuelto' : '☑️ Devolver Teléfono'}
      </label>
      
      <label>
        <input 
          type="checkbox" 
          checked={returnChip}
          onChange={(e) => setReturnChip(e.target.checked)}
          disabled={item.is_chip_returned}
        />
        {item.is_chip_returned ? '✅ Chip devuelto' : '☑️ Devolver Chip'}
      </label>
    </div>
    
    {!returnDevice && !returnChip && (
      <Alert variant="error">
        ❌ Debe devolver al menos uno de los elementos
      </Alert>
    )}
    
    {(returnDevice !== returnChip) && (
      <Alert variant="info">
        ℹ️ Devolución parcial: el préstamo quedará en estado "Parcialmente Devuelto"
      </Alert>
    )}
  </div>
)}

// Handle submit
const handleReturn = async () => {
  await fetch(`/api/loans/${loanId}/return`, {
    method: 'POST',
    body: JSON.stringify({
      itemId: item.id,
      returnDevice,
      returnChip,
      notes: returnNotes,
      returned_by: currentUser.id
    })
  });
  
  // Refresh and show success
};
[NEW] pages/LoanEdit.tsx (or modal in Loans view)
typescript// Edit loan functionality
// Allow editing:
// - Chip assignment (change/add/remove)
// - Responsable
// - Fecha estimada de devolución
// - Observaciones

// Require:
// - Edit reason (text field, mandatory)

// Display warning if changing chip

Verification Plan
Automated Tests

None (current project structure doesn't have test runner setup)
Recommendation: Add basic integration tests in future sprint

Manual Verification
Pre-Implementation:

✅ Backup database before running migration script
✅ Review migration script - verify all existing chip numbers will be captured
✅ Test migration on copy - run on database copy first

Post-Migration:
4. ✅ Verify migrated data - check that all chips from equipment.chip_number appear in satellite_chips table
5. ✅ Verify links - check that active loans have correct chip_id references
Inventory Module:
6. ✅ Create chip - Add new Satellite Chip (Inmarsat #TEST123). Verify it appears in list with status 'Disponible'
7. ✅ Edit chip - Update chip plan and notes. Verify changes saved
8. ✅ Filter chips - Filter by Status='Disponible' and Type='Inmarsat'. Verify results
9. ✅ Search chip - Search by number. Verify found
10. ✅ Delete chip - Attempt to delete chip with status 'Prestado' → should fail. Delete chip with status 'Disponible' → should succeed
11. ✅ View audit - View audit history for a chip. Verify all actions logged
Loan Module:
12. ✅ Create loan with chip - Select Satellite Phone, check "Incluye Chip", select available chip, create loan. Verify:
- Loan created successfully
- Chip status changed to 'Prestado'
- loan_items.chip_id is populated
- Audit log entry created
13. ✅ Create loan without chip - Select Satellite Phone, uncheck "Incluye Chip", create loan. Verify warning shown and chip_id is NULL
14. ✅ Validation - unavailable chip - Attempt to assign a chip with status 'Mantenimiento' → should show error
15. ✅ Validation - incompatible chip - Attempt to assign Iridium chip to Inmarsat phone → should show error
16. ✅ Validation - duplicate assignment - Attempt to create second loan with same chip → should fail
Return Module:
17. ✅ Full return - Return both phone and chip. Verify:
- Both checkboxes marked as returned
- Chip status changed to 'Disponible'
- Loan status changed to 'Completado'
- Timestamps recorded
- Audit log entry created
18. ✅ Partial return - chip only - Return only chip, keep phone. Verify:
- is_chip_returned = true, is_device_returned = false
- Chip status = 'Disponible'
- Loan status = 'Parcialmente Devuelto'
19. ✅ Partial return - phone only - Return only phone, keep chip. Verify:
- is_device_returned = true, is_chip_returned = false
- Chip status = 'Prestado' (still on loan)
- Loan status = 'Parcialmente Devuelto'
20. ✅ Second partial return - After returning phone only, now return chip. Verify loan status changes to 'Completado'
21. ✅ Validation - double return - Attempt to return already returned chip → should show error
Edit Module:
22. ✅ Edit loan - add chip - Edit loan that was created without chip, add chip. Verify chip assigned and status updated
23. ✅ Edit loan - change chip - Edit loan with chip, change to different chip. Verify:
- Old chip released (status='Disponible')
- New chip assigned (status='Prestado')
- Both actions in audit log
24. ✅ Edit loan - remove chip - Edit loan with chip, remove chip. Verify chip released
25. ✅ Edit reason required - Attempt to edit without providing reason → should require reason field
Display & Status:
26. ✅ Loan list view - Verify loans with partial returns show correct status and visual indicator
27. ✅ Chip availability - Verify chip dropdown only shows chips with status='Disponible' and correct type
28. ✅ Audit trail - Review complete audit history for one chip through multiple loans. Verify all actions logged
Edge Cases:
29. ✅ Long chip number - Create chip with 20-character number. Verify no truncation
30. ✅ Special characters - Create chip with number containing hyphens or spaces. Verify proper handling

Rollback Plan
If critical issues are discovered post-deployment:

Database rollback:

sql   -- Remove new columns
   ALTER TABLE loan_items DROP COLUMN chip_id;
   ALTER TABLE loan_items DROP COLUMN is_chip_returned;
   ALTER TABLE loan_items DROP COLUMN is_device_returned;
   ALTER TABLE loan_items DROP COLUMN chip_returned_at;
   ALTER TABLE loan_items DROP COLUMN device_returned_at;
   
   -- Drop new tables
   DROP TABLE chip_audit_log;
   DROP TABLE satellite_chips;
   
   -- Restore from backup if needed

Code rollback: Revert to previous commit before chip module implementation
Data preservation: Export satellite_chips and chip_audit_log tables before dropping for potential recovery


Post-Implementation Tasks

✅ User training - Train staff on new chip management workflow
✅ Documentation - Update user manual with chip management procedures
✅ Monitoring - Monitor for 1 week after deployment for any issues
✅ Optimization - Add database indexes if query performance issues detected
✅ Future enhancement - Consider adding chip usage reports/analytics


Notes

Migration script should be reviewed by DBA/tech lead before execution
Consider scheduling deployment during low-usage hours
Have database backup ready before migration
All chip numbers must be unique - migration script includes validation for this
