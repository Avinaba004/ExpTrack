import { checkUser } from "@/lib/checkUser";
import { InvestmentDashboard } from "@/features/investment/components/InvestmentDashboard";

export default async function InvestmentPage() {
  await checkUser();

  return <InvestmentDashboard />;
}
