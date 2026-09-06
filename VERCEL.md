# Vercel — frontend only
#
# 1. GitHub: push `3-26/frontend` (yoki butun repo, Root Directory = frontend)
# 2. Vercel → New Project → Import GitHub repo
# 3. Framework Preset: Vite
# 4. Root Directory: frontend   (agar monorepo bo'lsa)
# 5. Environment Variables:
#      VITE_API_URL = https://form-api.akaikumogo.uz
# 6. Domain: form.akaikumogo.uz (Vercel Domains + Cloudflare DNS CNAME → vercel)
#
# Build: npm run build → dist/
# SPA routing: vercel.json rewrites → index.html
