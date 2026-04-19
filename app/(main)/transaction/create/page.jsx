import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/transaction-form";

const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();
  const isEditing = !!searchParams?.edit;
  
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
        {isEditing ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm accounts={accounts} categories={defaultCategories} />
    </div>
  );
};

export default AddTransactionPage;
