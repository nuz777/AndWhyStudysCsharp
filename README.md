# AndWhy Studys • Apuntes y Notas de C# & .NET

Plataforma interactiva para documentar, estudiar y consultar apuntes y conceptos de C# y .NET, con flujo secuencial de bloques de texto y código, ventanas de previsualización estilo Fluent/Windows, filtrado por temas y prioridades, y persistencia en la nube para Vercel.

---

## 🔑 Credenciales de Acceso

- **Ruta del Panel:** `/panel`
- **Contraseña:** `ivanDavid2007`

---

## ☁️ Despliegue en Vercel y Sincronización en la Nube

Para que las notas que crees en tu computadora se guarden en la nube y puedas verlas y editarlas desde tu teléfono o cualquier otro dispositivo:

### Paso 1: Conectar Vercel Storage (1 Clic)
1. Ve a tu proyecto en el panel de [Vercel](https://vercel.com/dashboard).
2. Entra a la pestaña **Storage**.
3. Haz clic en **Create Database** y selecciona **KV** (o **Upstash Redis**). Ambos son 100% gratuitos.
4. Haz clic en **Connect to Project**. Vercel inyectará automáticamente las variables de entorno (`KV_REST_API_URL` y `KV_REST_API_TOKEN`).

### Paso 2: Desplegar
Haz tu commit/push a GitHub o ejecuta `vercel deploy`. Vercel detectará automáticamente:
- `vercel.json`: Reglas de reescritura para React Router y endpoints `/api/*`.
- `/api/data.ts`, `/api/notes.ts`, `/api/topics.ts`: Serverless Edge Functions de alta velocidad.

¡Listo! Al entrar a la web desplegada verás el botón verde **☁️ Nube Conectada**, y cualquier nota o tema que crees o edites estará sincronizado en tiempo real en todos tus dispositivos.

---

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar linter Oxlint
npm run lint

# Construir para producción
npm run build
```
