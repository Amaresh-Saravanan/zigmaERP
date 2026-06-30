# ZigmaERP - Enterprise Resource Planning System

**Complete, integrated ERP solution for medium to large organizations**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Tech Stack](https://img.shields.io/badge/tech-TypeScript%2FNode.js-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

ZigmaERP is a comprehensive, integrated Enterprise Resource Planning (ERP) system designed for medium to large organizations seeking to streamline and unify their business operations. Built with modern web technologies, ZigmaERP provides a single platform to manage finance, human resources, inventory, supply chain, and reporting across the entire organization.

Whether you're managing multi-location operations, complex supply chains, or diverse business units, ZigmaERP brings all critical functions into one powerful, intuitive system.

### Key Benefits

- **Unified Operations** - Single platform for all business functions
- **Real-time Insights** - Live dashboards and business intelligence
- **Scalable Architecture** - Grows with your organization
- **Industry-Standard Compliance** - Built for regulatory requirements
- **Customizable Workflows** - Adapt to your unique processes

---

## Core Modules

### 💰 Financial Management
- **General Ledger** - Chart of accounts, journal entries, balance sheets
- **Accounts Payable** - Vendor management, invoice processing, payment scheduling
- **Accounts Receivable** - Customer invoicing, payment tracking, aging reports
- **Expense Management** - Budget tracking, approval workflows, cost analysis
- **Fixed Assets** - Asset inventory, depreciation, maintenance tracking
- **Financial Reporting** - Customizable reports, KPI dashboards, audit trails

### 👥 Human Resources
- **Employee Management** - Personal records, documents, skills tracking
- **Payroll Processing** - Salary calculation, tax withholding, deductions
- **Attendance & Timekeeping** - Shift management, time tracking, leave approvals
- **Performance Management** - Goal setting, reviews, competency assessments
- **Recruitment** - Job posting, applicant tracking, onboarding
- **Training & Development** - Course management, compliance tracking

### 📦 Inventory Management
- **Stock Control** - Real-time inventory levels, automated reorder points
- **Warehouse Management** - Multi-location tracking, bin management, cycle counting
- **Material Planning** - Demand forecasting, stock optimization, safety stock
- **Product Master** - SKU management, categorization, barcode support
- **Stock Movements** - Transfer tracking, goods receipt, issue management

### 🚚 Supply Chain Management
- **Vendor Management** - Supplier profiles, performance metrics, scorecards
- **Purchase Orders** - Requisition, PO generation, approval workflows
- **Procurement** - Competitive bidding, contract management, price negotiation
- **Order Tracking** - Real-time shipment visibility, delivery management
- **Logistics** - Carrier management, freight tracking, shipping optimization

### 📊 Reporting & Analytics
- **Custom Reports** - Drag-and-drop report builder, scheduled distribution
- **Dashboards** - Real-time KPI tracking, drill-down analysis
- **Business Intelligence** - Data warehouse, predictive analytics
- **Compliance Reports** - Tax, audit, regulatory reporting
- **Data Export** - Multiple formats (PDF, Excel, CSV)

---

## Technical Specifications

### System Requirements

**Server Requirements:**
- Node.js 18+ or equivalent backend runtime
- 4GB RAM minimum (8GB+ recommended for production)
- 50GB storage minimum
- PostgreSQL 12+ or MySQL 8.0+ or equivalent database

**Client Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum 2GB RAM available
- Stable internet connection (LAN recommended for production use)

### Technology Stack

**Frontend:**
- TypeScript for type safety
- React/Vue/Angular framework (check package.json)
- Responsive UI framework (Bootstrap/Material UI/Tailwind CSS)
- State management (Redux/Context API/Vuex)
- Data visualization library (Chart.js/Recharts)

**Backend:**
- Node.js runtime
- Express.js or equivalent framework
- RESTful API architecture
- JWT authentication

**Database:**
- Relational database (PostgreSQL/MySQL)
- ACID compliance for transactional integrity
- Optimized indexing for performance
- Automated backup and recovery

**Infrastructure:**
- Docker containerization support
- Microservices-ready architecture
- Horizontal scaling capability

---

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have:
- Git installed
- Node.js v18+ (`node --version`)
- npm v9+ or yarn (`npm --version`)
- A database server (PostgreSQL or MySQL)
- Administrator access for installation

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/Amaresh-Saravanan/zigmaERP.git
cd zigmaERP
```

2. **Install Dependencies**
```bash
npm install
# or if using yarn
yarn install
```

3. **Configure Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zigmaerp
DB_USER=erpadmin
DB_PASSWORD=your_secure_password

# API Configuration
API_PORT=3000
NODE_ENV=development
API_TIMEOUT=30000

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

4. **Set Up Database**
```bash
# Initialize database schema
npm run db:init

# Seed sample data (optional)
npm run db:seed

# Run migrations
npm run db:migrate
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

6. **Default Login Credentials**
```
Username: admin
Password: admin123  # Change immediately after first login!
Email: admin@zigmaerp.local
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start

# Build Docker image (if supported)
docker build -t zigmaerp:latest .
docker run -p 3000:3000 zigmaerp:latest
```

---

## Project Structure

```
zigmaERP/
├── src/
│   ├── api/                      # Backend API endpoints
│   │   ├── routes/              # Route definitions
│   │   │   ├── accounts.js       # A/P and A/R routes
│   │   │   ├── inventory.js      # Inventory routes
│   │   │   ├── payroll.js        # Payroll routes
│   │   │   ├── purchasing.js     # Purchase order routes
│   │   │   └── reporting.js      # Reports and dashboards
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Custom middleware
│   │   └── validators/          # Input validation
│   ├── models/                   # Database schemas
│   │   ├── Account.js
│   │   ├── Employee.js
│   │   ├── Inventory.js
│   │   ├── PurchaseOrder.js
│   │   └── VendorMaster.js
│   ├── services/                 # Business logic
│   │   ├── accountingService.js
│   │   ├── payrollService.js
│   │   ├── inventoryService.js
│   │   └── reportingService.js
│   ├── database/                 # Database configuration
│   │   ├── migrations/          # Schema migrations
│   │   └── seeds/               # Seed data
│   └── utils/                    # Utility functions
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── components/          # React/Vue components
│   │   ├── pages/               # Page layouts
│   │   ├── stores/              # State management
│   │   └── utils/
│   └── public/                  # Static assets
├── docs/                         # Documentation
│   ├── API.md                   # API documentation
│   ├── INSTALLATION.md          # Setup guide
│   └── USER_GUIDE.md            # User manual
├── tests/                        # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/                       # Docker configuration
├── .env.example                  # Environment template
├── package.json
└── README.md
```

---

## API Documentation

### Authentication

All API requests require JWT token authentication:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Response includes `accessToken` and `refreshToken`

### Core Endpoints

**Financial Management:**
- `POST /api/accounts/journals` - Create journal entry
- `GET /api/accounts/ledger` - View general ledger
- `GET /api/accounts/invoices` - List invoices
- `POST /api/accounts/payments` - Record payment

**Inventory:**
- `GET /api/inventory/stock` - Current stock levels
- `POST /api/inventory/transfers` - Transfer stock
- `GET /api/inventory/reorder-points` - Reorder analysis

**Payroll:**
- `POST /api/payroll/run` - Execute payroll
- `GET /api/payroll/salaryslips` - Generate slips
- `POST /api/payroll/tax-calculations` - Calculate taxes

**Purchasing:**
- `POST /api/purchase/orders` - Create PO
- `GET /api/purchase/orders/:id` - Track order
- `POST /api/purchase/receipts` - Record GRN

See [API_DOCUMENTATION.md](./docs/API.md) for complete endpoint list.

---

## Configuration Guide

### Role-Based Access Control

Define user roles in `config/roles.json`:
```json
{
  "Finance Manager": {
    "permissions": ["view_ledger", "approve_invoices", "manage_accounts"]
  },
  "Inventory Manager": {
    "permissions": ["view_stock", "manage_transfers", "approve_orders"]
  },
  "HR Manager": {
    "permissions": ["manage_employees", "process_payroll", "view_reports"]
  }
}
```

### Customizing Workflows

Workflows are configured in the admin dashboard:
1. Navigate to Settings → Workflows
2. Create workflow rules (approval chains, notifications)
3. Define triggers and actions
4. Test before deploying

### Multi-Location Setup

For organizations with multiple locations:
```env
ENABLE_MULTI_LOCATION=true
LOCATION_CURRENCY_MAPPING=true
INTER_LOCATION_TRANSFERS=true
```

---

## Usage Examples

### Creating a Purchase Order

```bash
curl -X POST http://localhost:3000/api/purchase/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "V001",
    "items": [
      {
        "productId": "P123",
        "quantity": 100,
        "unitPrice": 50.00
      }
    ],
    "deliveryDate": "2026-07-15",
    "approvers": ["manager@company.com"]
  }'
```

### Processing Payroll

1. Go to Payroll → Run Payroll
2. Select pay period (e.g., June 2026)
3. Review employee data and deductions
4. Calculate taxes and benefits
5. Generate salary slips
6. Approve and process

### Generating Financial Report

1. Navigate to Reports → Financial
2. Select report type (P&L, Balance Sheet, Trial Balance)
3. Choose date range and filters
4. Click "Generate"
5. Export to PDF or Excel

---

## Features Roadmap

### Phase 1 (Current)
- ✅ Core financial management
- ✅ Inventory tracking
- ✅ Payroll processing
- ✅ Purchase order management
- ✅ Basic reporting

### Phase 2 (Planned)
- 🔄 Advanced analytics and BI
- 🔄 Mobile app for field operations
- 🔄 Automated approval workflows
- 🔄 Multi-currency support
- 🔄 Enhanced security (2FA, SSO)

### Phase 3 (Future)
- ⏳ AI-powered forecasting
- ⏳ Integration marketplace
- ⏳ Advanced CRM features
- ⏳ Supply chain optimization
- ⏳ Industry-specific modules (Manufacturing, Retail)

---

## Development

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Linting and Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run TypeScript compiler check
npm run type-check
```

### Database Migrations

```bash
# Create new migration
npm run db:migrate:create --name=add_new_field

# Run pending migrations
npm run db:migrate:up

# Rollback last migration
npm run db:migrate:down
```

---

## Deployment

### Docker Deployment

```dockerfile
# Build image
docker build -t zigmaerp:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=postgres \
  -e NODE_ENV=production \
  --name zigmaerp \
  zigmaerp:latest
```

### Cloud Deployment Options

- **AWS:** Use EC2, RDS, and load balancer
- **Azure:** Deploy to App Service with SQL Database
- **Google Cloud:** Use Compute Engine with Cloud SQL
- **DigitalOcean:** App Platform for simplified deployment

### Production Checklist

- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Enable audit logging
- [ ] Configure email notifications
- [ ] Test disaster recovery procedures
- [ ] Set up monitoring and alerts
- [ ] Configure CDN for static assets

---

## Performance & Scalability

### Performance Optimization

- **Database Indexing** - Optimized queries for large datasets
- **Caching Layer** - Redis for frequently accessed data
- **API Pagination** - Handle large result sets efficiently
- **Lazy Loading** - Load data on demand
- **CDN Integration** - Static assets served from edge locations

### Scaling Guidelines

- **Vertical Scaling:** Add CPU/RAM resources
- **Horizontal Scaling:** Load balance across multiple servers
- **Database:** Use replication and sharding for large datasets
- **Search:** Implement Elasticsearch for advanced searching

---

## Security

### Built-in Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all transactions
- ✅ Data encryption at rest
- ✅ HTTPS/TLS for data in transit
- ✅ SQL injection prevention
- ✅ CSRF protection

### Security Best Practices

1. **Change Default Credentials** - Immediately after installation
2. **Enable HTTPS** - Use valid SSL certificates
3. **Regular Backups** - Automated daily backups
4. **Update Dependencies** - Keep packages current
5. **Monitor Access** - Review audit logs regularly
6. **Restrict Database Access** - Firewall rules
7. **Employee Training** - Security awareness for users

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database Connection Error**
```bash
# Verify database is running
psql -h localhost -U erpadmin -d zigmaerp -c "SELECT 1;"
# Check credentials in .env file
```

**Out of Memory Error**
```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

**Missing Migrations**
```bash
npm run db:migrate:up
```

For more issues, check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Make** your changes following code standards
4. **Test** thoroughly (`npm run test`)
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open** a pull request

### Areas We Need Help With

- 🐛 Bug fixes and issue resolution
- ✨ New module development
- 📊 Report template improvements
- ♿ Accessibility enhancements
- 📖 Documentation and user guides
- 🧪 Test coverage expansion
- 🌍 Localization support (multiple languages)
- 🚀 Performance optimization

### Code Standards

- Follow ESLint configuration
- Use TypeScript for type safety
- Write unit tests for new features
- Document API endpoints
- Update README for major changes

---

## Support

- **📧 Email:** amareshsaravanan2617@gmail.com
- **🐛 Issues:** [GitHub Issues](https://github.com/Amaresh-Saravanan/zigmaERP/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/Amaresh-Saravanan/zigmaERP/discussions)
- **📚 Documentation:** [Full Docs](./docs)

---

## Changelog

### v1.0.0 (Current)
- Core ERP modules
- Financial management
- Inventory management
- Payroll processing
- Purchase orders
- Reporting

### v0.9.0
- Initial beta release
- Core functionality testing
- Security audits

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), and [TypeScript](https://www.typescriptlang.org/)
- Database: [PostgreSQL](https://www.postgresql.org/) / [MySQL](https://www.mysql.com/)
- Inspired by industry-leading ERP systems
- Thanks to contributors and community feedback

---

## Disclaimer

ZigmaERP is provided as-is for business operations management. Users are responsible for:
- Data backup and recovery
- Compliance with local regulations
- Proper access control and authentication
- Regular system maintenance and updates
- Security of credentials and API keys

---

**Version:** 1.0.0  
**Last Updated:** June 30, 2026  
**Status:** 🟢 Production Ready  
**Maintenance:** Active

---

*Questions or feedback? Open an issue or contact us! We're here to help.* 🚀
