@echo off
start cmd /k "npx prisma studio"
start cmd /k "node server.js"
start cmd /k "npm run dev"
echo All services started!