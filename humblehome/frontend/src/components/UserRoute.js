import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const UserRoute = ({ user, loading, children }) => {
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>; // or a spinner
  }

  if (!user || user.role === "admin") {
    toast.error("Unauthorized access");
    return <Navigate to="/" replace />;
  }
  return children;
};

export default UserRoute;
