# Contributing to MusIQ

Thank you for your interest in contributing to MusIQ! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Contributions](#making-contributions)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/MusicApp.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your meaningful commit message"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (or Neon DB connection)
- Xcode (for iOS development)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
# Open MusicApp.xcodeproj in Xcode
# Configure environment variables in Xcode scheme settings
# Build and run from Xcode
```

### ETL Setup

```bash
cd etl
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run etl
```

### Web App Setup

```bash
cd webapp
npm install
npm run dev
```

## Project Structure

```
MusicApp/
├── backend/          # Node.js/Express API server
├── frontend/         # SwiftUI iOS application
├── etl/              # MusicBrainz ETL pipeline
├── webapp/           # Next.js web application
└── LICENSE           # MIT License
```

## Making Contributions

### Reporting Bugs

- Use the GitHub issue tracker
- Include a clear title and description
- Provide steps to reproduce the bug
- Include environment details (OS, Node version, etc.)
- Add screenshots if applicable

### Suggesting Features

- Open an issue with the "enhancement" label
- Clearly describe the feature and its use case
- Discuss the implementation approach if you have ideas

### Code Contributions

1. Check existing issues and pull requests to avoid duplicates
2. Create a feature branch from `main`
3. Make focused, atomic commits
4. Write or update tests as needed
5. Update documentation if necessary
6. Ensure all tests pass
7. Submit a pull request

## Coding Standards

### TypeScript/JavaScript (Backend, ETL, Web App)

- Follow ESLint configuration
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused
- Handle errors appropriately

### Swift (iOS Frontend)

- Follow Swift style guidelines
- Use meaningful names
- Keep functions and classes focused
- Add documentation comments for public APIs
- Handle errors with proper error types

### General

- Write clear, self-documenting code
- Add comments for complex logic
- Follow existing code patterns
- Keep commits focused and atomic
- Write tests for new features

## Commit Guidelines

Use clear, descriptive commit messages:

```
feat: Add user profile editing functionality
fix: Resolve authentication token refresh issue
docs: Update API documentation
style: Format code with prettier
refactor: Simplify music service logic
test: Add unit tests for rating service
chore: Update dependencies
```

## Pull Request Process

1. **Update your branch**: Rebase on `main` to ensure your changes are up to date
2. **Write a clear description**: Explain what changes you made and why
3. **Reference issues**: Link to any related issues
4. **Test your changes**: Ensure everything works as expected
5. **Request review**: Assign reviewers and wait for feedback
6. **Address feedback**: Make requested changes and respond to comments
7. **Squash commits**: Clean up commit history if requested

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] Changes tested locally

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Check existing documentation
- Review existing code for examples

Thank you for contributing to MusIQ!

