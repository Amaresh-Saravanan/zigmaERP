# Dashboard Improvement Prompt

## Context
You are reviewing the Zigma ERP Dashboard (React frontend + PHP backend). The dashboard displays key performance indicators (KPIs), pit status charts, tray status widgets, and overall status donut charts for a manufacturing/quality-control system.

## Current Implementation
- **Frontend**: React with Vite, ApexCharts, Bootstrap
- **Backend**: PHP API (`folders/dashboard/api.php`) with MySQL
- **Components**: `Dashboard.jsx`, `KPICard.jsx`, `PitStatusChart.jsx`, `TrayStatusWidget.jsx`, `OverallStatusChart.jsx`

## Improvement Areas

### 1. Performance & Optimization
- **Database Queries**: The API executes 7+ separate queries. Consider consolidating into fewer queries or using stored procedures.
- **Caching**: Implement Redis/file caching for dashboard data (e.g., cache for 5 minutes).
- **Lazy Loading**: Load chart data on demand rather than all at once.
- **Bundle Size**: Analyze and reduce React bundle size (tree-shaking, code splitting).

### 2. User Experience (UX)
- **Loading States**: Add skeleton loaders instead of generic spinners.
- **Error Boundaries**: Implement React error boundaries for graceful failure handling.
- **Responsive Design**: Improve mobile responsiveness (currently uses `row-cols-xxl-6`).
- **Accessibility**: Add ARIA labels, keyboard navigation, focus management.
- **Animations**: Add subtle transitions for KPI value changes.

### 3. Security
- **Hardcoded Credentials**: `api.php` contains database credentials in plain text. Move to environment variables or secure config.
- **SQL Injection**: Some queries use string interpolation (`$month`). Use prepared statements consistently.
- **XSS Prevention**: Ensure all dynamic content is properly escaped.
- **CORS**: Add proper CORS headers for API endpoints.

### 4. Code Quality
- **TypeScript**: Convert components to TypeScript for better type safety.
- **Testing**: Add unit tests for components and integration tests for API.
- **Error Handling**: Implement consistent error handling across API and frontend.
- **Code Duplication**: `api.php` and `form.php` have duplicated logic. Extract into shared functions.

### 5. Feature Enhancements
- **Date Range Comparison**: Add "Compare with previous period" toggle.
- **Export Functionality**: Add PDF/CSV export for dashboard data.
- **Real-time Updates**: Implement WebSocket or polling for live data.
- **Drill-down Improvements**: Make drill-down modals instead of new windows.
- **Custom Date Ranges**: Allow custom date ranges beyond month selection.

### 6. Maintainability
- **Environment Configuration**: Use `.env` files for database credentials and API URLs.
- **API Versioning**: Version the API (e.g., `/api/v1/dashboard`).
- **Documentation**: Add API documentation (OpenAPI/Swagger).
- **Logging**: Implement proper logging for errors and performance metrics.

## Prompt Template
Use this prompt to generate specific improvements:

```
Improve the Zigma ERP Dashboard by [SPECIFIC_IMPROVEMENT].

Current implementation:
- [File/Component]: [Current behavior]
- [Issue]: [What needs improvement]

Requirements:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Constraints:
- Maintain backward compatibility
- Follow existing code conventions
- Ensure security best practices
- Test the changes
```

## Example Prompts

### Example 1: Performance Optimization
```
Optimize the dashboard API performance by consolidating database queries.

Current: api.php executes 7 separate queries (pit_status, egg_process, tray_creation, external DB).
Issue: Multiple round-trips to database, no caching.

Requirements:
1. Combine related queries using JOINs where possible
2. Implement file-based caching for 5-minute intervals
3. Add cache invalidation on data updates

Constraints:
- Maintain same JSON response structure
- Keep external DB connection separate (different server)
- Add cache status header for debugging
```

### Example 2: Security Hardening
```
Remove hardcoded database credentials from api.php.

Current: Lines 8-11 contain plaintext credentials.
Issue: Security vulnerability, not following 12-factor app principles.

Requirements:
1. Move credentials to environment variables
2. Create .env.example file with placeholder values
3. Update api.php to read from process.env or getenv()

Constraints:
- Maintain same database connection logic
- Ensure .env files are in .gitignore
- Add error handling for missing environment variables
```

### Example 3: UX Enhancement
```
Add skeleton loaders to dashboard components.

Current: Shows generic spinner during loading.
Issue: Poor user experience, no visual feedback about content structure.

Requirements:
1. Create SkeletonCard component matching KPICard layout
2. Create SkeletonChart component matching chart dimensions
3. Show skeletons for 300ms minimum to prevent flash

Constraints:
- Use existing Bootstrap classes where possible
- Maintain responsive behavior
- Add smooth transition from skeleton to content
```

## Evaluation Criteria
When implementing improvements, ensure:
1. **Functionality**: All existing features continue to work
2. **Performance**: No regression in load times
3. **Security**: No new vulnerabilities introduced
4. **Maintainability**: Code is easier to understand and modify
5. **User Satisfaction**: Improvements are noticeable and valuable
