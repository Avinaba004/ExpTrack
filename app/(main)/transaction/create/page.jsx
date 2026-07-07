import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/transaction-form";

const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();
  const isEditing = !!searchParams?.edit;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEditing ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? "Update the details of your transaction." : "Record a new income or expense entry."}
        </p>
      </div>

      <AddTransactionForm accounts={accounts} categories={defaultCategories} />
    </div>
  );
};

export default AddTransactionPage;
