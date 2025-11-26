'use client'

import { useState } from 'react'

interface CategorySelectorProps {
  name: string
  value?: string
  onChange?: (value: string) => void
}

export default function CategorySelector({ name, value: controlledValue, onChange }: CategorySelectorProps) {
  const [internalCategory, setInternalCategory] = useState('Multimedia')
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  
  const selectedCategory = controlledValue !== undefined ? controlledValue : internalCategory
  const isControlled = controlledValue !== undefined

  const handleCategoryChange = (value: string) => {
    if (!isControlled) {
      setInternalCategory(value)
    }
    if (onChange) {
      onChange(value === 'Custom' ? customCategory || 'Other' : value)
    }
    if (value === 'Custom') {
      setShowCustomInput(true)
    } else {
      setShowCustomInput(false)
      setCustomCategory('')
    }
  }

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value)
    if (onChange) {
      onChange(value || 'Other')
    }
  }

  return (
    <div className="space-y-2">
      <select 
        value={showCustomInput ? 'Custom' : selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        title="Select item category or choose 'Custom...' to enter your own"
        className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
      >
        <option value="Multimedia">Multimedia</option>
        <option value="Network">Network</option>
        <option value="Audio">Audio</option>
        <option value="Hardware">Hardware</option>
        <option value="Office Supplies">Office Supplies</option>
        <option value="Tools">Tools</option>
        <option value="Furniture">Furniture</option>
        <option value="General">General</option>
        <option value="Other">Other</option>
        <option value="Custom">Custom...</option>
      </select>
      
      {showCustomInput && (
        <input
          type="text"
          name="customCategory"
          value={customCategory}
          onChange={(e) => handleCustomCategoryChange(e.target.value)}
          placeholder="Enter custom category"
          title="Type any custom category name for this item"
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
        />
      )}
      
      {/* Hidden input that sends the correct category value */}
      <input
        type="hidden"
        name={name}
        value={customCategory || (selectedCategory === 'Custom' ? 'Other' : selectedCategory)}
      />
      
    </div>
  )
}

