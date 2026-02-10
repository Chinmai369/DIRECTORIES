import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import EmployeeDetailPage from "../pages/employee/[id]/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/employee/:id",
    element: <EmployeeDetailPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
