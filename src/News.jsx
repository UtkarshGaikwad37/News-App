export default function News({ article }) {
  const title = article.title ?? "Untitled article";
  const description = article.description
    ? `${article.description.substring(0, 120)}...`
    : "No description available.";
  const sourceName = article.source?.name ?? "Unknown source";
  const author = article.author ?? "Unknown author";
  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString()
    : "Unknown date";

  return (
    <article className="news">
      <div className="new-img">
        {article.urlToImage ? (
          <img className="img" src={article.urlToImage} alt={title} />
        ) : (
          <div className="img placeholder">No image available</div>
        )}
      </div>

      <div className="content">
        <h4>{title}</h4>
        <p>{description}</p>

        <div className="source">
          <span>{sourceName}</span>
          <span>{publishedAt}</span>
        </div>

        {article.url ? (
          <a
            className="read-more"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read full article
          </a>
        ) : null}

        <p className="author">Author: {author}</p>
      </div>
    </article>
  );
}
