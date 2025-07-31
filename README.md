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
├── README.md
└── ...
```

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
- **Styling:** Tailwind CSS, Poppins font
- **File Uploads:** Formidable, file previews
- **Authentication:** HR portal login

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

## 🔧 Getting Started

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

---

