# MileTrack Architecture

This document provides a technical overview of MileTrack's architecture, design patterns, and key technical decisions.

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Performance Optimization](#performance-optimization)

## 🏗️ System Overview

MileTrack is a modern single-page application (SPA) built with React and TypeScript, using Supabase as a Backend-as-a-Service (BaaS) platform. The application follows a serverless architecture with edge functions for API integrations.

### Key Characteristics

- **Frontend:** Client-side React application
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Authentication:** OAuth 2.0 (Google) + Supabase Auth
- **Data Storage:** PostgreSQL with Row Level Security (RLS)
- **File Storage:** Supabase Storage with access controls
- **API Integration:** Serverless Edge Functions (Deno)
- **Deployment:** Static hosting + serverless functions

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React App (TypeScript)                                          │
│  ├── React Router (Navigation)                                   │
│  ├── TanStack Query (Data Fetching/Caching)                     │
│  ├── React Hook Form (Form Management)                          │
│  └── Zod (Validation)                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   Supabase Platform                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Authentication Service (Supabase Auth)                    │  │
│  │ ├── Google OAuth Provider                                │  │
│  │ ├── JWT Token Management                                 │  │
│  │ └── Session Management                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                       │  │
│  │ ├── profiles (user data)                                 │  │
│  │ ├── trips (mileage logs)                                 │  │
│  │ ├── programs (clients)                                   │  │
│  │ ├── projects (client projects)                           │  │
│  │ ├── gas_expenses (fuel tracking)                         │  │
│  │ └── user_roles (admin management)                        │  │
│  │                                                           │  │
│  │ Row Level Security (RLS) Policies:                       │  │
│  │ └── User can only access their own data                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Storage Service                                           │  │
│  │ ├── user-branding/ (company logos)                       │  │
│  │ └── gas-receipts/ (receipt images)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Edge Functions (Deno Runtime)                            │  │
│  │ ├── google-maps-route (Route calculation)               │  │
│  │ └── static-map-proxy (Map image proxy)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┬──┘
                       │                                       │
                       │ API Calls                             │
                       │                                       │
        ┌──────────────▼────────────┐         ┌───────────────▼─────┐
        │   Google Maps APIs        │         │   Stripe API          │
        ├───────────────────────────┤         ├───────────────────────┤
        │ - Directions API          │         │ - Payment Processing  │
        │ - Static Maps API         │         │ - Subscriptions       │
        │ - Geocoding API           │         │ - Customer Management │
        └───────────────────────────┘         └───────────────────────┘
```

## 🛠️ Technology Stack

### Frontend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | 18.3+ |
| TypeScript | Type Safety | 5.8+ |
| Vite | Build Tool | 5.4+ |
| React Router | Client Routing | 6.30+ |
| TanStack Query | Data Fetching | 5.83+ |
| Tailwind CSS | Styling | 3.4+ |
| Shadcn UI | Component Library | Latest |
| React Hook Form | Form Management | 7.61+ |
| Zod | Schema Validation | 3.25+ |
| date-fns | Date Utilities | 3.6+ |

### Backend Stack

| Technology | Purpose |
|------------|---------|
| Supabase | BaaS Platform |
| PostgreSQL | Relational Database |
| PostgREST | Auto-generated REST API |
| Deno | Edge Functions Runtime |
| Google Maps API | Mapping Services |
| Stripe | Payment Processing |

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── TripForm.tsx           # Trip logging form
│   ├── TripList.tsx           # Trip display list
│   ├── MileageSummary.tsx     # Statistics dashboard
│   ├── ClientProjectManager.tsx # Client/project CRUD
│   ├── GasExpenseForm.tsx     # Gas expense form
│   ├── ExportButton.tsx       # CSV/PDF export
│   └── ...
├── pages/
│   ├── Index.tsx              # Main dashboard
│   ├── Auth.tsx               # Authentication page
│   ├── Onboarding.tsx         # User onboarding
│   ├── Admin.tsx              # Admin dashboard
│   └── Contact.tsx            # Support contact
├── hooks/
│   ├── useTrips.ts            # Trip management
│   ├── useClients.ts          # Client/project management
│   ├── useProfile.ts          # User profile
│   ├── useGasExpenses.ts      # Gas expense tracking
│   └── useUserRole.ts         # Role-based access
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client
│       └── types.ts           # Database types
├── lib/
│   ├── mapUtils.ts            # Map utilities
│   └── utils.ts               # General utilities
└── types/
    └── mileage.ts             # Domain types
```

### Routing Strategy

MileTrack uses React Router v6 with protected routes:

```typescript
// Route Protection Levels
1. Public Routes:
   - /auth (Login/Signup)
   - /404 (Not Found)

2. Authenticated Routes:
   - /onboarding (Profile completion)
   - / (Main dashboard)
   - /contact (Support form)

3. Admin Routes:
   - /admin (Admin dashboard)
```

Route guards check:
- User authentication status
- Profile completion status
- Admin role assignment

### State Management

MileTrack uses a hybrid state management approach:

1. **Server State:** TanStack Query
   - API data fetching and caching
   - Automatic background refetching
   - Optimistic updates
   - Request deduplication

2. **Context API:** React Context
   - Authentication state
   - User session management
   - Global app state

3. **Local State:** React Hooks
   - Component-specific state
   - Form state (React Hook Form)
   - UI state (modals, toggles)

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useTrips, useProfile, etc.)
    ↓
