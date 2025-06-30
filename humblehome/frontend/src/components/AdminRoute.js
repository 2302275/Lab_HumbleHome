import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminRoute = ({ user, children }) => {
  if (!user || user.role !== "admin") {
    toast.error("Unauthorized access");
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;