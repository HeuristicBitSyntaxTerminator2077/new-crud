'use client'

import { useState } from 'react'
import { X, Merge, Edit, Plus } from 'lucide-react'
import { consolidateItem, addItem } from '../actions'

interface DuplicateItem {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  status: string
  createdAt: Date | string
}

interface DuplicateItemModalProps {
  isOpen: boolean
  onClose: () => void
  duplicates: DuplicateItem[]
  newItemName: string
  newItemCategory: string
  newItemQuantity: number
  newItemMinStock: number
  onResolved: () => void
}

export default function DuplicateItemModal({
  isOpen,
  onClose,
  duplicates,
  newItemName,
  newItemCategory,
  newItemQuantity,
  newItemMinStock,
  onResolved
}: DuplicateItemModalProps) {
  const [selectedAction, setSelectedAction] = useState<'consolidate' | 'rename' | 'proceed' | null>(null)
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<number | null>(null)
  const [newName, setNewName] = useState(newItemName)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleConsolidate = async () => {
    if (!selectedDuplicateId) return
    
    setIsProcessing(true)
    const success = await consolidateItem(selectedDuplicateId, newItemQuantity, newItemMinStock)
    setIsProcessing(false)
    
    if (success) {
      onResolved()
      onClose()
    } else {
      alert('Failed to consolidate items. Please try again.')
    }
  }

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === newItemName) {
      alert('Please enter a different name')
      return
    }

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('name', newName.trim())
    formData.append('category', newItemCategory)
    formData.append('quantity', newItemQuantity.toString())
    formData.append('minStock', newItemMinStock.toString())
    
    const result = await addItem(formData, true)
    setIsProcessing(false)
    
    if (result.success) {
      onResolved()
      onClose()
    } else {
      alert('Failed to add item. Please try again.')
    }
  }

  const handleProceed = async () => {
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('name', newItemName)
    formData.append('category', newItemCategory)
    formData.append('quantity', newItemQuantity.toString())
    formData.append('minStock', newItemMinStock.toString())
    
    const result = await addItem(formData, true)
    setIsProcessing(false)
    
    if (result.success) {
      onResolved()
      onClose()
    } else {
      alert('Failed to add item. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Duplicate Item Detected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              An item named "<span className="font-medium">{newItemName}</span>" already exists in your inventory.
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close dialog"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Items */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Existing Items:</h4>
          <div className="space-y-2">
            {duplicates.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedAction === 'consolidate' && selectedDuplicateId === item.id
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Category: {item.category} | Qty: {item.quantity} | Target: {item.minStock} | Status: {item.status}
                    </div>
                  </div>
                  {selectedAction === 'consolidate' && (
                    <button
                      onClick={() => setSelectedDuplicateId(item.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        selectedDuplicateId === item.id
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                      }`}
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Item Info */}
        <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">New Item to Add:</h4>
          <div className="text-xs text-indigo-700 dark:text-indigo-400">
            Name: {newItemName} | Category: {newItemCategory} | Qty: {newItemQuantity} | Target: {newItemMinStock}
          </div>
        </div>

        {/* Action Options */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Choose an action:</h4>
          
          {/* Consolidate Option */}
          <div className="border-2 rounded-lg p-4 transition"
            style={{
              borderColor: selectedAction === 'consolidate' ? 'rgb(99, 102, 241)' : 'rgb(226, 232, 240)',
              backgroundColor: selectedAction === 'consolidate' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="action"
                checked={selectedAction === 'consolidate'}
                onChange={() => {
                  setSelectedAction('consolidate')
                  setSelectedDuplicateId(duplicates[0]?.id || null)
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Merge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Consolidate (Merge)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Add the new quantity to an existing item. The target will be set to the higher value.
                </p>
                {selectedAction === 'consolidate' && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Select which item to merge with:</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Rename Option */}
          <div className="border-2 rounded-lg p-4 transition"
            style={{
              borderColor: selectedAction === 'rename' ? 'rgb(99, 102, 241)' : 'rgb(226, 232, 240)',
              backgroundColor: selectedAction === 'rename' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="action"
                checked={selectedAction === 'rename'}
                onChange={() => setSelectedAction('rename')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Rename & Add</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  Add as a new item with a different name.
                </p>
                {selectedAction === 'rename' && (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
                  />
                )}
              </div>
            </label>
          </div>

          {/* Proceed Anyway Option */}
          <div className="border-2 rounded-lg p-4 transition"
            style={{
              borderColor: selectedAction === 'proceed' ? 'rgb(99, 102, 241)' : 'rgb(226, 232, 240)',
              backgroundColor: selectedAction === 'proceed' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="action"
                checked={selectedAction === 'proceed'}
                onChange={() => setSelectedAction('proceed')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Add Anyway</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Create a duplicate entry with the same name (not recommended).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedAction === 'consolidate') handleConsolidate()
              else if (selectedAction === 'rename') handleRename()
              else if (selectedAction === 'proceed') handleProceed()
            }}
            disabled={isProcessing || !selectedAction || (selectedAction === 'consolidate' && !selectedDuplicateId) || (selectedAction === 'rename' && (!newName.trim() || newName.trim() === newItemName))}
            className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 
              selectedAction === 'consolidate' ? 'Consolidate' :
              selectedAction === 'rename' ? 'Add with New Name' :
              selectedAction === 'proceed' ? 'Add Anyway' :
              'Select Action'}
          </button>
        </div>
      </div>
    </div>
  )
}

