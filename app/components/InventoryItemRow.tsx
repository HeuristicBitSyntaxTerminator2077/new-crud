'use client'

import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, XCircle, Edit2, Check, X } from 'lucide-react'
import { updateStock, deleteItem } from '../actions'
import type { InventoryItem } from '@prisma/client'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface InventoryItemRowProps {
  item: InventoryItem & { minStock: number }
  ItemIcon: React.ReactNode
  bgColor: string
  iconBg: string
  statusText: string
  statusColor: string
  isRed: boolean
  isOrange: boolean
  isYellow: boolean
}

export default function InventoryItemRow({
  item,
  ItemIcon,
  bgColor,
  iconBg,
  statusText,
  statusColor,
  isRed,
  isOrange,
  isYellow
}: InventoryItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync local state with prop when item changes (after server action)
  useEffect(() => {
    if (!isEditing) {
      setQuantity(item.quantity)
    }
  }, [item.quantity, isEditing])

  const handleUpdate = async (adjustment: number) => {
    setIsUpdating(true)
    const currentQty = quantity
    const newQuantity = currentQty + adjustment
    if (newQuantity < 0) {
      setIsUpdating(false)
      return
    }
    setQuantity(newQuantity)
    await updateStock(item.id, currentQty, adjustment, item.minStock)
    setIsUpdating(false)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setQuantity(item.quantity)
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await deleteItem(item.id)
    setIsDeleting(false)
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between group transition-all ${bgColor}`}>
      
      {/* Item Info */}
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${iconBg}`}>
          {isRed ? <XCircle className="w-5 h-5"/> : 
           (isOrange || isYellow) ? <AlertTriangle className="w-5 h-5"/> : ItemIcon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-help"
              title={`Category: ${item.category}`}
            >
              {item.category}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Target: {item.minStock}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className={`font-bold ${statusColor}`}>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        {isEditing ? (
          <>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => handleUpdate(-1)}
                disabled={isUpdating || quantity <= 0}
                title="Decrease quantity by 1"
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span 
                className={`w-10 text-center font-mono font-bold text-lg 
                  ${isRed ? 'text-red-600 dark:text-red-400' : isOrange ? 'text-orange-600 dark:text-orange-400' : isYellow ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                title={`Current quantity: ${quantity} (Target: ${item.minStock})`}
              >
                {quantity}
              </span>
              <button
                onClick={() => handleUpdate(1)}
                disabled={isUpdating}
                title="Increase quantity by 1"
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span 
                className={`text-lg font-mono font-bold px-3 py-1 rounded-lg cursor-help
                  ${isRed ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : isOrange ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' : isYellow ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'}`}
                title={`Current quantity: ${item.quantity} | Target: ${item.minStock} | Status: ${statusText}`}
              >
                {item.quantity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                title="Update"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={item.name}
        isDeleting={isDeleting}
      />
    </>
  )
}

