'use client'

import { useState } from 'react'
import { addItem, checkDuplicate } from '../actions'
import CategorySelector from './CategorySelector'
import DuplicateItemModal from './DuplicateItemModal'

export default function CustomItemForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Multimedia')
  const [quantity, setQuantity] = useState('')
  const [minStock, setMinStock] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicates, setDuplicates] = useState<any[] | null>(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!name.trim() || !category || !quantity || !minStock) {
      return
    }

    const qty = parseInt(quantity) || 0
    const target = parseInt(minStock) || 0

    if (qty < 0 || target < 0) {
      return
    }

    setIsSubmitting(true)

    // Check for duplicates first
    const existingDuplicates = await checkDuplicate(name.trim())
    
    if (existingDuplicates && existingDuplicates.length > 0) {
      // Show duplicate modal
      setDuplicates(existingDuplicates)
      setShowDuplicateModal(true)
      setIsSubmitting(false)
      return
    }

    // No duplicates, proceed with normal add
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('category', category)
    formData.append('quantity', qty.toString())
    formData.append('minStock', target.toString())

    const result = await addItem(formData)
    
    if (result && result.success) {
      // Reset form
      setName('')
      setCategory('')
      setQuantity('')
      setMinStock('')
    } else if (result && result.needsResolution) {
      setDuplicates(result.duplicates)
      setShowDuplicateModal(true)
    }
    
    setIsSubmitting(false)
  }

  const handleDuplicateResolved = () => {
    setName('')
    setCategory('')
    setQuantity('')
    setMinStock('')
    setShowDuplicateModal(false)
    setDuplicates(null)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        <input 
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          placeholder="Item Name" 
          title="Enter the name of the item you want to add"
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none" 
        />
        <CategorySelector name="category" value={category} onChange={(value) => setCategory(value)} />
        <input 
          name="quantity"
          type="number" 
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity" 
          required 
          title="Enter how many items you want to add"
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none" 
        />
        <input 
          name="minStock" 
          type="number" 
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          placeholder="Target Qty" 
          required 
          title="Set the minimum stock level you want to maintain for this item"
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none" 
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-100 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add this custom item to inventory with the specified quantity"
        >
          {isSubmitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>

      {/* Duplicate Item Modal */}
      {showDuplicateModal && duplicates && name && quantity && minStock && (
        <DuplicateItemModal
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false)
            setDuplicates(null)
          }}
          duplicates={duplicates}
          newItemName={name.trim()}
          newItemCategory={category}
          newItemQuantity={parseInt(quantity) || 0}
          newItemMinStock={parseInt(minStock) || 0}
          onResolved={handleDuplicateResolved}
        />
      )}
    </>
  )
}

