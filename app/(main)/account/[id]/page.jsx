import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import AccountChart from "../_components/account-chart";

const AccountsPage = async ({params , searchParams}) => { //We can get the params from context and then id from params.id
  const {id} = await params
  const page = parseInt((await searchParams).page || "1")
  const limit = 10

  const paginatedData = await getAccountWithTransactions(id, page, limit)
  const fullData = await getAccountWithTransactions(id, null, null)
  
  if(!paginatedData) notFound()

  
  const { transactions, totalTransactions, ...account } = paginatedData
  const fullTransactions = fullData.transactions
  
  const totalPages = Math.ceil(totalTransactions / limit)
  

  return (
    <div className="space-y-8 px-5">
      <div className="flex items-end justify-between gap-4">
        <div className="">
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account{" "}
          </p>
        </div>
        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{parseFloat(account.balance).toFixed(2)}{" "}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
       <Suspense
        fallback={<BarLoader width={"100%"} color="#36d399" className="mt-4" />}
      >
        <AccountChart transactions={fullTransactions} /> 
      </Suspense>   

      {/* Transaction Table  */}
      <Suspense
        fallback={<BarLoader width={"100%"} color="#36d399" className="mt-4" />}
      >
        <TransactionTable
          transactions={transactions}
          currentPage={page}
          totalPages={totalPages}
          accountId={id}
        />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
