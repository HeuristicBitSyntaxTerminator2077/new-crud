import { Cpu, Network, Camera, Mic } from 'lucide-react'
import type { InventoryItem } from '@prisma/client'
import type { ReactNode } from 'react'

export type InventoryItemWithMinStock = InventoryItem & { minStock: number }

/**
 * Calculate stock status thresholds and flags for an item
 */
export function calculateStockStatus(item: InventoryItemWithMinStock) {
  const threshold30 = Math.ceil(item.minStock * 0.3)
  const threshold50 = Math.ceil(item.minStock * 0.5)
  
  const isRed = item.quantity === 0 // 0%
  const isOrange = item.quantity > 0 && item.quantity < threshold30 // 1% to 29%
  const isYellow = item.quantity >= threshold30 && item.quantity < threshold50 // 30% to 49%
  const isGreen = item.quantity >= threshold50 // 50% and above
  
  return { threshold30, threshold50, isRed, isOrange, isYellow, isGreen }
}

/**
 * Get styling classes and text for stock status
 */
export function getStatusStyles(item: InventoryItemWithMinStock) {
  const { isRed, isOrange, isYellow } = calculateStockStatus(item)
  
  let bgColor = 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
  let iconBg = 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  let statusText = 'HEALTHY'
  let statusColor = 'text-emerald-600 dark:text-emerald-400'
  
  if (isRed) {
    bgColor = 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
    iconBg = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    statusText = 'OUT OF STOCK'
    statusColor = 'text-red-600 dark:text-red-400'
  } else if (isOrange) {
    bgColor = 'bg-orange-50/40 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20'
    iconBg = 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    statusText = 'CRITICAL'
    statusColor = 'text-orange-600 dark:text-orange-400'
  } else if (isYellow) {
    bgColor = 'bg-yellow-50/40 dark:bg-yellow-900/10 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
    iconBg = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    statusText = 'WARNING'
    statusColor = 'text-yellow-600 dark:text-yellow-400'
  } else {
    bgColor = 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
    iconBg = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
    statusText = 'HEALTHY'
    statusColor = 'text-emerald-600 dark:text-emerald-400'
  }
  
  return { bgColor, iconBg, statusText, statusColor }
}

/**
 * Get appropriate icon for an item based on its category
 */
export function getItemIcon(category: string): ReactNode {
  if (['Multimedia', 'Studio'].includes(category)) {
    return <Camera className="w-5 h-5" />
  }
  if (['Network', 'Tools'].includes(category)) {
    return <Network className="w-5 h-5" />
  }
  if (['Audio'].includes(category)) {
    return <Mic className="w-5 h-5" />
  }
  return <Cpu className="w-5 h-5" />
}

/**
 * Calculate stock level counts for dashboard
 */
export function calculateStockCounts(items: InventoryItemWithMinStock[]) {
  const redCount = items.filter(i => i.quantity === 0).length
  
  const orangeCount = items.filter(i => {
    if (i.quantity === 0) return false
    const threshold30 = Math.ceil(i.minStock * 0.3)
    return i.quantity > 0 && i.quantity < threshold30
  }).length
  
  const yellowCount = items.filter(i => {
    if (i.quantity === 0) return false
    const threshold30 = Math.ceil(i.minStock * 0.3)
    const threshold50 = Math.ceil(i.minStock * 0.5)
    return i.quantity >= threshold30 && i.quantity < threshold50
  }).length
  
  const greenCount = items.filter(i => {
    if (i.quantity === 0) return false
    const threshold50 = Math.ceil(i.minStock * 0.5)
    return i.quantity >= threshold50
  }).length
  
  return { redCount, orangeCount, yellowCount, greenCount }
}

