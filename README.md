# StandUp - Virtual Daily Stand-up Web Application

A comprehensive web application for software development teams to conduct virtual daily stand-ups and team ceremonies.

> **🎨 Material Design 3 Ready**: This application has been fully upgraded to Material Design 3, providing a modern, accessible, and expressive user interface that follows the latest design principles.

## Features

- **Multi-Company Support**: Companies can have multiple teams and administrators
- **Team Management**: Create and manage teams with managers and members
- **Ceremony System**: Configurable team ceremonies with various question types
- **User Authentication**: Secure user management with role-based access
- **Chat Integration**: Support for Google Chat, Slack, and Microsoft Teams
- **Notification System**: Automated reminders and updates via chat and email
- **Work Hours Configuration**: Personalized notification scheduling
- **Beautiful UI**: Material Design 3 (MD3) implementation with modern design principles

## Tech Stack

- **Backend**: Python 3 with FastAPI
- **Database**: SQLite
- **Frontend**: Angular 17 with Angular Material 17 (Material Design 3)
- **Authentication**: JWT tokens
- **Chat Integration**: Webhook-based integrations

## Material Design 3 (MD3) Implementation

This application follows **Material Design 3** principles, the latest iteration of Google's design system. MD3 provides a more expressive, accessible, and personalized design approach.

### 🎨 **Design Principles**

- **Personal**: Adapts to user preferences and device capabilities
- **Expressive**: Rich with motion and meaningful transitions
- **Accessible**: Built-in accessibility features and high contrast
- **Adaptive**: Responsive design that works across all screen sizes

### 🎯 **Key MD3 Features Implemented**

#### **Color System**
- **Primary Colors**: Purple-based theme (#6750a4) with proper contrast ratios
- **Surface Colors**: Light, airy surfaces with subtle shadows
- **Error Colors**: Consistent error states throughout the app
- **CSS Custom Properties**: All colors defined as CSS variables for easy theming

#### **Typography Scale**
- **Display**: Large (57px), Medium (45px), Small (36px)
- **Headlines**: 6 levels from 32px down to 24px
- **Body Text**: Large (16px), Medium (14px), Small (12px)
- **Labels**: Consistent sizing for forms and UI elements

#### **Shape System**
- **Extra Small**: 4px corners (tooltips, small elements)
- **Small**: 8px corners (form fields, menus)
- **Medium**: 12px corners (cards, dialogs)
- **Large**: 16px corners (main cards, buttons)
- **Extra Large**: 28px corners (search fields, rounded buttons)

#### **Elevation System**
- **Level 0**: No shadow (surfaces)
- **Level 1**: Subtle shadows (cards, buttons)
- **Level 2**: Medium shadows (hovered cards)
- **Level 3**: Strong shadows (menus, overlays)
- **Level 4-5**: Heavy shadows (modals, floating elements)

### 🚀 **UI Component Guidelines**

#### **Buttons**
- Use rounded corners (20px radius)
- No text transformation for better readability
- Proper font weights (500) and letter spacing (0.1px)
- Consistent sizing (40px height minimum)

#### **Cards**
- Rounded corners (16px radius)
- Subtle shadows with hover effects
- Smooth transitions (300ms cubic-bezier)
- MD3 surface colors and spacing

#### **Form Fields**
- Rounded corners (12px radius)
- Clear focus states with primary colors
- Proper spacing and typography
- Accessible labels and error states

#### **Navigation**
- Card-based design with hover states
- Active states using primary container colors
- Smooth transitions and animations
- Mobile-optimized interactions

### 🎨 **CSS Custom Properties**

The app uses CSS custom properties (variables) for consistent theming:

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-surface: #fef7ff;
  --md-sys-shape-corner-large: 16px;
  --md-sys-elevation-level1: 1px;
  --md-sys-typescale-headline-large-size: 32px;
}
```

### 📱 **Responsive Design**

- **Mobile First**: Design for mobile devices first, then enhance for larger screens
- **Touch Friendly**: Minimum 40px touch targets
- **Adaptive Layouts**: Grid systems that adapt to screen size
- **Typography Scaling**: Responsive font sizes using MD3 scale

### 🔧 **Developer Guidelines**

#### **When Adding New Components**
1. **Use MD3 Design Tokens**: Reference the CSS custom properties for colors, spacing, and typography
2. **Follow Shape Guidelines**: Apply appropriate corner radius based on component type
3. **Implement Elevation**: Use proper shadow levels for depth and hierarchy
4. **Maintain Consistency**: Follow established patterns for similar components

#### **Styling Best Practices**
```typescript
// ✅ Good: Use MD3 design tokens
.component {
  border-radius: var(--md-sys-shape-corner-large);
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-body-large-size);
}

