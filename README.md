# News Pulse

A React + Vite app for browsing news articles using the News API.

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with your News API key:
   ```env
   VITE_NEWS_API_KEY=your_actual_api_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Notes

- Get a free API key from [News API](https://newsapi.org/).
- The app fetches articles for the entered topic and selected date.
- Do not commit your `.env` file; it is already ignored by `.gitignore`.
