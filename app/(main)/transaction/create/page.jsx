import { getUserAccount } from '@/actions/dashboard'
import React from 'react'
import AddTransactionForm from '../_components/transaction-form'
import { defaultCategories } from '@/data/categories'
import { getTransaction } from '@/actions/transaction'

const AddTransactionPage = async ({searchParams}) => {
  const accounts = await getUserAccount()
  
const searchParamsResolved = await searchParams;
const editId = searchParamsResolved?.edit;
  let initialData = null
  if (editId) {
    const transaction = await getTransaction(editId)
    initialData = transaction
  }

  return (
      <div className='max-w-3xl mx-auto px-5'>
          <h1 className='text-5xl gradient-title mb-8'>{editId ? "Update":  "Add"} Transaction</h1>
          <AddTransactionForm
              accounts={accounts}
        categories={defaultCategories}
        initialData={initialData}
        editMode={!!editId}
          />
    </div>
  )
}

export default AddTransactionPage