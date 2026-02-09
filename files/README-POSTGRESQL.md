# Sistema de Control de Préstamos de Equipos

Sistema de gestión de inventario y préstamos de equipos con PostgreSQL.

## 🚀 Inicio Rápido

### 1. Instalar PostgreSQL
Sigue las instrucciones en `MIGRATION_GUIDE.md` según tu sistema operativo.

### 2. Crear la Base de Datos
```bash
psql -U postgres
CREATE DATABASE equipment_control;
\q
```

### 3. Ejecutar el Script SQL
```bash
psql -U postgres -d equipment_control -f database-schema.sql
```

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Configurar Variables de Entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 6. Probar la Conexión
```bash
npm run test:db
```

## 📁 Estructura de Archivos

```
controlfinal-main/
├── services/
│   ├── database.ts          # Servicio de conexión PostgreSQL
│   ├── storagePostgres.ts   # Servicio de almacenamiento con PostgreSQL
│   ├── storage.ts           # (Antiguo) Servicio con localStorage
│   └── gemini.ts            # Servicio de IA
├── database-schema.sql      # Script de creación de tablas
├── MIGRATION_GUIDE.md       # Guía detallada de migración
├── test-db.ts              # Script de prueba de conexión
├── .env.example            # Ejemplo de variables de entorno
└── package.json            # Dependencias del proyecto
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales:
- **users** - Usuarios del sistema
- **employees** - Empleados que solicitan préstamos
- **equipment** - Inventario de equipos
- **equipment_peripherals** - Periféricos asociados a equipos
- **categories** - Categorías de equipos
- **loans** - Registro de préstamos
- **loan_items** - Detalle de equipos en cada préstamo

## 🔐 Credenciales Iniciales

**Usuario Administrador:**
- Username: `admin.pro.001`
- Password: `Admin123`

⚠️ **IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer login.

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Base de Datos**: PostgreSQL
- **ORM/Query Builder**: node-postgres (pg)
- **UI**: Lucide React Icons

## 📊 Características

✅ Gestión de inventario de equipos
✅ Sistema de préstamos y devoluciones
✅ Control de usuarios y permisos
✅ Seguimiento de empleados
✅ Historial de transacciones
✅ Gestión de categorías
✅ Estados de equipos (Disponible, Prestado, Mantenimiento, etc.)

## 🧪 Testing

Para verificar que todo funciona correctamente:

```bash
# Probar conexión a la base de datos
npm run test:db
```

## 📝 Consultas SQL Útiles

### Ver equipos disponibles:
```sql
SELECT * FROM equipment WHERE status = 'Disponible';
```

### Ver préstamos activos:
```sql
SELECT l.*, e.name, e.last_name 
FROM loans l
JOIN employees e ON l.solicitante->>'placa' = e.badge_number
WHERE l.status = 'active';
```

### Equipos más prestados:
```sql
SELECT e.brand, e.model, COUNT(li.id) as veces_prestado
FROM equipment e
JOIN loan_items li ON e.id = li.equipment_id
GROUP BY e.id, e.brand, e.model
ORDER BY veces_prestado DESC
LIMIT 10;
```

## 🔄 Migración desde localStorage

Si estás migrando desde la versión con `localStorage`, consulta `MIGRATION_GUIDE.md` para instrucciones detalladas.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para problemas o preguntas:
- Revisa `MIGRATION_GUIDE.md`
- Ejecuta `npm run test:db` para diagnosticar problemas
- Verifica los logs de PostgreSQL

---

Desarrollado con ❤️ para SENAN
