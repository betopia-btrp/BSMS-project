# BSMS — Building Society Management System

Next.js 14 + TypeScript + Tailwind CSS + Zustand

## Quick Start
npm install && npm run dev → http://localhost:3000

## Backend API
- Copy `.env.local.example` to `.env.local`
- Set `NEXT_PUBLIC_API_URL` to your Laravel API URL
- Default expected backend: `http://127.0.0.1:8000/api`

## Demo Logins (password: password123)
- Admin:  admin@bsms.com
- Owner:  owner@bsms.com
- Tenant: tenant@bsms.com
- Guard:  guard@bsms.com

## 30 Routes Built
Login, Register, Forgot Password, Verify Email
Admin: Dashboard, Flats, Tenants, Payments, Maintenance, Visitors, Announcements, Reports, Settings
Owner: Dashboard, Flats, Payments, Maintenance, Announcements, Settings
Tenant: Dashboard, Payments (bKash/Nagad/Card), Maintenance, Visitors (pre-registration), Announcements, Settings
Guard: Dashboard, Visitors, Settings

## Payment Logic
- Rent → goes to Flat Owner (Admin cannot access)
- Service Charges → go to Admin

## Build
npm run build && npm start
