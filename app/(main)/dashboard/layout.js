import React, { Suspense } from "react";
import { AccountsLoader } from "@/components/accounts-loader";

const DashboardLayout = ({ children }) => {
  return (
    <Suspense fallback={<AccountsLoader />}>
      {children}
    </Suspense>
  );
};

export default DashboardLayout;
