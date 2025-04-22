import { getUserAccount } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/account-card'

async function DashboardPage  ()  {

  const accounts = await getUserAccount()

  return (
    <div className="px-5">
      {/* budget Progress  */}
      {/* overview  */}
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