# SBGS Internship Management Platform

A modern React-based web application for managing internship applications at Société des Boissons Gazeuses du Souss (SBGS), the licensed Coca-Cola bottler in Agadir, Morocco.

## 🏗️ Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar with Coca-Cola branding
│   ├── HeroSection.jsx # Hero section with call-to-action
│   ├── AboutSection.jsx # Company and internship program info
│   ├── ApplicationForm.jsx # Comprehensive internship application form
│   ├── HRLoginSection.jsx # HR portal login interface
│   ├── ContactSection.jsx # Contact form and company info
│   ├── Footer.jsx      # Footer with links and social media
│   ├── Chatbot.jsx     # HR assistant chatbot
│   └── Dashboard.jsx   # HR dashboard for managing applications
├── pages/              # Page components (route-level)
│   ├── Home.jsx        # Home page (Hero + About sections)
│   ├── Apply.jsx       # Application page
│   ├── HRPortal.jsx    # HR portal page
│   └── Contact.jsx     # Contact page
├── assets/             # Images and static files
├── App.jsx             # Main app with routing
├── main.jsx           # React entry point
└── index.css          # Global styles and Coca-Cola theme
```

## 🎨 Design System

### Colors
- **Coca-Cola Red**: `#F40009` (Primary brand color)
- **Coca-Cola Light**: `#FF9998` (Secondary/light variant)
- **Coca-Cola Dark**: `#A30005` (Dark variant)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Gradients**: Coca-Cola gradient backgrounds
- **Animations**: Floating, scale-in effects
- **Icons**: FontAwesome 6.4.0
- **Responsive**: Mobile-first design with Tailwind CSS

## 🚀 Features

### For Students
- **Modern Application Form**: Comprehensive internship application with file uploads
- **Real-time Validation**: Form validation with user feedback
- **Responsive Design**: Works perfectly on all devices
- **Interactive Chatbot**: HR assistant for questions and support

### For HR Team
- **Secure Login Portal**: HR employee authentication
- **Application Dashboard**: View, filter, and manage all applications
- **Status Management**: Update application status (Pending, Under Review, Accepted, Rejected)
- **Search & Filter**: Find applications by name, institution, or field of study
- **Detailed Views**: Modal popups with complete application details

### General Features
- **Multi-language Support**: French and English content
- **Professional Branding**: Coca-Cola corporate identity
- **Contact System**: Contact form with company information
- **Social Media Integration**: Links to company social media

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: FontAwesome 6.4.0
- **Fonts**: Google Fonts (Poppins)
- **Build Tool**: Vite

## 📱 Pages & Routes

- `/` - Home page with hero section and company information
- `/apply` - Internship application form
- `/hr` - HR portal login
- `/contact` - Contact form and company details
- `/dashboard` - HR dashboard (after login)

## 🎯 Key Components

### ApplicationForm.jsx
- Multi-step form with validation
- File upload for CV (PDF)
- Areas of interest selection
- Real-time form state management

### Dashboard.jsx
- Data table with search and filtering
- Status management dropdowns
- Modal for detailed application view
- Responsive table design

### Chatbot.jsx
- Interactive chat interface
- Pre-defined responses for common questions
- Real-time message handling
- Floating chat button

## 🔧 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📋 API Endpoints

The application expects the following API endpoints:

- `POST /api/apply` - Submit internship application
- `POST /api/hr/login` - HR portal authentication
- `POST /api/contact` - Submit contact form

## 🎨 Customization

### Adding New Colors
Update the Tailwind config in `index.html`:
```javascript
colors: {
  'coke-red': '#F40009',
  'coke-light': '#FF9998',
  'coke-dark': '#A30005'
}
```

### Adding New Components
1. Create component in `src/components/`
2. Import and use in appropriate page
3. Add routing if needed in `App.jsx`

### Styling Guidelines
- Use Coca-Cola colors for primary actions
- Maintain consistent spacing with Tailwind classes
- Follow mobile-first responsive design
- Use Poppins font family throughout

## 🔒 Security Considerations

- Form validation on both client and server side
- Secure file upload handling
- HR portal authentication
- Input sanitization for all forms

## 📞 Support

For technical support or questions about the internship program:
- Email: internship@sbgs.ma
- Phone: +212 (0) 528 84 14 14
- Office Hours: Monday - Friday, 8:30 AM - 6:00 PM

---

**© 2023 Société des Boissons Gazeuses du Souss. All rights reserved.**
