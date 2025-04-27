import { getDashboardData, getUserAccount } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React, { Suspense } from 'react'
import AccountCard from './_components/account-card'
import { getCurrentBudget } from '@/actions/budget'
import BudgetProgress from './_components/budget-progress'
import DashboardOverview from './_components/transaction-overview'

async function DashboardPage  ()  {

  const accounts = await getUserAccount()
  const defaultAccount = accounts?.find((account) => account.isDefault)
  let budgetData = null
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id)
  }

  const transactions = await getDashboardData()


  return (
    <div className="px-5 space-y-8">
      {/* budget Progress  */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpense={budgetData?.currentExpenses || 0}
        />
      )}




      {/* overview  */}
      <Suspense fallback={"Loading Overview..."} >
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      </Suspense>

      {/* Accounts Grid  */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <CreateAccountDrawer>
          <Card className='hover:shadow-md transition-shadow border-dashed cursor-pointer'>
            <CardContent className='flex items-center justify-center flex-col h-full text-muted-foreground pt-5'>
              <Plus className="h-10 w-10 mb-2" />
              <p className="test-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 && accounts?.map((account) => {
           return <AccountCard key={account.id} account={account} />
        })}

      </div>
    </div>
  );
}

export default DashboardPage