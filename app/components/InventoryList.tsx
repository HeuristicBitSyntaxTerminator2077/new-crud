import { Camera } from 'lucide-react'
import InventoryItemRow from './InventoryItemRow'
import { calculateStockStatus, getStatusStyles, getItemIcon } from '@/lib/utils'
import type { InventoryItem } from '@prisma/client'

type InventoryItemWithMinStock = InventoryItem & { minStock: number }

interface InventoryListProps {
  items: InventoryItemWithMinStock[]
}

export default function InventoryList({ items }: InventoryListProps) {
  return (
    <div className="lg:col-span-7">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Inventory Status{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
              {items.length} items
            </span>
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p>Inventory Empty</p>
            </div>
          ) : (
            items.map((item) => {
              const { isRed, isOrange, isYellow } = calculateStockStatus(item)
              const { bgColor, iconBg, statusText, statusColor } = getStatusStyles(item)
              const ItemIcon = getItemIcon(item.category)

              return (
                <InventoryItemRow
                  key={item.id}
                  item={item}
                  ItemIcon={ItemIcon}
                  bgColor={bgColor}
                  iconBg={iconBg}
                  statusText={statusText}
                  statusColor={statusColor}
                  isRed={isRed}
                  isOrange={isOrange}
                  isYellow={isYellow}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