TanStack Query (useMutation/useQuery)
    ↓
Supabase Client
    ↓
Supabase API (with RLS)
    ↓
PostgreSQL Database
    ↓
Response back through the chain
    ↓
UI Update (automatic via React Query)
```

## 🔧 Backend Architecture

### Supabase Services

#### 1. Authentication (Supabase Auth)

- **Provider:** Google OAuth 2.0
- **Flow:** Authorization Code Flow with PKCE
- **Tokens:** JWT access tokens + refresh tokens
- **Session:** Stored in localStorage (auto-handled by Supabase)

#### 2. Database (PostgreSQL)

- **Access:** Auto-generated REST API via PostgREST
- **Security:** Row Level Security (RLS) policies
- **Real-time:** WebSocket subscriptions (optional)

#### 3. Storage

- **Buckets:**
  - `user-branding`: Company logos (premium users)
  - `gas-receipts`: Receipt photos (premium users)
- **Access Control:** RLS policies on storage objects
- **File Size Limits:** Enforced at application level

#### 4. Edge Functions

Serverless functions running on Deno:

**google-maps-route:**
- Calculates driving route between addresses
- Returns: distance, duration, polyline, map data
- Requires: JWT authentication
- Rate limited: 50 requests/minute per user

**static-map-proxy:**
- Proxies Google Static Maps API
- Prevents API key exposure
- Returns: Base64-encoded map image
- Requires: JWT authentication
- Security headers: CSP, X-Frame-Options

## 🗄️ Database Schema

### Core Tables

#### profiles
User profile information
```sql
- user_id (uuid, PK, FK to auth.users)
- first_name (text)
- last_name (text)
- email (text)
- business_name (text)
- business_type (text)
- phone (text)
- home_address (text)
- tax_id (text)
- profile_completed (boolean)
- branding_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)

RLS: Users can only access their own profile
```

#### trips
Mileage trip records
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- date (date)
- from_address (text)
- to_address (text)
- miles (numeric)
- business_purpose (text)
- client_name (text)
- project_name (text)
- route_url (text)
- route_map_data (jsonb)
- archived (boolean)
- created_at (timestamptz)

RLS: Users can only access their own trips
Indexes: user_id, date, archived
```

#### programs (clients)
Client/company information
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- name (text)
- address (text)
- created_at (timestamptz)

RLS: Users can only access their own clients
```

#### projects
Projects within clients
```sql
- id (uuid, PK)
- program_id (uuid, FK to programs)
- user_id (uuid, FK to profiles)
- name (text)
- address (text)
- created_at (timestamptz)

RLS: Users can only access their own projects
```

#### gas_expenses
Fuel purchase tracking
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- date (date)
- amount (numeric)
- gallons (numeric)
- station (text)
- receipt_url (text)
- created_at (timestamptz)

RLS: Users can only access their own expenses
```

#### user_roles
Admin role assignments
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- role (text) -- 'admin'
- created_at (timestamptz)

RLS: Read-only for authenticated users
Admin operations: Service role only
```

### Relationships

```
profiles (1) ←→ (N) trips
profiles (1) ←→ (N) programs (clients)
profiles (1) ←→ (N) gas_expenses
programs (1) ←→ (N) projects
auth.users (1) ←→ (1) profiles
auth.users (1) ←→ (0..1) user_roles
```

## 🔒 Security Architecture

### Authentication & Authorization

1. **Authentication Flow:**
   ```
   User → Google OAuth → Google Login
     ↓
   Google → Authorization Code → Supabase
     ↓
   Supabase → JWT Tokens → Client
     ↓
   Client → Store Session → localStorage
   ```

2. **Authorization Layers:**
   - **Application Level:** Route guards, UI conditionals
   - **API Level:** JWT validation on Edge Functions
   - **Database Level:** Row Level Security policies

### Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: trips table policies

-- SELECT: Users can view their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can create their own trips
CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Input Validation

Multi-layer validation:

1. **Client-Side:** Zod schemas in forms
   ```typescript
   const tripSchema = z.object({
     date: z.string().refine(/* date validation */),
     fromAddress: z.string().min(1).max(500),
     toAddress: z.string().min(1).max(500),
     businessPurpose: z.string().min(1).max(500),
   });
   ```

2. **Database Level:** PostgreSQL constraints
   - NOT NULL constraints
   - CHECK constraints
   - Foreign key constraints

### Security Headers

Edge Functions include security headers:
```typescript
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'"
}
```

### Rate Limiting

Edge Functions implement rate limiting:
- 50 requests per minute per user
- Enforced at function level
- Tracks by user_id from JWT

## 🔌 API Integration

### Google Maps API

**Purpose:** Route calculation and static maps

**APIs Used:**
- Directions API: Calculate routes
- Static Maps API: Generate map images
- Geocoding API: Address validation (planned)

**Architecture:**
```
Client → Edge Function → Google Maps API
   ↑                            ↓
   └──── Response (no API key) ──┘
