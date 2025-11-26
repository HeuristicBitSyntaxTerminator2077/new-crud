'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addItem, checkDuplicate } from '../actions'
import DuplicateItemModal from './DuplicateItemModal'

interface Template {
  name: string
  category: string
  min: number
  icon: React.ReactNode
}

interface QuickAddCatalogProps {
  templates: Template[]
}

export default function QuickAddCatalog({ templates }: QuickAddCatalogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null)
  const [customQuantity, setCustomQuantity] = useState<string>('')
  const [useCustomTarget, setUseCustomTarget] = useState<boolean>(false)
  const [customTarget, setCustomTarget] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicates, setDuplicates] = useState<any[] | null>(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<{name: string, category: string, quantity: number, minStock: number} | null>(null)

  const presetQuantities = [5, 10, 20, 50, 100]

  const handleItemClick = (template: Template) => {
    setSelectedTemplate(template)
    setSelectedQuantity(null)
    setCustomQuantity('')
    setUseCustomTarget(false)
    setCustomTarget('')
  }

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity)
    setCustomQuantity('')
  }

  const handleCustomQuantityChange = (value: string) => {
    setCustomQuantity(value)
    setSelectedQuantity(null)
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return
    
    const quantity = selectedQuantity !== null 
      ? selectedQuantity 
      : customQuantity ? parseInt(customQuantity) : selectedTemplate.min

    if (isNaN(quantity) || quantity < 0) return

    // Determine target: use custom target if enabled, otherwise match quantity
    let target: number
    if (useCustomTarget && customTarget) {
      target = parseInt(customTarget)
      if (isNaN(target) || target < 0) {
        alert('Please enter a valid target number')
        return
      }
    } else {
      target = quantity
    }

    setIsSubmitting(true)
    
    // Check for duplicates first
    const existingDuplicates = await checkDuplicate(selectedTemplate.name)
    
    if (existingDuplicates && existingDuplicates.length > 0) {
      // Show duplicate modal
      setDuplicates(existingDuplicates)
      setPendingFormData({
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        quantity,
        minStock: target
      })
      setShowDuplicateModal(true)
      setIsSubmitting(false)
      return
    }

    // No duplicates, proceed with normal add
    const formData = new FormData()
    formData.append('name', selectedTemplate.name)
    formData.append('category', selectedTemplate.category)
    formData.append('quantity', quantity.toString())
    formData.append('minStock', target.toString())

    const result = await addItem(formData)
    
    if (result && result.success) {
      resetForm()
    } else if (result && result.needsResolution) {
      setDuplicates(result.duplicates)
      setPendingFormData({
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        quantity,
        minStock: target
      })
      setShowDuplicateModal(true)
    }
    
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setSelectedTemplate(null)
    setSelectedQuantity(null)
    setCustomQuantity('')
    setUseCustomTarget(false)
    setCustomTarget('')
    setDuplicates(null)
    setPendingFormData(null)
  }

  const handleDuplicateResolved = () => {
    resetForm()
    setShowDuplicateModal(false)
  }

  const handleClose = () => {
    resetForm()
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Add</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 max-h-[320px]">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => handleItemClick(t)}
              title={`Quick add: ${t.name} (Category: ${t.category}, Default target: ${t.min})`}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-700 border border-transparent transition group text-left"
            >
              <span className="flex items-center gap-2.5 font-medium text-xs text-slate-700 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                <span className="w-4 h-4 flex-shrink-0" title={t.category}>{t.icon}</span>
                <span className="truncate">{t.name}</span>
              </span>
              <span title="Add item">
                <Plus className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 flex-shrink-0" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedTemplate.icon}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedTemplate.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTemplate.category}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                title="Close dialog"
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              {/* Quantity Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Quantity
                </label>
                
                {/* Preset Quantity Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {presetQuantities.map((qty) => (
                    <button
                      key={qty}
                      onClick={() => handleQuantitySelect(qty)}
                      title={`Set quantity to ${qty}`}
                      className={`p-3 rounded-lg border-2 transition font-medium ${
                        selectedQuantity === qty
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                {/* Custom Quantity Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Or enter custom quantity:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customQuantity}
                    onChange={(e) => handleCustomQuantityChange(e.target.value)}
                    placeholder={`Default: ${selectedTemplate.min}`}
                    title={`Enter a custom quantity (default: ${selectedTemplate.min})`}
                    className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition"
                  />
                </div>
              </div>

              {/* Target Section */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="customTarget"
                      checked={useCustomTarget}
                      onChange={(e) => {
                        setUseCustomTarget(e.target.checked)
                        if (!e.target.checked) {
                          setCustomTarget('')
                        }
                      }}
                      title="Enable to set a different target stock level than the quantity being added"
                      className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  <label htmlFor="customTarget" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Set custom target (separate from quantity)
                  </label>
                </div>

                {useCustomTarget && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Target stock level:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      placeholder="Enter target number"
                      title="Set a custom minimum stock level (different from quantity being added)"
                      className="w-full p-3 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/30 dark:bg-indigo-900/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      This is the minimum stock level you want to maintain. The system will alert you when stock falls below this target.
                    </p>
                  </div>
                )}

                {!useCustomTarget && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Default:</span> Target will match the quantity you're adding.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                title="Cancel adding this item"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (selectedQuantity === null && !customQuantity) || (useCustomTarget && !customTarget)}
                title={isSubmitting ? 'Adding item...' : 'Add this item to inventory'}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : (() => {
                  const qty = selectedQuantity !== null ? selectedQuantity : (customQuantity ? parseInt(customQuantity) : selectedTemplate.min)
                  if (useCustomTarget && customTarget) {
                    return `Add ${qty} items (Target: ${customTarget})`
                  }
                  return `Add ${qty} items`
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Item Modal */}
      {showDuplicateModal && pendingFormData && duplicates && (
        <DuplicateItemModal
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false)
            setDuplicates(null)
            setPendingFormData(null)
          }}
          duplicates={duplicates}
          newItemName={pendingFormData.name}
          newItemCategory={pendingFormData.category}
          newItemQuantity={pendingFormData.quantity}
          newItemMinStock={pendingFormData.minStock}
          onResolved={handleDuplicateResolved}
        />
      )}
    </>
  )
}

