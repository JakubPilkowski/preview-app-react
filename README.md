# React App - Preview System

A modern React application built with Vite, TypeScript, and React 19, designed to provide a preview system for web content management.

## 🚀 Project Description

This React application serves as the frontend component of a comprehensive preview system. It provides an intuitive interface for managing and previewing web content, with real-time updates and seamless integration with the backend services.

### Key Features

- **Modern React 19**: Built with the latest React features and hooks
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast development and build tooling
- **Responsive Design**: Mobile-first approach with modern UI components
- **Real-time Updates**: Live preview capabilities
- **CloudFront Integration**: Global CDN for optimal performance
- **AWS Infrastructure**: Scalable cloud deployment

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.0.0
- **Build Tool**: Vite 6.0.0
- **Language**: TypeScript 5.8.2
- **Styling**: CSS Modules + Radix UI
- **State Management**: React Hooks
- **Routing**: React Router DOM 6.29.0
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

## 📦 Dependencies

### Core Dependencies

- `react`: 19.0.0
- `react-dom`: 19.0.0
- `react-router-dom`: 6.29.0
- `@preview-workspace/preview-lib`: ^2.2.3
- `@radix-ui/react-dialog`: ^1.1.14
- `nanoid`: ^5.1.5

### Development Dependencies

- `vite`: ^6.0.0
- `typescript`: ~5.8.2
- `vitest`: ^3.0.0
- `eslint`: ^9.8.0
- `prettier`: ^2.6.2

## 🏗️ Development Process

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS CLI (for deployment)
- Terraform (for infrastructure)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd react-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:4200`

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code (if using prettier)
npx prettier --write .
```

## 🚀 Deployment

### Infrastructure

The application is deployed on AWS using the following services:

- **S3**: Static file hosting
- **CloudFront**: Global CDN and caching
- **WAF**: Web Application Firewall for security
- **Route 53**: DNS management

### Deployment Process

1. **Infrastructure Deployment**: Terraform manages the AWS infrastructure
2. **Build Process**: Vite builds the application for production
3. **Asset Upload**: Static assets are uploaded to S3
4. **Cache Invalidation**: CloudFront cache is invalidated for immediate updates

### Environment Variables

Required environment variables for deployment:

```bash
# AWS Configuration
AWS_ACCOUNT_ID=your-aws-account-id
AWS_REGION=eu-north-1

# Infrastructure
INFRASTRUCTURE_S3_BUCKET_NAME=your-terraform-state-bucket
DYNAMODB_TABLE_NAME=your-terraform-locks-table
REACT_APP_BUCKET_NAME=your-react-app-bucket

# Application
NEXT_APP_DOMAIN=your-next-app-domain
```

## 📋 Versioning

This project uses [Semantic Versioning](https://semver.org/) with automated releases via semantic-release.

### Version Format

- `MAJOR.MINOR.PATCH` (e.g., 1.0.0)
- Automated based on commit messages

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Commit Types

- `feat`: New features (minor version bump)
- `fix`: Bug fixes (patch version bump)
- `docs`: Documentation changes (patch version bump)
- `style`: Code style changes (patch version bump)
- `refactor`: Code refactoring (patch version bump)
- `perf`: Performance improvements (patch version bump)
- `test`: Test changes (patch version bump)
- `chore`: Maintenance tasks (patch version bump)

### Release Process

1. **Automatic**: Releases are triggered automatically on successful deployments
2. **Manual**: Can be triggered manually via GitHub Actions
3. **Changelog**: Automatically generated from commit messages
4. **GitHub Release**: Creates GitHub releases with release notes

## 📝 Changelog

### [Unreleased]

### [0.0.0] - Initial Release

- Initial project setup with React 19 and Vite
- Basic routing and component structure
- AWS infrastructure configuration
- CI/CD pipeline setup
- Semantic release configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔗 Related Projects

- [Next.js App](./../next-app) - Next.js frontend application
- [Preview Server](./../preview-server) - NestJS backend API
- [Preview Workspace](./../preview-workspace) - Shared library package
