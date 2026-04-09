import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import News from "./News";

const formatDate = (date) => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }
  return parsedDate.toISOString().split("T")[0];
};

const today = formatDate(new Date());
const yesterday = formatDate(new Date(Date.now() - 86400000));

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

function App() {
  const [query, setQuery] = useState("World");
  const [category, setCategory] = useState("World");
  const [selectedDate, setSelectedDate] = useState(yesterday);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("publishedAt");
  const debouncedQuery = useDebounce(query, 500);
  const abortControllerRef = useRef(null);

  const fetchNews = useCallback(
    async (searchCategory, searchDate, sortOption) => {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;

      if (!apiKey) {
        setError(
          "News API key is missing. Add VITE_NEWS_API_KEY to your .env file.",
        );
        setArticles([]);
        setLoading(false);
        return;
      }

      const normalizedDate = formatDate(searchDate);
      if (!normalizedDate) {
        setError("Please select a valid date.");
        setArticles([]);
        setLoading(false);
        return;
      }

      // Cancel previous request if pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        searchCategory,
      )}&from=${normalizedDate}&to=${normalizedDate}&sortBy=${sortOption}&pageSize=30&apiKey=${apiKey}`;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const message =
            response.status === 426
              ? "API quota exceeded. Try again later or upgrade your plan."
              : response.status === 401
                ? "Invalid API key. Check your .env configuration."
                : `API error: ${response.status} ${response.statusText}`;
          throw new Error(message);
        }

        const news = await response.json();
        const fetchedArticles = news.articles ?? [];

        if (fetchedArticles.length === 0) {
          setError(
            `No articles found for "${searchCategory}" on ${normalizedDate}. Try a different topic or date.`,
          );
          setArticles([]);
        } else {
          setArticles(fetchedArticles);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setArticles([]);
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchNews(debouncedQuery || "World", selectedDate, sortBy);
    setCategory(debouncedQuery || "World");
  }, [debouncedQuery, selectedDate, sortBy, fetchNews]);

  const handleSearch = useCallback(
    (event) => {
      event.preventDefault();
      if (query.trim()) {
        fetchNews(query.trim(), selectedDate, sortBy);
      }
    },
    [query, selectedDate, sortBy, fetchNews],
  );

  const handleReset = useCallback(() => {
    setQuery("World");
    setCategory("World");
    setSelectedDate(yesterday);
    setSortBy("publishedAt");
    setArticles([]);
    setError(null);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !loading) {
        handleSearch(e);
      }
    },
    [handleSearch, loading],
  );

  const sortedArticles = articles;

  return (
    <div className="App">
      <header className="header">
        <div>
          <h1>News Pulse</h1>
          <p className="subtitle">Search by topic and choose the news date.</p>
        </div>

        <form className="controls" onSubmit={handleSearch}>
          <label className="control-group">
            <span>Topic</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="World, Technology, Sports..."
              aria-label="Search topic"
            />
          </label>

          <label className="control-group">
            <span>Date</span>
            <input
              type="date"
              value={selectedDate}
              max={yesterday}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Select news date"
            />
          </label>

          <label className="control-group">
            <span>Sort By</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort articles by"
            >
              <option value="publishedAt">Latest</option>
              <option value="popularity">Popular</option>
              <option value="relevancy">Relevant</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="btn-secondary"
          >
            Reset
          </button>
        </form>
      </header>

      <div className="status-bar">
        {error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="info">
            Showing {sortedArticles.length} news for <strong>{category}</strong>{" "}
            on <strong>{selectedDate}</strong>
          </div>
        )}
      </div>

      <section className="articles-grid">
        {Array.isArray(sortedArticles) && sortedArticles.length > 0
          ? sortedArticles.map((article, index) => (
              <News
                article={article}
                key={article.url ?? `${article.title}-${index}`}
              />
            ))
          : !loading &&
            !error && (
              <div className="empty-state">
                <p>No articles to display. Try searching for a topic.</p>
              </div>
            )}
      </section>
    </div>
  );
}

export default App;
