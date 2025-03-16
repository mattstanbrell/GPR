type AuditLogsPaginationProps = {
  currentPage: number;
  totalPages: number;
  updatePage: (page: number) => void;
};

const AuditLogsPagination = ({ currentPage, totalPages, updatePage }: AuditLogsPaginationProps) => {
  <nav className="govuk-pagination" aria-label="Pagination">
  <div className="govuk-pagination__prev">
    <button
      className="govuk-link govuk-pagination__link"
      onClick={() => updatePage(currentPage - 1)}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
        <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
      </svg>
      <span className="govuk-pagination__link-title">
        Previous<span className="govuk-visually-hidden"> page</span>
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
        Next
      </span>
      <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
        <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
      </svg>
    </button>
  </div>
</nav>
}

export default AuditLogsPagination;