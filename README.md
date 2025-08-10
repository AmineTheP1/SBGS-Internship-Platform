# SBGS Internship Management Platform

A modern web application for managing internship applications at Société des Boissons Gazeuses du Souss (SBGS), the licensed Coca-Cola bottler in Agadir, Morocco.

---

## 🏗️ Project Structure

```
Plateforme SBGS/
├── backend/                # Next.js API (HR, admin, file uploads, DB)
│   └── src/
│       └── pages/api/hr/   # HR-related API endpoints
├── frontend/               # React + Vite frontend
│   └── src/
│       ├── components/     # Reusable UI components (Dashboard, ApplicationForm, etc.)
│       ├── pages/          # Route-level pages (Home, Apply, HRPortal, Contact)
│       ├── assets/         # Images, logo, etc.
│       └── App.jsx         # Main app with routing
├── database/               # Database configuration and scripts
│   ├── init/               # Database initialization scripts
│   ├── backups/            # Database backup files
│   ├── backup.bat          # Windows backup script
│   ├── backup.sh           # Linux/Mac backup script
│   └── restore.sh          # Database restore script
├── docker-compose.yml      # Docker services configuration
├── Dockerfile.backend      # Backend container configuration
├── Dockerfile.frontend     # Frontend container configuration
├── nginx.conf              # Nginx reverse proxy configuration
├── .env                    # Environment variables (create this)
└── README.md
```

---

## 🐳 Docker Setup

This project is fully containerized using Docker Compose with the following services:

### Services
- **PostgreSQL Database**: `postgres:15-alpine` on port `5433` (external)
- **Backend**: Next.js API server on port `3001`
- **Frontend**: React + Vite development server on port `3000`
- **Nginx**: Reverse proxy on port `80`

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Plateforme SBGS"
   ```

2. **Create environment file:**
   ```bash
   # Create .env file with your configuration
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
   JWT_SECRET=your-jwt-secret-key
   SUPER_ADMIN_SECRET=your-super-admin-secret-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=example@example.com
   SMTP_PASS=your-app-password
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - **Frontend**: http://localhost
   - **Database**: Connect via pgAdmin to `localhost:5433`

### Database Management

#### Backup Database
```bash
# Windows
database\backup.bat

# Linux/Mac
./database/backup.sh
```

#### Restore Database
```bash
# Linux/Mac
./database/restore.sh backup_file.sql
```

#### Access Database Directly
```bash
# Connect to database container
docker exec -it sbgs-postgres psql -U postgres -d sbgs_db

# Or connect from host (pgAdmin)
# Host: localhost, Port: 5433, User: postgres, Password: postgres
```

### Data Persistence
- Database data is stored in Docker volume `postgres_data`
- Data persists across container restarts and system reboots
- Only gets deleted if you run `docker-compose down -v`

---

## 🎨 Design System

- **Colors:**  
  - Coca-Cola Red: `#F40009`
  - Coca-Cola Light: `#FF9998`
  - Coca-Cola Dark: `#A30005`
- **Font:** Poppins (Google Fonts)
- **UI:** Tailwind CSS, FontAwesome, react-icons
- **Branding:** Coca-Cola corporate identity

---

## 🚀 Features

### For Students
- Modern, multi-step internship application form
- File uploads: CV, Carte Nationale, Convention de Stage, Assurance (PDF/image preview)
- Real-time validation and feedback
- Responsive, mobile-first design

### For HR Team
- Secure login portal
- Dashboard: view, search, filter, and manage applications
- Status management: Accept/Reject with badge display
- Detailed candidate view: all info, file previews, and status actions
- Intern assignment to supervisors

### For Supervisors
- Secure login portal
- Dashboard: view assigned interns and their activities
- Attendance confirmation: confirm or deny candidate presence
- Absence management: mark justified/unjustified absences
- Daily activity monitoring and reporting

### General
- Multi-language support (French/English)
- Professional branding and theming
- Contact form and company info
- Social media integration

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, react-icons
- **Backend:** Next.js API routes, PostgreSQL
- **Database:** PostgreSQL 15 (containerized)
- **Reverse Proxy:** Nginx
- **Containerization:** Docker & Docker Compose
- **Styling:** Tailwind CSS, Poppins font
- **File Uploads:** Formidable, file previews

---

## 📱 Main Pages & Routes

- `/` - Home page
- `/apply` - Internship application form
- `/hr` - HR portal login
- `/dashboard` - HR dashboard (after login)
- `/candidature/:id` - Candidate details (HR only)
- `/contact` - Contact form

---

## 📝 Key Components

- **ApplicationForm.jsx:**  
  Multi-step form, file uploads, validation, school search, interest selection.
- **Dashboard.jsx:**  
  Table with search/filter, status management, details modal, pagination.
- **CandidateDetails.jsx:**  
  Full candidate info, file previews (PDF/image), accept/reject actions, status badge.
- **Chatbot.jsx:**  
  Interactive HR assistant (optional).

---

## 🔧 Development Setup

### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development servers:**
   - Backend:  
     ```bash
     cd backend && npm run dev
     ```
   - Frontend:  
     ```bash
     cd frontend && npm run dev
     ```
3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📋 API Endpoints

- `POST /api/hr/apply` - Submit internship application
- `POST /api/hr/login` - HR login
- `GET /api/hr/get-applications` - List or fetch application(s)
- `PUT /api/hr/update-status` - Update application status
- `GET /api/hr/get-cv` - Download CV
- `DELETE /api/hr/delete-application` - Delete application

---

## 🎨 Customization

- **Colors:** Edit Tailwind config or CSS variables.
- **Logo/Favicon:** Place your logo in `public/` and update `<link rel="icon" ... />` in `layout.tsx`.
- **Add new components:**  
  1. Create in `src/components/`
  2. Import and use in the relevant page
  3. Add route in `App.jsx` if needed

---

## 🔒 Security

- Client/server-side validation
- Secure file upload handling
- HR authentication
- Input sanitization
- Database connection security

---

## 🚨 Troubleshooting

### Database Issues
- **Port conflicts**: If port 5433 is in use, change it in `docker-compose.yml`
- **Connection errors**: Ensure the database container is healthy
- **Data loss**: Always backup before major changes

### Container Issues
- **Build failures**: Check Docker logs with `docker-compose logs`
- **Service dependencies**: Ensure database starts before backend
- **Volume issues**: Use `docker-compose down -v` to reset volumes

### Performance
- **Slow queries**: Check database indexes
- **Memory issues**: Adjust Docker resource limits
- **File uploads**: Check nginx client_max_body_size setting

