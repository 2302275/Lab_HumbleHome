

const PaginationControls = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        <i className="fas fa-chevron-left mr-1"></i> Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        Next <i className="fas fa-chevron-right ml-1"></i>
      </button>
    </div>
  );
};

export default PaginationControls;