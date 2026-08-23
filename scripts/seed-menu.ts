import pg from 'pg'

const { Client } = pg

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.oxvxoddgbdlypvkwjfmq',
  password: 'Hakunamatata123',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const categories = [
  { id: uuid(), name: 'Main Dishes', nameAr: 'الأطباق الرئيسية', displayOrder: 1 },
  { id: uuid(), name: 'Breakfast', nameAr: 'الإفطار', displayOrder: 2 },
  { id: uuid(), name: 'Extra Sides', nameAr: 'إضافات', displayOrder: 3 },
  { id: uuid(), name: 'Drinks', nameAr: 'المشروبات', displayOrder: 4 },
  { id: uuid(), name: 'Sweets', nameAr: 'الحلويات', displayOrder: 5 },
]

const menuItems: Record<string, Array<{ name: string; nameAr?: string; price: number; currency: string }>> = {
  'Main Dishes': [
    { name: 'Fish & Ugali', price: 3.500, currency: 'BD' },
    { name: 'Fish Wet Fry with Ugali', price: 4.000, currency: 'BD' },
    { name: 'Coconut Cassava with Fish', price: 3.500, currency: 'BD' },
    { name: 'Coconut Beans & 3 Chapati', price: 2.500, currency: 'BD' },
    { name: 'Coconut Fish (Kupaka) with Rice', price: 3.800, currency: 'BD' },
    { name: 'Fish (Full) & Chips', price: 3.500, currency: 'BD' },
    { name: 'Matumbo (Tripe) with Ugali', price: 2.800, currency: 'BD' },
    { name: 'Beef Wet Fry with Ugali', price: 3.500, currency: 'BD' },
    { name: 'Soup with 3 Chapatis', price: 2.800, currency: 'BD' },
    { name: 'Beef Stew with 3 Chapati', price: 3.200, currency: 'BD' },
    { name: 'Mukimo with Beef Stew', price: 4.000, currency: 'BD' },
    { name: 'Beef Matoke', price: 4.000, currency: 'BD' },
    { name: 'Githeri with Avocado', price: 2.500, currency: 'BD' },
    { name: 'Chicken (Quarter) & Chips', price: 2.500, currency: 'BD' },
    { name: 'Chicken Biryani', price: 1.500, currency: 'BD' },
    { name: 'Meat Pilau', price: 2.500, currency: 'BD' },
    { name: 'Choma Ugali with Greens', price: 3.500, currency: 'BD' },
    { name: 'Chicken Tikka Chips', price: 2.000, currency: 'BD' },
    { name: 'Chicken Tikka Chips Masala', price: 2.500, currency: 'BD' },
    { name: 'Omena Ugali Greens', price: 2.500, currency: 'BD' },
    { name: 'Kenyan Pizza with Chips Masala', price: 3.500, currency: 'BD' },
  ],
  'Breakfast': [
    { name: 'Swahili Platter', price: 3.500, currency: 'BD' },
    { name: 'Mbahazi Mahamri 10pcs', price: 3.000, currency: 'BD' },
    { name: 'Zege (Fries & Omelette)', price: 2.000, currency: 'BD' },
    { name: 'Chapati Egg Roll (Rolex)', price: 1.000, currency: 'BD' },
    { name: 'Smocha (Sausage Chapati)', price: 1.000, currency: 'BD' },
    { name: 'Spring Rolls 3pcs', price: 1.000, currency: 'BD' },
    { name: 'Samosa Beef 5pcs', price: 1.000, currency: 'BD' },
    { name: 'Kebab Swahili 3pcs', price: 1.000, currency: 'BD' },
    { name: 'Mitai 5pcs', price: 1.000, currency: 'BD' },
    { name: 'Vitumbua 3pcs', price: 1.000, currency: 'BD' },
    { name: 'Ngumu 4pcs', price: 1.000, currency: 'BD' },
    { name: 'Viazi Karai 10pcs', price: 1.000, currency: 'BD' },
    { name: 'Bajia 8pcs', price: 1.000, currency: 'BD' },
    { name: 'Zanzibari Nutella 5pcs', price: 1.000, currency: 'BD' },
    { name: 'Zanzibari Plain 10pcs', price: 1.000, currency: 'BD' },
    { name: 'Zanzibari Cheese 8pcs', price: 1.000, currency: 'BD' },
  ],
  'Extra Sides': [
    { name: 'White Rice', price: 0.800, currency: 'FILLS' },
    { name: 'Ugali', price: 1.000, currency: 'BD' },
    { name: 'Chapati', price: 0.200, currency: 'FILLS' },
    { name: 'Fries', price: 1.000, currency: 'BD' },
    { name: 'Chips Masala', price: 1.500, currency: 'BD' },
    { name: 'Kachumbari Salad', price: 0.800, currency: 'FILLS' },
    { name: 'Greens', price: 0.850, currency: 'FILLS' },
  ],
  'Drinks': [
    { name: 'Fresh Juices', price: 1.500, currency: 'BD' },
    { name: 'Soft Drink', price: 0.300, currency: 'FILLS' },
    { name: 'Water', price: 0.200, currency: 'FILLS' },
    { name: 'Elkasus Chai', price: 0.200, currency: 'FILLS' },
    { name: 'Chai Masala', price: 0.200, currency: 'FILLS' },
    { name: 'Black Tea', price: 0.100, currency: 'FILLS' },
  ],
  'Sweets': [
    { name: 'Achari', price: 1.500, currency: 'BD' },
    { name: 'Mabuyu', price: 1.500, currency: 'BD' },
    { name: 'Labania', price: 0.350, currency: 'FILLS' },
  ],
}

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