```

**Security:**
- API keys stored in Supabase secrets
- Never exposed to client
- Proxied through Edge Functions

### Stripe API

**Purpose:** Payment processing and subscriptions

**Features:**
- Customer creation
- Subscription management
- Payment method handling
- Webhook processing

**Integration Point:** Supabase Stripe extension

## 📊 State Management

### TanStack Query Usage

**Queries:**
```typescript
// Fetch trips
const { data: trips } = useQuery({
  queryKey: ['trips', selectedMonth],
  queryFn: () => fetchTrips(selectedMonth),
});
```

**Mutations:**
```typescript
// Add trip
const addTripMutation = useMutation({
  mutationFn: (trip) => createTrip(trip),
  onSuccess: () => {
    queryClient.invalidateQueries(['trips']);
  },
});
```

**Optimistic Updates:**
```typescript
const deleteTripMutation = useMutation({
  mutationFn: deleteTrip,
  onMutate: async (tripId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['trips']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['trips']);
    
    // Optimistically update
    queryClient.setQueryData(['trips'], (old) =>
      old.filter((t) => t.id !== tripId)
    );
    
    return { previous };
  },
  onError: (err, tripId, context) => {
    // Rollback on error
    queryClient.setQueryData(['trips'], context.previous);
  },
});
```

### Context API Usage

**AuthContext:**
```typescript
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  isPremium: false,
});
```

Used for:
- User authentication state
- Session management
- Premium status
- Global auth methods

## ⚡ Performance Optimization

### Frontend Optimizations

1. **Code Splitting:**
   - Route-based code splitting with React.lazy()
   - Dynamic imports for large components

2. **Image Optimization:**
   - Map images cached in browser
   - Base64 encoding for small images
   - Lazy loading for off-screen images

3. **Memoization:**
   - React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for event handlers

4. **Bundle Size:**
   - Tree shaking enabled (Vite)
   - Import only needed Shadcn components
   - Minimize third-party dependencies

### Backend Optimizations

1. **Database:**
   - Indexes on frequently queried columns
   - Efficient query patterns
   - Connection pooling (Supabase)

2. **Caching:**
   - TanStack Query client-side cache
   - Browser cache for static assets
   - CDN for map images (planned)

3. **API Efficiency:**
   - Batch operations where possible
   - Efficient RLS policies
   - Selective field fetching

### Build Optimizations

```typescript
// vite.config.ts
export default {
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
        },
      },
    },
  },
};
```

## 🚀 Deployment Architecture

### Frontend Deployment

- **Platform:** Static hosting (Vercel, Netlify, or similar)
- **Build Output:** Optimized static files
- **CDN:** Automatic via hosting platform
- **Environment Variables:** Set in hosting platform

### Backend Deployment

- **Platform:** Supabase Cloud
- **Database:** Managed PostgreSQL
- **Edge Functions:** Auto-deployed via Supabase CLI
- **Secrets:** Managed via Supabase dashboard

### CI/CD Pipeline (Recommended)

```yaml
# Example GitHub Actions workflow
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linter
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Deploy to hosting
      run: # hosting-specific deploy command
```

## 📈 Scalability Considerations

### Current Limitations

- Single database instance (Supabase free tier)
- Rate limits on Google Maps API
- Edge function cold starts

### Scaling Strategy

1. **Vertical Scaling:**
   - Upgrade Supabase plan
   - Increase connection pool
   - More Edge Function resources

2. **Horizontal Scaling:**
   - Multiple read replicas (future)
   - CDN for static content
   - Distributed caching

3. **Cost Optimization:**
   - Implement request caching
   - Optimize database queries
   - Batch API requests

## 🔮 Future Enhancements

### Planned Features

1. **Mobile Apps:** React Native implementation
2. **Offline Support:** Service workers, local storage
3. **Real-time Collaboration:** Supabase real-time features
4. **Advanced Analytics:** Charts, trends, insights
5. **Multi-tenant:** Team/organization support

### Technical Debt

- Add comprehensive E2E tests
- Implement error boundary for all routes
- Improve TypeScript coverage (remove any types)
- Add request retry logic
- Implement proper logging/monitoring

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Google Maps API](https://developers.google.com/maps)
- [Stripe Documentation](https://stripe.com/docs)

---

**Last Updated:** February 2026
