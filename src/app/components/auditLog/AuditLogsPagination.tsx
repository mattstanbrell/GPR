type AuditLogsPaginationProps = {
  currentPage: number;
  totalPages: number;
  updatePage: (page: number) => void;
};

const AuditLogsPagination = ({ currentPage, totalPages, updatePage }: AuditLogsPaginationProps) => {
  // Function to generate pagination items
  const getPaginationItems = () => {
    const items = [];

    // Always show the first page
    items.push(1);

    // Show "..." if currentPage is far from the start
    if (currentPage > 3) {
      items.push("...");
    }

    // Show pages around the current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(i);
    }

    // Show "..." if currentPage is far from the end
    if (currentPage < totalPages - 2) {
      items.push("...");
    }

    // Always show the last page
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  return (
    <nav className="govuk-pagination" aria-label="Pagination">
      {/* Previous Button */}
      <div className="govuk-pagination__prev">
        <button
          className="govuk-link govuk-pagination__link"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <span className="govuk-pagination__link-title">
            &lt;&lt; Previous
          </span>
        </button>
      </div>

      {/* Pagination Items */}
      <ul className="govuk-pagination__list">
        {getPaginationItems().map((item, index) => (
          <li
            key={index}
            className={`govuk-pagination__item ${
              item === currentPage ? "govuk-pagination__item--current" : ""
            }`}
          >
            {item === "..." ? (
              <span className="govuk-pagination__ellipsis">...</span>
            ) : (
              <button
                className="govuk-link govuk-pagination__link"
                onClick={() => updatePage(item as number)}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Next Button */}
      <div className="govuk-pagination__next">
        <button
          className="govuk-link govuk-pagination__link"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span className="govuk-pagination__link-title">
            Next &gt;&gt;
          </span>
        </button>
      </div>
    </nav>
  );
};

export default AuditLogsPagination;