# Personality Assessment Platform

This is a Next.js application for taking and tracking personality assessments.

## Features

- **Personalized Insights**: Curated assessments to understand communication and collaboration styles.
- **Progress Tracking**: Monitor self-perception evolution over time.
- **Responsive Design**: Optimized for all devices.
- **Interactive UI**: Smooth animations and engaging user experience.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Animation**: Framer Motion
- **Deployment**: Docker

## Getting Started

### Local Development

1. Navigate to the web app directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Docker

Build and run the container using Docker Compose:

```bash
docker-compose up --build
```

## Project Structure

- `apps/web/`: Main Next.js application code.
  - `pages/`: Next.js pages and API routes.
  - `styles/`: Global and module CSS files.
  - `data/`: Static data or content.
  - `lib/`: Shared libraries and utilities.

## License

MIT
