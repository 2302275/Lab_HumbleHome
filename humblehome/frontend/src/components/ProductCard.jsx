import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const ProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="block product-card">
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
      <div className="relative">
        <img
          src={`/api/${product.thumbnail_image}`}
          alt={product.name}
          className="w-full h-64 object-cover mb-3 rounded"
        />
        <span className="absolute top-2 left-2 bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded">
          {product.tag}
        </span>
      </div>
      <h3 className="text-sm text-gray-500">{product.brand}</h3>
      <p className="text-lg font-medium">{product.name}</p>
      <p className="text-blue-600">{product.price}</p>
    </div>
  </Link>
);


ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    thumbnail_image: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default ProductCard;
