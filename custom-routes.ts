// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2026 Shogo Technologies, Inc.
import { Hono } from 'hono'
import { supabase } from './src/lib/supabase'

const app = new Hono()

app.onError((err, c) => {
  console.error('[ROUTE ERROR]', err.message)
  return c.json({ error: err.message }, 500)
})

const BAHRAIN_OFFSET_HOURS = 3

function bahrainDayRange(dateStr: string): { start: string; end: string } {
  const [y, m, d] = dateStr.split('-').map(Number)
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - BAHRAIN_OFFSET_HOURS * 3600 * 1000)
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - BAHRAIN_OFFSET_HOURS * 3600 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

function bahrainNow(): Date {
  return new Date(Date.now() + BAHRAIN_OFFSET_HOURS * 3600 * 1000)
}

function bahrainDateStr(date?: Date): string {
  const d = date || bahrainNow()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ===== AUTH ROUTES =====

app.post('/auth/pin-login', async (c) => {
  const { pin } = await c.req.json()
  if (!pin || pin.length < 4) return c.json({ error: 'Invalid PIN' }, 400)

  const { data: user } = await supabase
    .from('users')
    .select('id, name, pin, role, isActive')
    .eq('pin', pin)
    .single()

  if (!user || !user.isActive) return c.json({ error: 'Invalid PIN or inactive account' }, 401)
  return c.json({ user: { id: user.id, name: user.name, role: user.role } })
})

app.get('/auth/me', async (c) => {
  const pin = c.req.header('X-User-Pin')
  if (!pin) return c.json({ error: 'Not authenticated' }, 401)

  const { data: user } = await supabase
    .from('users')
    .select('id, name, role, isActive')
    .eq('pin', pin)
    .single()

  if (!user || !user.isActive) return c.json({ error: 'Invalid session' }, 401)
  return c.json({ user })
})

// ===== MENU ROUTES =====

app.get('/menu', async (c) => {
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('isActive', true)
    .order('displayOrder')

  if (!categories) return c.json({ categories: [] })

  const result = categories.map(cat => ({
    ...cat,
    items: (cat.menu_items || [])
      .filter((i: any) => i.isAvailable)
      .sort((a: any, b: any) => a.name.localeCompare(b.name)),
  }))

  return c.json({ categories: result })
})

// ===== POS: ORDERS =====

app.get('/pos/orders', async (c) => {
  const status = c.req.query('status')
  const type = c.req.query('type')
  const date = c.req.query('date')

  let query = supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), tables(*), users!orders_staffId_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type', type)
  if (date) {
    const { start, end } = bahrainDayRange(date)
    query = query.gte('created_at', start).lte('created_at', end)
  }

  const { data: orders } = await query
  const shaped = (orders || []).map(o => ({
    ...o,
    items: (o.order_items || []).map((item: any) => ({
      ...item,
      menuItem: item.menu_items || { name: 'Unknown', price: 0 },
    })),
    table: o.tables,
    staff: o.users ? { name: o.users.name } : { name: 'Unknown' },
  }))
  return c.json({ orders: shaped })
})

app.post('/pos/orders', async (c) => {
  const body = await c.req.json()
  const { type, tableId, staffId, items, deliveryPlatform, notes, vatEnabled } = body

  if (!staffId || !items?.length) return c.json({ error: 'Staff ID and items are required' }, 400)

  const now = bahrainNow()
  const dateStr = bahrainDateStr(now).replace(/-/g, '')
  const { start: todayStart } = bahrainDayRange(bahrainDateStr(now))

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)

  const orderNumber = `HM${dateStr}${String((orderCount || 0) + 1).padStart(4, '0')}`

  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('price')
      .eq('id', item.menuItemId)
      .single()
    if (menuItem) {
      subtotal += menuItem.price * item.quantity
      orderItems.push({
        id: uuid(),
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || null,
      })
    }
  }

  const tax = vatEnabled !== false ? subtotal * 0.10 : 0
  const total = subtotal + tax
  const orderId = uuid()

  const ts = new Date().toISOString()
  const { error } = await supabase.from('orders').insert({
    id: orderId,
    orderNumber,
    type: type || 'DINE_IN',
    tableId: tableId || null,
    staffId,
    subtotal,
    tax,
    total,
    deliveryPlatform: deliveryPlatform || null,
    notes: notes || null,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    created_at: ts,
    updated_at: ts,
  })

  if (error) return c.json({ error: error.message }, 500)

  if (orderItems.length > 0) {
    await supabase.from('order_items').insert(orderItems.map(i => ({ ...i, orderId })))
  }

  if (tableId && type === 'DINE_IN') {
    await supabase.from('tables').update({ status: 'OCCUPIED' }).eq('id', tableId)
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), tables(*), users!orders_staffId_fkey(name)')
    .eq('id', orderId)
    .single()

  const shaped = order ? {
    ...order,
    items: (order.order_items || []).map((item: any) => ({
      ...item,
      menuItem: item.menu_items || { name: 'Unknown', price: 0 },
    })),
    table: order.tables,
    staff: order.users ? { name: order.users.name } : { name: 'Unknown' },
  } : null

  return c.json({ order: shaped }, 201)
})

