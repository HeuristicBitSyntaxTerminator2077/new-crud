import { prisma } from '@/lib/prisma'
import { addItem, deleteItem, updateStock, searchAction } from './actions'
import type { InventoryItem } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { 
  Search,
  Cpu, Network, Monitor, Keyboard, Camera, Clapperboard, Zap, Aperture, Mic, Cable
} from 'lucide-react'
import QuickAddCatalog from './components/QuickAddCatalog'
import CustomItemForm from './components/CustomItemForm'
import InventoryList from './components/InventoryList'
import ThemeToggle from './components/ThemeToggle'
import { calculateStockCounts } from '@/lib/utils'

// --- EXPANDED TEMPLATES (Cristal e-College Catalog) ---
const TEMPLATES = [
  // 1. Networking & Lab Consumables
  { name: "RJ45 Connector (Box)", category: "Network", min: 50, icon: <Network className="w-4 h-4"/> },
  { name: "Cat6 Patch Cord (1m)", category: "Network", min: 20, icon: <Cable className="w-4 h-4"/> },
  { name: "Crimping Tool", category: "Tools", min: 15, icon: <Network className="w-4 h-4"/> },
  { name: "Cable Tester (LAN)", category: "Tools", min: 10, icon: <Cpu className="w-4 h-4"/> },
  
  // 2. Workstation Essentials
  { name: "HDMI Cable (3m)", category: "Cable", min: 15, icon: <Monitor className="w-4 h-4"/> },
  { name: "VGA to HDMI Adapter", category: "Adapter", min: 10, icon: <Cpu className="w-4 h-4"/> },
  { name: "Generic USB Mouse", category: "Peripheral", min: 40, icon: <Keyboard className="w-4 h-4"/> },
  { name: "Generic Keyboard", category: "Peripheral", min: 40, icon: <Keyboard className="w-4 h-4"/> },
  { name: "Extension Cord (Heavy Duty)", category: "Power", min: 8, icon: <Zap className="w-4 h-4"/> },

  // 3. Multimedia: Photography
  { name: "DSLR Camera Body", category: "Multimedia", min: 3, icon: <Camera className="w-4 h-4 text-purple-600"/> },
  { name: "Lens Cap (58mm)", category: "Multimedia", min: 10, icon: <Aperture className="w-4 h-4 text-purple-600"/> },
  { name: "SD Card (64GB)", category: "Storage", min: 6, icon: <Cpu className="w-4 h-4 text-purple-600"/> },
  { name: "Camera Battery (LP-E10)", category: "Multimedia", min: 5, icon: <Zap className="w-4 h-4 text-purple-600"/> },
  
  // 4. Studio: Video & Audio
  { name: "Tripod (Fluid Head)", category: "Studio", min: 4, icon: <Clapperboard className="w-4 h-4 text-purple-600"/> },
  { name: "Ring Light (18-inch)", category: "Studio", min: 2, icon: <Zap className="w-4 h-4 text-purple-600"/> },
  { name: "Green Screen Backdrop", category: "Studio", min: 1, icon: <Aperture className="w-4 h-4 text-purple-600"/> },
  { name: "Lapel Mic (Wireless)", category: "Audio", min: 4, icon: <Mic className="w-4 h-4 text-pink-600"/> },
  { name: "XLR Audio Cable", category: "Audio", min: 10, icon: <Cable className="w-4 h-4 text-pink-600"/> },
]

