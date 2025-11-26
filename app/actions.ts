'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 🧠 4-LEVEL STATUS LOGIC ---
function getSmartStatus(qty: number, min: number) {
  if (qty === 0) return 'Out of Stock'        // RED: 0%
  const threshold30 = Math.ceil(min * 0.3)
  const threshold50 = Math.ceil(min * 0.5)
  if (qty > 0 && qty < threshold30) return 'Critical' // ORANGE: 1% to 29%
  if (qty >= threshold30 && qty < threshold50) return 'Warning' // YELLOW: 30% to 49%
  return 'Healthy'                            // GREEN: 50% and above
}

export async function checkDuplicate(name: string) {
  try {
    const duplicates = await prisma.inventoryItem.findMany({
      where: { name },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        minStock: true,
        status: true,
        createdAt: true
      }
    })
    return duplicates.length > 0 ? duplicates : null
  } catch (error) {
    console.error("Failed to check duplicates:", error)
    return null
  }
}

export async function consolidateItem(existingId: number, newQuantity: number, newMinStock: number) {
  try {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id: existingId }
    })
    
    if (!existing) return false

    const combinedQuantity = existing.quantity + newQuantity
    // Use the higher of the two minStock values
    const combinedMinStock = Math.max(existing.minStock, newMinStock)
    const newStatus = getSmartStatus(combinedQuantity, combinedMinStock)

    await prisma.inventoryItem.update({
      where: { id: existingId },
      data: {
        quantity: combinedQuantity,
        minStock: combinedMinStock,
        status: newStatus
      }
    })
    
    revalidatePath('/')
    return true
  } catch (error) {
    console.error("Failed to consolidate item:", error)
    return false
  }
}

export async function addItem(formData: FormData, forceCreate: boolean = false) {
  const name = formData.get('name') as string
  const customCategory = formData.get('customCategory') as string
  const category = customCategory || (formData.get('category') as string)
  const quantity = parseInt(formData.get('quantity') as string) || 0
  const minStock = parseInt(formData.get('minStock') as string) || 5 

  const status = getSmartStatus(quantity, minStock)

  try {
    // Check for duplicates unless forceCreate is true
    if (!forceCreate) {
      const duplicates = await checkDuplicate(name)
      if (duplicates && duplicates.length > 0) {
        return { success: false, duplicates, needsResolution: true }
      }
    }

    const data = {
      name,
      category,
      quantity,
      minStock,
      status
    }
    await prisma.inventoryItem.create({ data })
    revalidatePath('/')
    return { success: true, duplicates: null, needsResolution: false }
  } catch (error) {
    console.error("Failed to add item:", error)
    return { success: false, duplicates: null, needsResolution: false }
  }
}

export async function updateStock(id: number, currentQty: number, adjustment: number, minStock: number) {
  const newQty = currentQty + adjustment
  if (newQty < 0) return 

  const newStatus = getSmartStatus(newQty, minStock)

  try {
    await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQty, status: newStatus }
    })
    revalidatePath('/')
  } catch (error) {
    console.error("Failed to update stock:", error)
  }
}

export async function deleteItem(id: number) {
  await prisma.inventoryItem.delete({ where: { id } })
  revalidatePath('/')
}

export async function searchAction(formData: FormData) {
  const query = formData.get('query')
  redirect(query ? `/?q=${query}` : '/')
}