app.patch('/pos/orders/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { status, paymentMethod, paymentStatus } = body

  const updateData: Record<string, unknown> = {}
  if (status) updateData.status = status
  if (paymentMethod) updateData.paymentMethod = paymentMethod
  if (paymentStatus) updateData.paymentStatus = paymentStatus
  if (status === 'COMPLETED') updateData.completedAt = new Date().toISOString()
  updateData.updated_at = new Date().toISOString()

  await supabase.from('orders').update(updateData).eq('id', id)

  if ((status === 'COMPLETED' || status === 'CANCELLED')) {
    const { data: order } = await supabase.from('orders').select('tableId').eq('id', id).single()
    if (order?.tableId) {
      await supabase.from('tables').update({ status: 'AVAILABLE' }).eq('id', order.tableId)
    }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*)), tables(*)')
    .eq('id', id)
    .single()

  const shaped = order ? {
    ...order,
    items: order.order_items || [],
    table: order.tables,
  } : null

  return c.json({ order: shaped })
})

app.delete('/pos/orders/:id', async (c) => {
  const id = c.req.param('id')

  const { data: order } = await supabase
    .from('orders')
    .select('id, tableId')
    .eq('id', id)
    .single()

  if (!order) return c.json({ error: 'Order not found' }, 404)

  await supabase.from('order_items').delete().eq('orderId', id)
  await supabase.from('orders').delete().eq('id', id)

  if (order.tableId) {
    const { data: otherOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('tableId', order.tableId)
      .not('status', 'in', '(COMPLETED,CANCELLED)')
      .neq('id', id)

    if (!otherOrders || otherOrders.length === 0) {
      await supabase.from('tables').update({ status: 'AVAILABLE' }).eq('id', order.tableId)
    }
  }

  return c.json({ success: true })
})

// ===== POS: TABLES =====

app.get('/pos/tables', async (c) => {
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .order('number')

  const { data: activeOrders } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*))')
    .not('status', 'in', '(COMPLETED,CANCELLED)')

  const tableOrders = (activeOrders || []).reduce((acc: any, o: any) => {
    if (o.tableId) {
      if (!acc[o.tableId]) acc[o.tableId] = []
      acc[o.tableId].push({ ...o, items: o.order_items || [] })
    }
    return acc
  }, {})

  const result = (tables || []).map(t => ({
    ...t,
    orders: tableOrders[t.id] || [],
  }))

  return c.json({ tables: result })
})

app.patch('/pos/tables/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { status } = body

  const { data: table } = await supabase
    .from('tables')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  return c.json({ table })
})

// ===== POS: REPORTS =====

app.get('/pos/reports/daily', async (c) => {
  const date = c.req.query('date') || bahrainDateStr()
  const { start, end } = bahrainDayRange(date)

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*))')
    .eq('status', 'COMPLETED')
    .gte('created_at', start)
    .lte('created_at', end)

  const all = orders || []
  const totalOrders = all.length
  const totalRevenue = all.reduce((sum, o) => sum + (o.total || 0), 0)
  const cashTotal = all.filter(o => o.paymentMethod === 'CASH').reduce((s, o) => s + (o.total || 0), 0)
  const cardTotal = all.filter(o => o.paymentMethod === 'CARD').reduce((s, o) => s + (o.total || 0), 0)
  const onlineTotal = all.filter(o => o.paymentMethod === 'ONLINE').reduce((s, o) => s + (o.total || 0), 0)
  const deliveryOrders = all.filter(o => o.type === 'DELIVERY').length
  const dineInOrders = all.filter(o => o.type === 'DINE_IN').length
  const takeawayOrders = all.filter(o => o.type === 'TAKEAWAY').length

  const categorySales: Record<string, { count: number; revenue: number }> = {}
  for (const order of all) {
    for (const item of (order.order_items || [])) {
      const name = item.menu_items?.name || 'Unknown'
      if (!categorySales[name]) categorySales[name] = { count: 0, revenue: 0 }
      categorySales[name].count += item.quantity
      categorySales[name].revenue += (item.price || 0) * item.quantity
    }
  }

  const hourlyOrders: Record<number, number> = {}
  for (const order of all) {
    const hour = new Date(order.created_at).getHours()
    hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
  }

  return c.json({
    date, totalOrders, totalRevenue, cashTotal, cardTotal, onlineTotal,
    deliveryOrders, dineInOrders, takeawayOrders, categorySales, hourlyOrders,
  })
})