async function main() {
  await client.connect()
  console.log('🌱 Connected to Supabase, seeding...')

  // Upsert admin user
  const adminId = uuid()
  await client.query(`
    INSERT INTO users (id, name, pin, role, "isActive", "created_at", "updated_at")
    VALUES ($1, 'Admin', '1234', 'ADMIN', true, NOW(), NOW())
    ON CONFLICT (pin) DO UPDATE SET name = 'Admin', role = 'ADMIN', "updated_at" = NOW()
  `, [adminId])
  console.log('✅ Admin user (PIN: 1234)')

  // Upsert staff
  const staff = [
    { name: 'Staff 1', pin: '1111', role: 'STAFF' },
    { name: 'Staff 2', pin: '2222', role: 'STAFF' },
    { name: 'Cashier 1', pin: '3333', role: 'STAFF_PLUS' },
  ]
  for (const s of staff) {
    const id = uuid()
    await client.query(`
      INSERT INTO users (id, name, pin, role, "isActive", "created_at", "updated_at")
      VALUES ($1, $2, $3, $4, true, NOW(), NOW())
      ON CONFLICT (pin) DO UPDATE SET name = $2, role = $4, "updated_at" = NOW()
    `, [id, s.name, s.pin, s.role])
  }
  console.log('✅ Staff users')

  // Seed categories and items
  for (const cat of categories) {
    await client.query(`
      INSERT INTO menu_categories (id, name, "nameAr", "displayOrder", "isActive", "created_at")
      VALUES ($1, $2, $3, $4, true, NOW())
      ON CONFLICT (id) DO UPDATE SET name = $2, "nameAr" = $3, "displayOrder" = $4
    `, [cat.id, cat.name, cat.nameAr, cat.displayOrder])

    const items = menuItems[cat.name] || []
    for (const item of items) {
      const itemId = uuid()
      await client.query(`
        INSERT INTO menu_items (id, name, "nameAr", price, currency, "isAvailable", "categoryId", "created_at", "updated_at")
        VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
      `, [itemId, item.name, item.nameAr || null, item.price, item.currency, cat.id])
    }
    console.log(`✅ ${cat.name}: ${items.length} items`)
  }

  // Seed tables
  for (const t of tables) {
    const id = uuid()
    await client.query(`
      INSERT INTO tables (id, number, capacity, status, section, "created_at")
      VALUES ($1, $2, $3, 'AVAILABLE', $4, NOW())
      ON CONFLICT (number) DO UPDATE SET capacity = $3, section = $4
    `, [id, t.number, t.capacity, t.section])
  }
  console.log(`✅ ${tables.length} tables`)

  console.log('🎉 Seeding complete!')
  await client.end()
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e.message || e)
  process.exit(1)
})
