# MileTrack 🚗 

**The Smarter Way for Freelancers to Track Their Drive.**

MileTrack is a specialized utility designed for independent contractors, delivery drivers, and freelancers to simplify the process of mileage logging and business expense reporting. With automatic route calculation, Google Maps integration, and IRS-compliant reporting, MileTrack helps you maximize deductions while minimizing paperwork.

---

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Key Features Explained](#-key-features-explained)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Features

### Core Mileage Tracking
* **📍 Smart Trip Logging:** Log business trips with automatic mileage calculation using Google Maps API
* **🗺️ Visual Route Maps:** View route maps with driving directions for each trip
* **🏠 Home Address Integration:** Set your home base for quick trip entry
* **📅 Monthly View:** Filter and organize trips by month with easy navigation
* **📊 Real-time Statistics:** Track total miles and estimated tax deductions at a glance

### Client & Project Management
* **👥 Client Database:** Maintain a list of clients with addresses for quick trip logging
* **📁 Project Tracking:** Organize trips by projects within each client
* **✏️ Easy Management:** Add, edit, and delete clients and projects on the fly

### Gas Expense Tracking
* **⛽ Fuel Logging:** Track gas purchases with date, amount, gallons, and station details
* **🧾 Receipt Upload:** Attach receipt photos to expense records (Premium feature)
* **📈 Expense Analytics:** View total gas spending and fuel consumption trends

### Professional Reporting
* **📄 CSV Export:** Generate spreadsheet-ready reports of your trips
* **🖨️ PDF Export:** Create professional, tax-ready reports with route maps (Premium feature)
* **💰 Tax Calculations:** Automatic calculation using current IRS mileage rate ($0.70/mile for 2025)
* **📧 Invoice Generation:** Create branded invoices for clients (Premium feature)

### User Management
* **🔐 Secure Authentication:** Google OAuth integration for seamless, secure login
* **👤 Profile Management:** Store business details (name, type, contact info, tax ID)
* **🎨 Company Branding:** Upload logo for professional invoices (Premium feature)
* **💳 Premium Subscriptions:** Stripe-powered subscription management

### Admin Features
* **🛡️ Admin Dashboard:** Dedicated admin portal for user management
* **🎫 Support Tickets:** Built-in ticketing system for user support
* **👥 User Overview:** View and manage registered users

## 🛠️ Tech Stack

### Frontend
* **[React 18](https://react.dev/):** Modern UI library with hooks
* **[TypeScript](https://www.typescriptlang.org/):** Type-safe JavaScript development
* **[Vite](https://vitejs.dev/):** Fast build tool and dev server
* **[React Router](https://reactrouter.com/):** Client-side routing
* **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework
* **[Shadcn UI](https://ui.shadcn.com/):** High-quality component library
* **[Lucide Icons](https://lucide.dev/):** Beautiful, consistent iconography
* **[React Hook Form](https://react-hook-form.com/):** Performant form management
* **[Zod](https://zod.dev/):** TypeScript-first schema validation
* **[TanStack Query](https://tanstack.com/query):** Powerful data fetching and caching

### Backend & Services
* **[Supabase](https://supabase.com/):** PostgreSQL database with real-time capabilities
  - Authentication & Authorization (Row Level Security)
  - PostgreSQL Database
  - Edge Functions (Deno)
  - File Storage
* **[Google Maps API](https://developers.google.com/maps):** Route calculation and mapping
* **[Stripe](https://stripe.com/):** Payment processing and subscriptions

### Development Tools
* **[ESLint](https://eslint.org/):** Code linting and style enforcement
* **[Vitest](https://vitest.dev/):** Unit testing framework
* **[Testing Library](https://testing-library.com/):** React component testing

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Google Cloud Account** (for Maps API) - [Get started](https://console.cloud.google.com/)
- **Stripe Account** (for payments) - [Sign up](https://stripe.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AmbitiousWays16/freelancemileage.git
   cd freelancemileage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   
   # Google Maps API (configured in Supabase Edge Functions)
   # Add GOOGLE_MAPS_API_KEY to your Supabase Edge Function secrets
   
   # Stripe (optional, for premium features)
   # Configure Stripe keys in your Supabase project
   ```

4. **Set up Supabase:**
   
   a. Create a new Supabase project at [supabase.com](https://supabase.com/)
   
   b. Run the database migrations:
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   ```
   
   c. Deploy Edge Functions:
   ```bash
   # Set Google Maps API key as a secret
   supabase secrets set GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Deploy functions
   supabase functions deploy google-maps-route
   supabase functions deploy static-map-proxy
   ```

5. **Configure Google Cloud:**
   
   a. Enable the following APIs in your Google Cloud Console:
   - Google Maps Directions API
   - Google Maps Static API
   
   b. Create an API key with appropriate restrictions

6. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📱 Usage Guide

### First-Time Setup

1. **Sign Up / Sign In:**
   - Navigate to the authentication page
   - Sign in with Google OAuth
   - Complete the onboarding form with your business details

2. **Complete Your Profile:**
   - Add your business name and type
   - Enter contact information
   - Set your home address (used as default starting point for trips)

### Logging a Trip

1. **Navigate to the main dashboard**
2. **Fill in the trip form:**
   - **Date:** Select the trip date (cannot be in the future)
   - **From Address:** Start location (auto-fills with home address if enabled)
   - **To Address:** Destination address
   - **Client/Project:** Select or add a new client and project
   - **Business Purpose:** Describe the reason for the trip
3. **Calculate Route:** Click to get automatic mileage calculation via Google Maps
4. **Review the route map** to ensure accuracy
5. **Submit** to save the trip

### Managing Clients & Projects

1. **Click the Settings icon** in the trip form
2. **Add Client:**
   - Enter client name and default address
   - Click "Add Client"
3. **Add Project:**
   - Select a client
   - Enter project name and address (optional)
   - Click "Add Project"
4. **Edit/Delete:** Use the edit and delete buttons next to each entry

### Tracking Gas Expenses

1. **Navigate to the Gas Expenses section**
2. **Add an expense:**
   - Enter date of purchase
   - Enter dollar amount spent
   - Enter gallons purchased
   - Enter gas station name/location
   - (Premium) Upload a receipt photo
3. **View summary:** See total spending and gallons consumed

### Generating Reports

#### CSV Export (Free)
1. Click the **Export** button
2. Choose **CSV format**
3. Select the month or date range
4. Download opens automatically

#### PDF Export (Premium)
1. Click the **Export** button
2. Choose **PDF format**
3. The report includes:
   - Trip details with route maps
   - Mileage totals
   - Tax deduction calculations
   - Your business branding (if uploaded)

### Archiving Old Trips

1. **Monthly Archive Prompt:** The app will remind you to archive previous months' trips
2. **Review trips** marked for archiving
3. **Confirm** to move them to the archive
4. Archived trips can be viewed but not edited

## 🔑 Key Features Explained

### Route Calculation

MileTrack uses Google Maps Directions API to calculate the most efficient driving route between two addresses. The system:
- Calculates accurate driving distances
- Provides turn-by-turn route data
- Generates visual route maps
- Stores route data for offline viewing

### IRS Mileage Rate

The application uses the current IRS standard mileage rate (updated annually):
- **2025 Rate:** $0.70 per mile
- Automatically calculates tax deductions
- Compliant with IRS record-keeping requirements

### Premium Features

Premium users get access to:
- **PDF Reports** with embedded route maps
- **Receipt Upload** for gas expenses  
- **Company Branding** with logo upload
- **Professional Invoicing** for clients
- **Priority Support**

### Security & Privacy

MileTrack implements enterprise-grade security:
- **Row Level Security (RLS):** Database policies ensure users can only access their own data
- **Authentication Required:** All endpoints require valid authentication
- **Rate Limiting:** API endpoints are rate-limited to prevent abuse
- **Input Validation:** All form inputs are validated with Zod schemas
- **Secure Storage:** Files stored in Supabase with access controls

## 🔧 Development

### Project Structure

```
freelancemileage/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── TripForm.tsx  # Trip logging form
│   │   ├── TripList.tsx  # Trip display component
│   │   └── ...
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   ├── lib/              # Utility functions
│   ├── pages/            # Route page components
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Application entry point
├── supabase/
│   ├── functions/        # Edge Functions (API routes)
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

Tests are located in the `src/test/` directory and use Vitest + Testing Library.

### Database Schema

Key tables:
- **profiles:** User profile information
- **trips:** Mileage trip records
- **programs (clients):** Client/company information
- **projects:** Projects within clients
- **gas_expenses:** Fuel purchase records
- **user_roles:** Admin role assignments
- **support_tickets:** Customer support tickets

### Adding New Features

1. **Create your feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the existing code structure

3. **Write tests** for new functionality

4. **Update documentation** if needed

5. **Submit a pull request** with a clear description

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow the existing TypeScript and React patterns
- Use functional components with hooks
- Maintain proper type safety
- Write meaningful commit messages
- Add comments for complex logic

### Reporting Issues

Found a bug or have a feature request? Please open an issue with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots if applicable
- Your environment (browser, OS, etc.)

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

Need help? Here are your options:

1. **Documentation:** Check this README and other docs
2. **Issues:** Search existing [GitHub Issues](https://github.com/AmbitiousWays16/freelancemileage/issues)
3. **New Issue:** Create a new issue with details
4. **Contact:** Use the in-app contact form (for registered users)

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Google Maps](https://developers.google.com/maps) for mapping services
- All our contributors and users!

---

**Built with ❤️ for freelancers, by freelancers.**