// ===== POS: INVENTORY =====

app.get('/pos/inventory', async (c) => {
  const { data: items } = await supabase
    .from('inventory_items')
    .select('*, inventory_transactions(*)')
    .order('name')

  const result = (items || []).map(i => ({
    ...i,
    transactions: (i.inventory_transactions || [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
  }))

  return c.json({ items: result })
})

app.post('/pos/inventory', async (c) => {
  const body = await c.req.json()
  const { name, quantity, unit, minStock, cost, supplier } = body

  const { data: item } = await supabase
    .from('inventory_items')
    .insert({ id: uuid(), name, quantity, unit, minStock, cost, supplier, created_at: new Date().toISOString() })
    .select()
    .single()

  return c.json({ item }, 201)
})

app.patch('/pos/inventory/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { quantity, type, notes } = body

  const { data: item } = await supabase
    .from('inventory_items')
    .update({ quantity, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (type) {
    await supabase.from('inventory_transactions').insert({
      id: uuid(),
      itemId: id,
      type,
      quantity: body.transactionQuantity || quantity,
      notes,
      created_at: new Date().toISOString(),
    })
  }

  return c.json({ item })
})

// ===== POS: STAFF =====

app.get('/pos/staff', async (c) => {
  const { data: staff } = await supabase
    .from('users')
    .select('id, name, pin, role, isActive, created_at')
    .order('created_at', { ascending: false })

  const result = await Promise.all((staff || []).map(async (s) => {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('staffId', s.id)
    return { ...s, createdAt: s.created_at, _count: { orders: count || 0 } }
  }))

  return c.json({ staff: result })
})

app.post('/pos/staff', async (c) => {
  const body = await c.req.json()
  const { name, pin, role } = body

  if (!name || !pin) return c.json({ error: 'Name and PIN are required' }, 400)

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('pin', pin)
    .single()

  if (existing) return c.json({ error: 'PIN already in use' }, 400)

  const { data: user } = await supabase
    .from('users')
    .insert({ id: uuid(), name, pin, role: role || 'STAFF', isActive: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select('id, name, pin, role, isActive')
    .single()

  return c.json({ user }, 201)
})

app.patch('/pos/staff/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, role, isActive, pin } = body

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (role) updateData.role = role
  if (typeof isActive === 'boolean') updateData.isActive = isActive
  if (pin) updateData.pin = pin
  updateData.updated_at = new Date().toISOString()

  const { data: user } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, name, pin, role, isActive')
    .single()

  return c.json({ user })
})

// ===== POS: MENU MANAGEMENT =====

app.post('/pos/menu', async (c) => {
  const body = await c.req.json()
  const { name, nameAr, price, currency, categoryId, description } = body

  const { data: item } = await supabase
    .from('menu_items')
    .insert({ id: uuid(), name, nameAr, price, currency: currency || 'BD', categoryId, description, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select('*, menu_categories(*)')
    .single()

  return c.json({ item }, 201)
})

app.patch('/pos/menu/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, nameAr, price, currency, isAvailable, description } = body

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (nameAr !== undefined) updateData.nameAr = nameAr
  if (price !== undefined) updateData.price = price
  if (currency) updateData.currency = currency
  if (typeof isAvailable === 'boolean') updateData.isAvailable = isAvailable
  if (description !== undefined) updateData.description = description
  updateData.updated_at = new Date().toISOString()

  const { data: item } = await supabase
    .from('menu_items')
    .update(updateData)
    .eq('id', id)
    .select('*, menu_categories(*)')
    .single()

  return c.json({ item })
})

app.delete('/pos/menu/:id', async (c) => {
  const id = c.req.param('id')
  await supabase.from('menu_items').delete().eq('id', id)
  return c.json({ success: true })
})

// ===== SEED DEFAULT TABLES =====
app.post('/pos/seed-tables', async (c) => {
  const tables = [
    { number: 1, capacity: 2, section: 'indoor' },
    { number: 2, capacity: 2, section: 'indoor' },
    { number: 3, capacity: 4, section: 'indoor' },
    { number: 4, capacity: 4, section: 'indoor' },
    { number: 5, capacity: 6, section: 'indoor' },
    { number: 6, capacity: 6, section: 'indoor' },
    { number: 7, capacity: 8, section: 'indoor' },
    { number: 8, capacity: 4, section: 'outdoor' },
    { number: 9, capacity: 4, section: 'outdoor' },
    { number: 10, capacity: 6, section: 'outdoor' },
  ]

  for (const t of tables) {
    await supabase.from('tables').upsert(
      { id: uuid(), number: t.number, capacity: t.capacity, section: t.section, status: 'AVAILABLE' },
      { onConflict: 'number' }
    )
  }

  return c.json({ success: true, count: tables.length })
})

// ===== EMAIL: DAILY REPORT =====
let lastEmailSentDate: string | null = null

async function sendDailyReportEmail(dateStr: string) {
  const nodemailer = await import('nodemailer')

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || ''
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || ''
  const recipientEmail = process.env.REPORT_EMAIL || smtpUser

  if (!smtpUser || !smtpPass) {
    console.log('[email] SMTP credentials not configured, skipping send')
    return { success: false, error: 'SMTP credentials not configured' }
  }

  const { start, end } = bahrainDayRange(dateStr)
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(*))')
    .eq('status', 'COMPLETED')
    .gte('created_at', start)
    .lte('created_at', end)

  const all = orders || []
  const totalRevenue = all.reduce((sum, o) => sum + (o.total || 0), 0)
  const cashTotal = all.filter(o => o.paymentMethod === 'CASH').reduce((s, o) => s + (o.total || 0), 0)
  const cardTotal = all.filter(o => o.paymentMethod === 'CARD').reduce((s, o) => s + (o.total || 0), 0)
  const deliveryOrders = all.filter(o => o.type === 'DELIVERY').length
  const dineInOrders = all.filter(o => o.type === 'DINE_IN').length
  const takeawayOrders = all.filter(o => o.type === 'TAKEAWAY').length

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #166534; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">🌴 Hakuna Matata POS</h1>
        <h2 style="margin: 8px 0 0 0; font-weight: normal;">Daily Sales Report — ${dateStr}</h2>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a;">
            <div style="color: #6b7280; font-size: 12px;">Total Orders</div>
            <div style="font-size: 24px; font-weight: bold;">${all.length}</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #ca8a04;">
            <div style="color: #6b7280; font-size: 12px;">Total Revenue</div>
            <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${totalRevenue.toFixed(3)} BD</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <div style="color: #6b7280; font-size: 12px;">Cash Sales</div>
            <div style="font-size: 20px; font-weight: bold;">${cashTotal.toFixed(3)} BD</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #7c3aed;">
            <div style="color: #6b7280; font-size: 12px;">Card Sales</div>
            <div style="font-size: 20px; font-weight: bold;">${cardTotal.toFixed(3)} BD</div>
          </div>
        </div>
        <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px 0;">Orders by Type</h3>
          <p style="margin: 4px 0;">🍽️ Dine-in: <strong>${dineInOrders}</strong></p>
          <p style="margin: 4px 0;">🛒 Takeaway: <strong>${takeawayOrders}</strong></p>
          <p style="margin: 4px 0;">🚗 Delivery: <strong>${deliveryOrders}</strong></p>
        </div>
      </div>
      <div style="text-align: center; padding: 12px; color: #9ca3af; font-size: 12px;">
        Generated automatically at 11:00 PM Bahrain time
      </div>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({
    from: `"Hakuna Matata POS" <${smtpUser}>`,
    to: recipientEmail,
    subject: `📊 Daily Sales Report — ${dateStr} | ${all.length} orders, ${totalRevenue.toFixed(2)} BD`,
    html,
  })

  lastEmailSentDate = dateStr
  return { success: true, sentTo: recipientEmail, orders: all.length, revenue: totalRevenue }
}

app.post('/pos/send-email', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const date = body.date || bahrainDateStr()

  try {
    const result = await sendDailyReportEmail(date)
    return c.json(result)
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

// ===== SERVER-SIDE CRON: AUTO-SEND DAILY REPORT =====
const SEND_HOUR_BAHRAIN = 23

setInterval(async () => {
  try {
    const now = bahrainNow()
    const todayStr = bahrainDateStr(now)
    const currentHour = now.getUTCHours()

    if (currentHour === SEND_HOUR_BAHRAIN && lastEmailSentDate !== todayStr) {
      console.log(`[cron] Sending daily report for ${todayStr}`)
      const result = await sendDailyReportEmail(todayStr)
      console.log(`[cron] Email result:`, JSON.stringify(result))
    }
  } catch (err) {
    console.error('[cron] Failed to send daily report:', err)
  }
}, 60_000)

export default app
