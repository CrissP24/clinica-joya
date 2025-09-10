Candy Hoppe - Sistema de Gestión Médica

Sistema completo de gestión para consultorios médicos desarrollado con React, TypeScript y shadcn/ui. Incluye gestión de pacientes, citas médicas, historiales clínicos, certificados médicos y más.

## 🏥 Características Principales

### 👥 Gestión de Usuarios y Roles
- **Administrador**: Gestión completa del sistema, usuarios y reportes
- **Doctor**: Gestión de pacientes, citas, historiales y certificados
- **Paciente**: Visualización de historial, agendamiento de citas y descarga de certificados

### 📋 Módulos Implementados

#### 🩺 Gestión de Pacientes
- Registro completo de pacientes con datos personales y médicos
- Historial clínico dinámico con signos vitales
- Antecedentes personales y familiares
- Alergias y enfermedades crónicas

#### 📅 Sistema de Citas Médicas
- Agendamiento de citas con disponibilidad en tiempo real
- Estados de cita: pendiente, confirmada, completada, cancelada
- Gestión de horarios por doctor
- Notificaciones automáticas

#### 📄 Historial Clínico
- Consultas médicas detalladas
- Signos vitales (presión arterial, frecuencia cardíaca, temperatura, etc.)
- Diagnósticos con códigos CIE-10
- Tratamientos y prescripciones
- Exámenes de laboratorio con archivos adjuntos

#### 📜 Certificados Médicos
- Generación de certificados en PDF
- Tipos: incapacidad, constancia, reposo, certificado médico general
- Firma digital simulada
- Descarga directa desde el navegador

#### 🔔 Sistema de Notificaciones
- Notificaciones en tiempo real
- Alertas de citas, certificados y exámenes
- Centro de notificaciones en el sidebar

#### 📊 Panel de Administración
- Estadísticas en tiempo real
- Gestión de usuarios del sistema
- Reportes de actividad
- Métricas de rendimiento

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - JavaScript con tipado estático
- **Vite** - Herramienta de construcción rápida
- **shadcn/ui** - Biblioteca de componentes moderna
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Enrutamiento del lado del cliente
- **Lucide React** - Iconos modernos
- **localStorage** - Persistencia de datos (preparado para migrar a base de datos)

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd clinica-joya
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abrir el navegador en:** `http://localhost:5173`

## 🔐 Usuarios de Prueba

El sistema incluye usuarios demo para probar todas las funcionalidades:

### Administrador
- **Email:** admin@clinica.com
- **Contraseña:** demo123

### Doctor
- **Email:** doctor@clinica.com
- **Contraseña:** demo123

### Paciente
- **Email:** paciente@email.com
- **Contraseña:** demo123

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   ├── layouts/               # Layouts de la aplicación
│   └── medical/               # Componentes específicos médicos
│       ├── ClinicalHistory.tsx
│       ├── AppointmentScheduler.tsx
│       ├── CertificateGenerator.tsx
│       └── Sidebar.tsx
├── contexts/
│   ├── AuthContext.tsx        # Contexto de autenticación
│   └── NotificationContext.tsx # Contexto de notificaciones
├── pages/
│   ├── dashboards/            # Paneles por rol
│   ├── doctor/                # Páginas del doctor
│   ├── admin/                 # Páginas del administrador
│   └── Login.tsx
├── services/
│   └── localStorageService.ts # Servicio de persistencia
├── hooks/                     # Hooks personalizados
└── lib/                       # Utilidades
```

## 🎨 Diseño y UX

### Colores Médicos
- **Azul primario**: Profesional y confiable
- **Verde**: Salud y bienestar
- **Blanco**: Limpieza y claridad
- **Grises suaves**: Neutralidad y elegancia

### Características de UX
- Interfaz intuitiva y accesible
- Navegación por pestañas organizada
- Notificaciones en tiempo real
- Responsive design
- Animaciones suaves y profesionales

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run preview      # Vista previa de la construcción
npm run lint         # Ejecutar ESLint
```

## 📊 Funcionalidades por Rol

### 👨‍⚕️ Doctor
- ✅ Gestión completa de pacientes
- ✅ Creación de historiales clínicos
- ✅ Gestión de citas médicas
- ✅ Generación de certificados médicos
- ✅ Registro de exámenes de laboratorio
- ✅ Dashboard con estadísticas

### 👤 Paciente
- ✅ Visualización del historial clínico
- ✅ Agendamiento de citas
- ✅ Cancelación de citas
- ✅ Descarga de certificados médicos
- ✅ Visualización de exámenes
- ✅ Panel personalizado

### 👨‍💼 Administrador
- ✅ Gestión de usuarios del sistema
- ✅ Reportes y estadísticas
- ✅ Monitoreo de actividad
- ✅ Dashboard administrativo
- ✅ Gestión de roles y permisos

## 🚀 Próximas Mejoras

- [ ] Integración con base de datos real
- [ ] Sistema de facturación
- [ ] Integración con laboratorios externos
- [ ] App móvil
- [ ] Sistema de recordatorios por SMS/Email
- [ ] Integración con sistemas de pago
- [ ] Reportes avanzados con gráficos
- [ ] Sistema de backup automático

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el sistema, contacta al equipo de desarrollo.

---

**MediClinic** - Sistema de Gestión Médica Profesional 🏥
