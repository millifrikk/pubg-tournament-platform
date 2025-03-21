# Contributing to PUBG Tournament Platform

Thank you for considering contributing to the PUBG Tournament Platform! This document will guide you through the contribution process.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/millifrikk/pubg-tournament-platform.git
   cd pubg-tournament-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Update the values with your own configuration

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code that follows the project's style and conventions
   - Update or add tests as needed
   - Update documentation if necessary

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

4. **Pull latest changes from main branch**
   ```bash
   git pull origin main
   ```

5. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Navigate to the GitHub repository
   - Click "Pull Request"
   - Select your branch and provide a description of your changes
   - Reference any related issues

## Coding Guidelines

- Follow the existing code style and formatting
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Follow the React hooks patterns for components
- Use TypeScript types/interfaces for props and state

## Commit Message Guidelines

- Use clear and meaningful commit messages
- Start with a verb in present tense (e.g., "Add feature", "Fix bug", "Update docs")
- Reference issue numbers when applicable (e.g., "Fix login bug, closes #123")

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Make sure your code follows project conventions
4. Wait for code review and address any requested changes
5. Once approved, your PR will be merged

## Development Roadmap

For information about the current development focus and upcoming features, please refer to the [Development Plan](./DevelopmentPlan.md).

## Issue Reporting

If you find a bug or want to request a feature:

1. Check if the issue already exists in the GitHub issues
2. If not, create a new issue with a clear description and steps to reproduce (for bugs)
3. Use labels to categorize the issue appropriately

## Contact

If you have questions about contributing, please reach out to the repository owners.

Thank you for your contribution!
