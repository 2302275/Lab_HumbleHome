import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

const AdminRoute = ({ user, loading, children }) => {
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>; // or a spinner
  }

  if (!user || user.role !== "admin") {
    toast.error("Unauthorized accesss");
    return <Navigate to="/" replace />;
  }
  return children;
};

AdminRoute.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }),
  loading: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
