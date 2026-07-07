import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";

const DashboardLayout = ({ children }) => {
  return (
    <Suspense
      fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
    >
      {children}
    </Suspense>
  );
};

export default DashboardLayout;
