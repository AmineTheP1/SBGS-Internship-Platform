# 🏢 SBGS Internship Management Platform

A comprehensive web application for managing the complete internship lifecycle at **Société des Boissons Gazeuses du Souss (SBGS)**, the licensed Coca-Cola bottler in Agadir, Morocco. This platform handles everything from application submission to final evaluation and certification.


## 🌐 Live Demo

**🚀 Experience the platform live at: [https://stage.amineaichane.com](https://stage.amineaichane.com)**

The platform is fully deployed and operational, showcasing all features including the complete internship management workflow from application submission to final certification.

---

## 🏗️ Project Architecture

```
Plateforme SBGS/
├── 🔧 backend/                    # Next.js API Server
│   └── src/pages/api/
│       ├── hr/                    # HR Management APIs
│       ├── supervisor/            # Supervisor APIs
│       ├── candidate/             # Intern/Candidate APIs
│       └── supervisor-admin/      # Admin APIs
├── 🎨 frontend/                   # React + Vite Client
│   └── src/
│       ├── components/            # Reusable UI Components
│       ├── pages/                 # Application Pages
│       ├── config/                # API & App Configuration
│       └── assets/                # Static Assets
├── 🗄️ database/                   # Database Management
│   ├── init/                      # Schema & Initial Data
│   ├── backups/                   # Automated Backups
│   └── scripts/                   # Maintenance Scripts
├── 🐳 Docker Configuration
│   ├── docker-compose.yml         # Multi-service Setup
│   ├── Dockerfile.backend         # Backend Container
│   ├── Dockerfile.frontend        # Frontend Container
│   └── nginx.conf                 # Reverse Proxy Config
└── 📋 Documentation & Config
```

---

## 🚀 Complete Feature Set

### 👨‍🎓 **Student/Candidate Portal**

- **📝 Application System**
  - Multi-step application form with real-time validation
  - File uploads: CV, ID Card, Convention, Insurance documents
  - University/School integration with search functionality
  - Domain of interest selection (IT, Finance, Marketing, etc.)
- **📊 Personal Dashboard**
  - Application status tracking
  - Daily attendance clock-in/clock-out system
  - Daily activity reports submission
  - Final internship report upload
  - Access to useful documents and resources
  - Internship evaluation viewing
  - Attestation download after completion

### 👩‍💼 **HR Management Portal**

- **📋 Application Management**
  - Comprehensive dashboard with search, filter, and pagination
  - Application review with file preview (PDF/Images)
  - Status management (Pending, Accepted, Rejected)
  - Bulk operations and advanced filtering
- **👥 Intern Management**
  - Supervisor assignment system
  - Internship period scheduling
  - Certificate and attestation generation
  - Best candidates identification with AI-powered ranking
  - Interview proposal system for top performers
- **📧 Communication Tools**
  - Announcement system with email notifications
  - CV search and candidate matching
  - Interview scheduling and management
- **📁 Document Management**
  - Useful files upload and organization
  - Folder-based document structure
  - File sharing with interns and supervisors
- **🤖 AI Assistant**
  - Enhanced chatbot for HR queries
  - Candidate search and recommendation
  - Automated responses for common questions

### 👨‍🏫 **Supervisor Portal**

- **📈 Intern Monitoring**
  - Assigned interns dashboard
  - Daily attendance confirmation
  - Absence management (justified/unjustified)
  - Monthly attendance reports
- **📝 Evaluation System**
  - Comprehensive intern evaluation forms
  - Skills assessment across multiple criteria
  - Progress tracking and feedback
  - Report approval workflow
- **🎯 Theme Management**
  - Internship theme assignment
  - Project milestone tracking
  - Performance analytics

### 🔐 **Super Admin Features**

- **👤 User Management**
  - HR account creation and management
  - Supervisor account administration
  - Role-based access control
- **⚙️ System Configuration**
  - Platform settings management
  - Database maintenance tools
  - System monitoring and analytics

---

## 📸 Platform Screenshots

### 🏠 **Landing Page & Public Interface**

#### Home Page

<img width="1669" height="911" alt="localhost_ (8)" src="https://github.com/user-attachments/assets/a2c1bf46-e837-45b5-8d80-2cf5d3f5b0d9" />


#### Application Form

<img width="1669" height="911" alt="localhost_ (9)" src="https://github.com/user-attachments/assets/5af93b2d-71b0-4993-961f-1081b56e7ae0" />

#### User Type Selection

<img width="1669" height="911" alt="localhost_ (10)" src="https://github.com/user-attachments/assets/c9aa7aad-4682-4c75-8d75-1c3d4a59a71a" />

---

### 👩‍💼 **HR Management Portal**

#### HR Dashboard

<img width="1669" height="911" alt="localhost_admin (6)" src="https://github.com/user-attachments/assets/87e952c9-1232-497e-801f-6043342da4bf" />


#### Application Review

<img width="1669" height="911" alt="localhost_admin (7)" src="https://github.com/user-attachments/assets/9f8d6802-7cb1-450d-966c-d9b8dfaccb4f" />


#### Best Candidates List

_AI-powered ranking system showing top-performing former interns_
![Best Candidates](screenshots/best-candidates.png)

#### Document Management

_Organized file system with folders and sharing capabilities_
![Document Management](screenshots/document-management.png)

#### Enhanced Chatbot

_Intelligent HR assistant for candidate search and recommendations_
![HR Chatbot](screenshots/hr-chatbot.png)

---

### 👨‍🏫 **Supervisor Portal**

#### Supervisor Dashboard

_Overview of assigned interns with attendance and performance metrics_
![Supervisor Dashboard](screenshots/supervisor-dashboard.png)

#### Attendance Management

_Daily attendance confirmation and absence tracking interface_
![Attendance Management](screenshots/attendance-management.png)

#### Intern Evaluation

_Comprehensive evaluation form with multiple assessment criteria_
![Intern Evaluation](screenshots/intern-evaluation.png)

#### Monthly Reports

_Detailed analytics and reporting for intern performance_
![Monthly Reports](screenshots/monthly-reports.png)

---

### 👨‍🎓 **Student/Candidate Portal**

#### Candidate Dashboard

_Personal dashboard with internship progress and daily activities_
![Candidate Dashboard](screenshots/candidate-dashboard.png)

#### Clock In/Out System

_Simple and intuitive attendance tracking interface_
![Clock System](screenshots/clock-system.png)

#### Daily Reports

_Daily activity reporting with task and document tracking_
![Daily Reports](screenshots/daily-reports.png)

#### Final Report Upload

_End-of-internship report submission with file management_
![Final Report](screenshots/final-report.png)

#### Evaluation Results

_View performance evaluation results and feedback_
![Evaluation Results](screenshots/evaluation-results.png)

---


### 🎨 **Design System & Components**

#### UI Components Library

_Consistent design system with Coca-Cola branding_
![UI Components](screenshots/ui-components.png)

#### Form Elements

_Modern form controls with validation and feedback_
![Form Elements](screenshots/form-elements.png)

#### Data Visualization

_Charts and analytics with clean, professional styling_
![Data Visualization](screenshots/data-visualization.png)

---

> **Note**: Screenshots showcase the actual deployed platform at [stage.amineaichane.com](https://stage.amineaichane.com). The interface demonstrates the complete user experience across all user roles and device types.

---

## 🛠️ Technology Stack

### **Frontend**

- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Comprehensive icon library

### **Backend**

- **Next.js** - Full-stack React framework with API routes
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing
- **Formidable** - File upload handling
- **Nodemailer** - Email functionality

### **Infrastructure**

- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **PostgreSQL 15** - Database with Alpine Linux
- **Node.js 18** - Runtime environment

### **Design & UX**

- **Coca-Cola Brand Guidelines** - Official color scheme and typography
- **Poppins Font** - Modern, readable typography
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliant components

---

## 🐳 Quick Start with Docker

### **Prerequisites**

- Docker Desktop installed
- Git for version control
- 4GB+ RAM available

### **1. Clone & Setup**

```bash
git clone <repository-url>
cd "Plateforme SBGS"

# Create environment configuration
cp .env.example .env
# Edit .env with your settings
```

### **2. Environment Configuration**

Create `.env` file with:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sbgs_db

# Security Keys
JWT_SECRET=your-super-secure-jwt-secret-key-here
SUPER_ADMIN_SECRET=your-super-admin-secret-key

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

### **3. Launch Platform**

```bash
# Start all services in detached mode
docker-compose up -d

# Monitor logs (optional)
docker-compose logs -f

# Check service status
docker-compose ps
```

### **4. Access Points**

- **🌐 Main Application**: http://localhost
- **📊 HR Portal**: http://localhost/hr
- **👨‍🏫 Supervisor Portal**: http://localhost/supervisor
- **👨‍🎓 Student Portal**: http://localhost/candidate
- **🗄️ Database**: localhost:5433 (pgAdmin compatible)

---

## 📱 Application Routes & Pages

### **Public Routes**

- `/` - Landing page with company information
- `/apply` - Internship application form
- `/contact` - Contact form and company details
- `/user-type` - User type selection (HR/Supervisor/Candidate)

### **Authentication Routes**

- `/hr` - HR login portal
- `/supervisor` - Supervisor login portal
- `/candidate` - Candidate/Intern login portal

### **Protected Routes**

- `/dashboard` - HR management dashboard
- `/supervisor-dashboard` - Supervisor control panel
- `/candidate-dashboard` - Student/Intern dashboard
- `/candidature/:id` - Detailed candidate profile (HR only)

---

## 🔌 API Endpoints Overview

### **HR Management APIs**

```
Authentication & Session
POST   /api/hr/login                    # HR login
GET    /api/hr/session                  # Session validation
POST   /api/hr/logout                   # Logout

Application Management
GET    /api/hr/get-applications         # List applications
PUT    /api/hr/update-status           # Update application status
DELETE /api/hr/delete-application      # Delete application
GET    /api/hr/get-cv                  # Download CV files

Intern Management
POST   /api/hr/assign-intern           # Assign intern to supervisor
GET    /api/hr/get-supervisors         # List supervisors
POST   /api/hr/set-start-date          # Set internship dates
GET    /api/hr/get-best-candidates     # AI-ranked top candidates
POST   /api/hr/send-interview-proposal # Send interview invitations

Document & Communication
POST   /api/hr/send-announcement-email # Send announcements
GET    /api/hr/search-cvs              # Search candidate CVs
POST   /api/hr/upload-useful-file      # Upload documents
GET    /api/hr/get-useful-files        # List documents
```

### **Supervisor APIs**

```
Authentication & Management
POST   /api/supervisor/login                    # Supervisor login
GET    /api/supervisor/get-assigned-interns     # List assigned interns
GET    /api/supervisor/get-intern-details       # Intern details

Attendance & Monitoring
POST   /api/supervisor/mark-absence             # Mark intern absence
POST   /api/supervisor/confirm-presence         # Confirm attendance
GET    /api/supervisor/get-monthly-absences     # Monthly reports
GET    /api/supervisor/get-pending-confirmations # Pending confirmations

Evaluation & Reports
POST   /api/supervisor/evaluate-intern          # Submit evaluations
GET    /api/supervisor/get-intern-reports       # View reports
POST   /api/supervisor/approve-report           # Approve final reports
POST   /api/supervisor/set-theme                # Set internship themes
```

### **Candidate/Intern APIs**

```
Authentication & Profile
POST   /api/candidate/login              # Candidate login
GET    /api/candidate/get-assignment     # Get internship assignment
GET    /api/candidate/get-evaluation     # View evaluation results

Attendance System
POST   /api/candidate/clock-in           # Clock in for the day
POST   /api/candidate/clock-out          # Clock out
GET    /api/candidate/get-attendance     # View attendance history

Reports & Documents
POST   /api/candidate/update-daily-report # Submit daily reports
POST   /api/candidate/upload-report       # Upload final report
GET    /api/candidate/get-reports         # View submitted reports
GET    /api/candidate/check-attestation   # Check attestation status
GET    /api/candidate/get-useful-files    # Access shared documents
```

---

## 🎨 Design System & Branding

### **Color Palette**

```css
/* Primary Coca-Cola Colors */
--coke-red: #f40009; /* Primary brand color */
--coke-light: #ff9998; /* Light accent */
--coke-dark: #a30005; /* Dark accent */

/* UI Colors */
--success: #10b981; /* Success states */
--warning: #f59e0b; /* Warning states */
--error: #ef4444; /* Error states */
--info: #3b82f6; /* Information */

/* Neutral Colors */
--gray-50: #f9fafb; /* Light backgrounds */
--gray-900: #111827; /* Dark text */
```

### **Typography**

- **Primary Font**: Poppins (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

### **Component Library**

- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Forms**: Input fields, Select dropdowns, File uploads, Validation
- **Navigation**: Navbar, Sidebar, Breadcrumbs, Pagination
- **Feedback**: Alerts, Toasts, Loading states, Empty states
- **Data Display**: Tables, Cards, Badges, Statistics

---

## 🗄️ Database Schema

### **Core Tables**

- **candidat** - Student/candidate profiles and authentication
- **demandes_stage** - Internship applications and requests
- **stages** - Active internship periods and assignments
- **responsables_stage** - Supervisor accounts and information
- **rh** - HR staff accounts and permissions

### **Management Tables**

- **assignations_stage** - Intern-supervisor assignments
- **presence** - Daily attendance tracking
- **rapports_journaliers** - Daily activity reports
- **rapports_stage** - Final internship reports
- **evaluations_stagiaire** - Performance evaluations

### **Administrative Tables**

- **attestations_stage** - Completion certificates
- **pieces_jointes** - Uploaded documents and files
- **absences** - Absence tracking and justifications
- **ecole** - University and school directory

---

## 🔧 Development & Deployment

### **Local Development**

```bash
# Install dependencies
npm install

# Start development servers
npm run dev:backend    # Backend on :3001
npm run dev:frontend   # Frontend on :3000

# Database operations
npm run db:migrate     # Run migrations
npm run db:seed        # Seed test data
npm run db:backup      # Create backup
```

### **Production Build**

```bash
# Build for production
npm run build

# Start production servers
npm run start:backend
npm run start:frontend

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### **Database Management**

```bash
# Backup database
./database/backup.sh

# Restore from backup
./database/restore.sh backup_2024_01_15.sql

# Connect to database
docker exec -it sbgs-postgres psql -U postgres -d sbgs_db
```

---

## 🔒 Security Features

### **Authentication & Authorization**

- JWT-based authentication with secure token storage
- Role-based access control (HR, Supervisor, Candidate, Super Admin)
- Session management with automatic expiration
- Password hashing using bcrypt with salt rounds

### **Data Protection**

- Input validation and sanitization on all endpoints
- SQL injection prevention with parameterized queries
- File upload restrictions and virus scanning
- CORS configuration for cross-origin requests

### **Privacy & Compliance**

- Personal data encryption for sensitive information
- Audit logging for all administrative actions
- GDPR-compliant data handling procedures
- Secure file storage with access controls

---

## 📊 Monitoring & Analytics

### **System Monitoring**

- Docker health checks for all services
- Database connection pooling and monitoring
- API response time tracking
- Error logging and alerting

### **Business Analytics**

- Application conversion rates
- Internship completion statistics
- Supervisor performance metrics
- Student satisfaction scores

---

## 🚨 Troubleshooting Guide

### **Common Issues**

#### **Database Connection Problems**

```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database connection
docker-compose restart postgres
```

#### **File Upload Issues**

```bash
# Check upload directory permissions
ls -la backend/uploads/

# Increase upload limits in nginx.conf
client_max_body_size 50M;
```

#### **Authentication Failures**

```bash
# Verify JWT secret in .env
echo $JWT_SECRET

# Clear browser cookies and localStorage
# Check token expiration in browser dev tools
```

### **Performance Optimization**

- Enable Redis caching for frequently accessed data
- Implement database indexing for search queries
- Use CDN for static asset delivery
- Enable gzip compression in Nginx

### **Backup & Recovery**

```bash
# Automated daily backups
0 2 * * * /path/to/backup.sh

# Point-in-time recovery
pg_restore --clean --if-exists -d sbgs_db backup.sql
```

---

## 📄 License

This project is proprietary software developed for SBGS (Société des Boissons Gazeuses du Souss). All rights reserved.

---

**Built with ❤️ for SBGS by Amine Aichane**
