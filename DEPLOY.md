# NotaFlow — Guía de despliegue a producción

## Resumen
| Servicio | Para qué | Precio aprox. |
|----------|----------|---------------|
| Supabase | Base de datos + Auth + RLS | Gratis hasta 500 MB |
| Vercel | Hosting + HTTPS + CDN | Gratis (hobby) o ~$20/mes pro |
| Dominio | notariaXXX.com | ~€10-15/año |
| Anthropic | IA del chatbot | ~$0.25 por 1.000 mensajes |

---

## PASO 1 — Supabase (base de datos + login)

1. Crear cuenta en **supabase.com**
2. New Project → nombre: `notaflow` → anotar la contraseña
3. Ir a **SQL Editor** y ejecutar en orden:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_seed.sql` (datos de demo, opcional)

4. Ir a **Settings → API** y copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

5. Crear el primer usuario (notario titular):
   - **Authentication → Users → Add user**
   - Email: `jordi@notariabarcelo.com`
   - Password: elegir segura
   - El trigger `handle_new_user` crea el perfil automáticamente con rol `oficial`
   
6. Cambiar el rol a `notario` en SQL Editor:
   ```sql
   UPDATE profiles SET role = 'notario' WHERE id = '<UUID del usuario>';
   ```

7. Para crear usuarios de gestorías:
   - Mismo proceso, dejar rol como `gestoria`
   - Asignar sus expedientes: `UPDATE expedientes SET gestoria_id = '<UUID>' WHERE id = 'EXP-...'`

---

## PASO 2 — Anthropic API Key (chatbot IA)

1. Ir a **console.anthropic.com → API Keys → Create Key**
2. Copiar la key → `ANTHROPIC_API_KEY`

---

## PASO 3 — Vercel (hosting)

1. Instalar Git si no está instalado, y subir el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "NotaFlow inicial"
   gh repo create notaflow --private --push --source=.
   ```

2. Ir a **vercel.com → New Project → Import** el repo de GitHub

3. En **Environment Variables** añadir las 4 variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY    = eyJ...
   ANTHROPIC_API_KEY            = sk-ant-...
   ```

4. **Deploy** — Vercel construye y despliega automáticamente (~2 min)

5. La URL de producción será algo como `notaflow-xxx.vercel.app`

---

## PASO 4 — Dominio propio + SSL

El SSL (HTTPS) lo gestiona Vercel automáticamente. Solo hay que apuntar el dominio:

1. Comprar dominio en Namecheap, Nominalia, etc. (ej: `notariabarcelo.es`)
2. En Vercel → proyecto → **Domains → Add domain** → escribir `notariabarcelo.es`
3. Vercel muestra los registros DNS que hay que añadir en el panel del registrador:
   ```
   Tipo A    @    76.76.19.61
   Tipo CNAME www  cname.vercel-dns.com
   ```
4. Esperar 5-30 min para propagación DNS
5. Vercel genera el certificado SSL automáticamente (Let's Encrypt)

---

## Estructura de roles

| Rol | Acceso |
|-----|--------|
| `notario` | Todo: leads, expedientes, agenda, facturas, usuarios |
| `oficial` | Leads, expedientes, agenda. Sin facturas ni gestión de usuarios |
| `gestoria` | Solo los expedientes donde `gestoria_id = su UUID`. Sin leads ni agenda |

---

## Desarrollo local

```bash
cd notaflow
npm install
cp .env.example .env.local
# Rellenar .env.local con las variables de Supabase y Anthropic
npm run dev
# Abrir http://localhost:3000
```

---

## Despliegues futuros

Cada `git push` a `main` redespliega automáticamente en Vercel en ~90 segundos.