// Cached fetcher for off-peak hours
const getCachedItems = unstable_cache(
  async () => {
    return await prisma.inventoryItem.findMany({
      orderBy: [
        { quantity: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  },
  ['inventory-items-list'],
  { revalidate: 300 } // Cache for 5 minutes during off-hours
)

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams)?.q || ''

  // Smart Rendering Logic:
  // Check current hour (Server Time)
  // Business Hours: 8 AM - 8 PM (20:00) -> Dynamic
  // Off Hours -> Cached (Static-like)
  const currentHour = new Date().getHours()
  const isBusinessHours = currentHour >= 8 && currentHour < 20
  
  let itemsResult

  if (query || isBusinessHours) {
    itemsResult = await prisma.inventoryItem.findMany({
      where: query ? { name: { contains: query } } : undefined,
      orderBy: [
        { quantity: 'asc' }, // Shows lowest stock first
        { createdAt: 'desc' }
      ]
    })
  } else {
    // Static/Cached Fetch
    const cached = await getCachedItems()
    // Restore Date objects from JSON serialization
    itemsResult = cached.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }))
  }
  
  // Type assertion to work around TypeScript cache issue
  // The Prisma types include minStock, but TS language server may need a restart
  const items = itemsResult as Array<InventoryItem & { minStock: number }>

  // --- 📊 4-LEVEL STATUS LOGIC ---
  const { redCount, orangeCount, yellowCount, greenCount } = calculateStockCounts(items)

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 pb-20">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 px-6 py-4 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 dark:bg-purple-600 p-2 rounded-lg">
            <Camera className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">CCS <span className="text-purple-600 dark:text-purple-400">MediaSync</span></h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lab & Studio Inventory</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <form action={searchAction} className="relative w-full md:w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" title="Search icon">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input 
              name="query" 
              defaultValue={query} 
              placeholder="Search equipment..." 
              title="Search inventory by item name"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none transition-all" 
            />
          </form>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-8 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: ACTION CENTER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* --- 4-LEVEL STATUS DASHBOARD --- */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">Stock Levels</h3>
            <div className="grid grid-cols-2 gap-2">
              
              {/* RED: OUT OF STOCK */}
              <div 
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-help ${redCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                title="Items with 0 quantity - urgent restocking needed"
              >
                <div className={`text-2xl font-bold ${redCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-300 dark:text-slate-600'}`}>{redCount}</div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${redCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>Red: Empty</div>
                <div className="text-[7px] text-slate-500 dark:text-slate-400">0%</div>
                {redCount > 0 && <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse"></div>}
              </div>

              {/* ORANGE: CRITICAL */}
              <div 
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-help ${orangeCount > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                title="Items at 1-29% of target stock - critical level, restock soon"
              >
                <div className={`text-2xl font-bold ${orangeCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-300 dark:text-slate-600'}`}>{orangeCount}</div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${orangeCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>Orange: Critical</div>
                <div className="text-[7px] text-slate-500 dark:text-slate-400">1% - 29%</div>
                {orangeCount > 0 && <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></div>}
              </div>

              {/* YELLOW: WARNING */}
              <div 
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-help ${yellowCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                title="Items at 30-49% of target stock - monitor closely"
              >
                <div className={`text-2xl font-bold ${yellowCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>{yellowCount}</div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${yellowCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-500'}`}>Yellow: Warning</div>
                <div className="text-[7px] text-slate-500 dark:text-slate-400">30% - 49%</div>
                {yellowCount > 0 && <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>}
              </div>

              {/* GREEN: HEALTHY */}
              <div 
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-help ${greenCount > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                title="Items at 50%+ of target stock - healthy levels"
              >
                <div className={`text-2xl font-bold ${greenCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>{greenCount}</div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${greenCount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>Green: Healthy</div>
                <div className={`text-[7px] ${greenCount > 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-slate-500 dark:text-slate-400'}`}>≥ 50%</div>
              </div>

            </div>
          </div>

          {/* QUICK ADD & CUSTOM FORM - SIDE BY SIDE */}
          <div className="grid grid-cols-2 gap-6">
            {/* QUICK ADD TEMPLATES */}
            <div className="min-w-0">
              <QuickAddCatalog templates={TEMPLATES} />
            </div>

            {/* MANUAL FORM */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0 flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">Custom Item</h3>
              <CustomItemForm />
            </div>
          </div>
        </div>

        {/* RIGHT: INVENTORY LIST */}
        <InventoryList items={items} />

      </div>
    </main>
  )
}