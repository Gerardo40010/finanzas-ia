# 💰 Finanzas IA - Gestor de Finanzas Personales con Asistente Inteligente

## 📋 Descripción

Aplicación web para gestión de finanzas personales que integra **Inteligencia Artificial** para analizar patrones de gasto, generar recomendaciones personalizadas y predecir gastos futuros.

**Línea de producto:** Aplicaciones web y móviles con IA integrada  
**Metodología:** Extreme Programming (XP)  
**Tecnologías:** React + TypeScript, Node.js + Express, SQLite

---

## ✨ Características

- 📊 Dashboard interactivo con estadísticas y gráficos
- 🤖 Asistente IA con recomendaciones personalizadas
- 📝 CRUD completo de transacciones (ingresos/gastos)
- 🔍 Filtros avanzados por tipo, categoría y fechas
- 📎 Exportar transacciones a CSV
- 🌓 Modo oscuro/claro
- 📱 Diseño responsive

---

## 📦 Componentes Reutilizables

| Componente | Tipo | Descripción |
|------------|------|-------------|
| `InputField` | UI | Campo de formulario con validación |
| `Modal` | UI | Ventana emergente reutilizable |
| `TransactionCard` | UI | Tarjeta para mostrar transacciones |
| `useLocalStorage` | Hook | Persistencia de datos local |
| `formatCurrency` | Utilidad | Formateo de moneda a Bolivianos |

---

## 🛠️ Instalación y Ejecución

### Requisitos
- Node.js (v16 o superior)

### Backend

```bash
cd backend
npm install
npm run dev