// ❌ Avoid: Hard-coded values
.component {
  border-radius: 16px;
  color: #333;
  font-size: 16px;
}
```

#### **Animation Guidelines**
- **Duration**: 200ms for micro-interactions, 300ms for larger changes
- **Easing**: Use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth transitions
- **Purpose**: Animations should enhance usability, not distract

### 📚 **Resources**

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Angular Material Documentation](https://material.angular.io/)
- [MD3 Color System](https://m3.material.io/foundations/color/overview)
- [MD3 Typography](https://m3.material.io/foundations/typography/overview)

## Project Structure

```
standup_py/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application entry point
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Angular components
│   │   │   ├── services/   # Angular services
│   │   │   ├── models/     # TypeScript interfaces
│   │   │   └── shared/     # Shared modules and utilities
│   │   ├── assets/         # Static assets
│   │   └── styles/         # Global styles
│   ├── package.json        # Node.js dependencies
│   └── angular.json        # Angular configuration
├── .devcontainer/          # Development container configuration
├── docker-compose.yml      # Docker services
└── README.md              # This file
```

## Quick Start

### Using Dev Container (Recommended)

1. Open the project in VS Code with Dev Containers extension
2. The container will automatically build and set up the development environment
3. Backend will be available at http://localhost:8000
4. Frontend will be available at http://localhost:4200

**Note**: If you encounter devcontainer build issues, see the troubleshooting section below.

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py  # Initialize database
python seed_db.py  # Seed with sample data (optional)
python start.py    # Start the server
```

#### Frontend
```bash
cd frontend
npm install
ng serve
```

## Sample Data

The application includes sample data for testing:

- **Company**: Acme Software Corp
- **Users**: Admin, Team Manager, Developer, QA Engineer, Designer
- **Team**: Product Development Team
- **Ceremony**: Daily Stand-up with 5 questions

**Login Credentials**:
- Admin: `admin@acme.com` / `admin123`
- Manager: `sarah.manager@acme.com` / `manager123`
- Developer: `john.dev@acme.com` / `dev123`

## Development

- Backend API documentation: http://localhost:8000/docs
- Frontend development server: http://localhost:4200
- Database: SQLite file in backend/data/
- **UI Development**: Follow Material Design 3 guidelines (see MD3 section above)
- **Styling**: Use CSS custom properties defined in `src/styles.css`
- **Component Library**: Angular Material 17 with MD3 theming

## Working Status

✅ **Backend**: Fully functional with FastAPI, database models, and authentication
✅ **Frontend**: Angular 17 application with Material Design 3 components - **FULLY UPGRADED!**
✅ **Database**: SQLite with all models and relationships
✅ **DevContainer**: Fixed and working properly
✅ **API**: Health check and authentication endpoints working
✅ **Frontend Server**: Angular dev server running on port 4200

🔄 **In Progress**: Additional API endpoints for full CRUD operations
🔄 **In Progress**: Chat integration implementations
🔄 **In Progress**: Email notification system

## Troubleshooting

### DevContainer Issues

If you encounter "Failed to install Cursor server" or Docker build errors:

1. **Clean Docker cache**:
   ```bash
   docker system prune -a
   docker builder prune
   ```

2. **Rebuild the container**:
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

3. **Check Docker logs**:
   ```bash
   docker compose logs -f
   ```

4. **Alternative**: Use manual setup (see QUICK_START.md)

### Common Issues

- **Port conflicts**: Change ports in `backend/start.py` and `frontend/angular.json`
- **Dependencies**: Ensure Python 3.11+ and Node.js 18+
- **Database errors**: Run `python init_db.py` to initialize the database
- **Import errors**: Make sure you're in the virtual environment and dependencies are installed

### UI Development Issues

#### **Material Design 3 Styling**
- **CSS Variables Not Working**: Ensure you're using the correct variable names (e.g., `var(--md-sys-color-primary)`)
- **Component Styling Conflicts**: Check if Angular Material's default styles are overriding MD3 customizations
- **Build Errors**: Verify that all SCSS files compile correctly with `npm run build`

#### **Responsive Design**
- **Mobile Layout Issues**: Test on actual mobile devices, not just browser dev tools
- **Touch Targets**: Ensure all interactive elements are at least 40px in height/width
- **Typography Scaling**: Use MD3 typography scale for consistent text sizing

#### **Performance**
- **Large Bundle Size**: Check for unused Angular Material modules in your components
- **CSS Bloat**: Avoid duplicate styles and use CSS custom properties consistently
- **Animation Performance**: Use `transform` and `opacity` for smooth animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
