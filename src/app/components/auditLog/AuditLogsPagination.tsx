type AuditLogsPaginationProps = {
  currentPage: number;
  totalPages: number;
  updatePage: (page: number) => void;
};

const AuditLogsPagination = ({ currentPage, totalPages, updatePage }: AuditLogsPaginationProps) => {
  return (
    <nav className="govuk-pagination" aria-label="Pagination">

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

      <ul className="govuk-pagination__list">
        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index + 1} className={`govuk-pagination__item ${currentPage === index + 1 ? 'govuk-pagination__item--current' : ''}`}>
            <button
              className="govuk-link govuk-pagination__link"
              onClick={() => updatePage(index + 1)}
              aria-label={`Page ${index + 1}`}
              aria-current={currentPage === index + 1 ? 'page' : undefined}
            >
              {index + 1}
            </button>
          </li>
        ))}
      </ul>

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