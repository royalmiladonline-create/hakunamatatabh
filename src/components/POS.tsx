import { useState, useEffect, useCallback } from 'react'
import {
  Lock, LogOut, ShoppingCart, Table, BarChart3, Package, Users, ChefHat,
  Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Check, X,
  AlertCircle, Clock, ArrowLeft, Search, Filter, Download, Edit, Eye,
  CircleDot, Truck, Store, Utensils, ChevronRight, Hash, User, Settings
} from 'lucide-react'
import { printReceipt } from '@/lib/printReceipt'

interface User {
  id: string
  name: string
  role: 'STAFF' | 'STAFF_PLUS' | 'ADMIN'
}

interface MenuItem {
  id: string
  name: string
  nameAr?: string
  price: number
  currency: string
  categoryId: string
}

interface MenuCategory {
  id: string
  name: string
  nameAr?: string
  items: MenuItem[]
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

interface TableData {
  id: string
  number: number
  capacity: number
  status: string
  section: string
  orders?: Order[]
}

interface Order {
  id: string
  orderNumber: string
  type: string
  status: string
  subtotal: number
  tax: number
  total: number
  paymentMethod?: string
  paymentStatus: string
  deliveryPlatform?: string
  notes?: string
  createdAt: string
  completedAt?: string
  table?: { number: number }
  staff: { name: string }
  items: OrderItem[]
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  notes?: string
  menuItem: { name: string; price: number }
}

interface POSProps {
  onBackToWebsite: () => void
}

type POSView = 'login' | 'dashboard' | 'orders' | 'active-orders' | 'tables' | 'reports' | 'inventory' | 'staff' | 'menu-management'

export function POS({ onBackToWebsite }: POSProps) {
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<POSView>('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // PIN Login
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const handlePinLogin = async () => {
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits')
      return
    }

    setLoading(true)
    setPinError('')

    try {
      const res = await fetch('/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPinError(data.error || 'Invalid PIN')
        return
      }

      setUser(data.user)
      localStorage.setItem('pos_user', JSON.stringify(data.user))
      localStorage.setItem('pos_pin', pin)
    } catch (err) {
      setPinError('Connection error')
    } finally {
      setLoading(false)
      setPin('')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_pin')
    setView('dashboard')
  }

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {}
    }
  }, [])

  if (!user) {
    return (
      <PinLogin
        pin={pin}
        setPin={setPin}
        pinError={pinError}
        loading={loading}
        onSubmit={handlePinLogin}
        onBack={onBackToWebsite}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        view={view}
        onNavigate={setView}
        onLogout={handleLogout}
        onBackToWebsite={onBackToWebsite}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {view === 'dashboard' && <Dashboard user={user} onNavigate={setView} />}
        {view === 'orders' && <OrderScreen user={user} />}
        {view === 'tables' && <TableManagement user={user} />}
        {view === 'active-orders' && <ActiveOrders user={user} />}
        {view === 'reports' && user.role === 'ADMIN' && <Reports />}
        {view === 'inventory' && <Inventory user={user} />}
        {view === 'staff' && user.role === 'ADMIN' && <StaffManagement />}
        {view === 'menu-management' && user.role === 'ADMIN' && <MenuManagement />}
      </main>
    </div>
  )
}

// ===== PIN LOGIN =====
function PinLogin({ pin, setPin, pinError, loading, onSubmit, onBack }: {
  pin: string
  setPin: (v: string) => void
  pinError: string
  loading: boolean
  onSubmit: () => void
  onBack: () => void
}) {
  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length >= 4) {
        // Auto-submit after entering 4+ digits
        setTimeout(() => {
          setPin(newPin)
        }, 100)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onSubmit()
    }
  }

  useEffect(() => {
    if (pin.length >= 4 && !loading) {
      onSubmit()
    }
  }, [pin])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </button>

        <div className="text-center mb-8">
          <img src="/logo.png" alt="Hakuna Matata" className="w-20 h-20 mx-auto mb-4 object-contain rounded-lg" />
          <h1 className="text-2xl font-bold text-gray-900">Hakuna Matata POS</h1>
          <p className="text-gray-500 mt-1">Enter your PIN to login</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${
                i < pin.length
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-300'
              }`}
            >
              {i < pin.length && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
          ))}
        </div>

        {pinError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4 justify-center">
            <AlertCircle className="h-4 w-4" />
            {pinError}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-14 bg-gray-100 rounded-xl text-2xl font-bold text-gray-900 hover:bg-gray-200 active:scale-95 transition"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 bg-red-100 rounded-xl text-red-600 hover:bg-red-200 active:scale-95 transition"
          >
            <Trash2 className="h-6 w-6 mx-auto" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-gray-100 rounded-xl text-2xl font-bold text-gray-900 hover:bg-gray-200 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || loading}
            className="h-14 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
            ) : (
              <Check className="h-6 w-6 mx-auto" />
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

// ===== SIDEBAR =====
function Sidebar({ user, view, onNavigate, onLogout, onBackToWebsite }: {
  user: User
  view: POSView
  onNavigate: (v: POSView) => void
  onLogout: () => void
  onBackToWebsite: () => void
}) {
  const canView = (feature: string) => {
    if (user.role === 'ADMIN') return true
    if (user.role === 'STAFF_PLUS') {
      return ['dashboard', 'orders', 'tables', 'inventory', 'menu-management'].includes(feature)
    }
    return ['dashboard', 'orders'].includes(feature)
  }

  const menuItems = [
    { id: 'dashboard' as POSView, icon: BarChart3, label: 'Dashboard' },
    { id: 'orders' as POSView, icon: ShoppingCart, label: 'New Order' },
    { id: 'active-orders' as POSView, icon: Clock, label: 'Active Orders' },
    { id: 'tables' as POSView, icon: Table, label: 'Tables' },
    { id: 'inventory' as POSView, icon: Package, label: 'Inventory' },
    { id: 'reports' as POSView, icon: BarChart3, label: 'Reports', adminOnly: true },
    { id: 'staff' as POSView, icon: Users, label: 'Staff', adminOnly: true },
    { id: 'menu-management' as POSView, icon: Utensils, label: 'Menu', adminOnly: true },
  ]

  return (
    <aside className="w-64 bg-green-800 text-white flex flex-col">
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Hakuna Matata" className="h-10 w-10 object-contain rounded bg-white/10 p-1" />
          <div>
            <h1 className="font-bold text-lg">Hakuna Matata</h1>
            <p className="text-xs text-green-300">POS System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          if (item.adminOnly && user.role !== 'ADMIN') return null
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                view === item.id
                  ? 'bg-green-600 text-white'
                  : 'text-green-100 hover:bg-green-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-green-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-green-300">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={onBackToWebsite}
          className="w-full flex items-center gap-2 px-4 py-2 text-green-200 hover:text-white hover:bg-green-700 rounded-lg transition mb-2"
        >
          <Globe className="h-4 w-4" />
          Website
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:text-white hover:bg-red-600 rounded-lg transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// ===== DASHBOARD =====
function getBahrainDate(): string {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const bahrainMs = utcMs + 3 * 3600000
  const d = new Date(bahrainMs)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function Dashboard({ user, onNavigate }: { user: User; onNavigate: (v: POSView) => void }) {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    occupiedTables: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, tablesRes] = await Promise.all([
          fetch('/api/pos/orders?date=' + getBahrainDate()),
          fetch('/api/pos/tables'),
        ])
        const ordersData = await ordersRes.json()
        const tablesData = await tablesRes.json()

        const orders = ordersData.orders || []
        const tables = tablesData.tables || []

        setStats({
          todayOrders: orders.length,
          todayRevenue: orders.reduce((sum: number, o: any) => sum + o.total, 0),
          activeOrders: orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length,
          occupiedTables: tables.filter((t: any) => t.status === 'OCCUPIED').length,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data')
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Today's Orders"
          value={stats.todayOrders.toString()}
          color="green"
        />
        <StatCard
          icon={Banknote}
          label="Today's Revenue"
          value={`${stats.todayRevenue.toFixed(3)} BD`}
          color="yellow"
        />
        <StatCard
          icon={Clock}
          label="Active Orders"
          value={stats.activeOrders.toString()}
          color="blue"
        />
        <StatCard
          icon={Table}
          label="Occupied Tables"
          value={stats.occupiedTables.toString()}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('orders')}
            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center"
          >
            <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">New Order</span>
          </button>
          <button
            onClick={() => onNavigate('active-orders')}
            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center"
          >
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Active Orders</span>
          </button>
          <button
            onClick={() => onNavigate('tables')}
            className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition text-center"
          >
            <Table className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">View Tables</span>
          </button>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('reports')}
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <span className="font-medium text-gray-900">Reports</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any
  label: string
  value: string
  color: string
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ===== ORDER SCREEN =====
function OrderScreen({ user }: { user: User }) {
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tables, setTables] = useState<TableData[]>([])
  const [deliveryPlatform, setDeliveryPlatform] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [vatEnabled, setVatEnabled] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/pos/tables').then(r => r.json()),
    ]).then(([menuData, tablesData]) => {
      setMenu(menuData.categories || [])
      if (menuData.categories?.length > 0) {
        setActiveCategory(menuData.categories[0].id)
      }
      setTables(tablesData.tables || [])
    })
  }, [])

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id)
      if (existing) {
        return prev.map(c =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(c => {
          if (c.menuItem.id === itemId) {
            const newQty = c.quantity + delta
            return newQty > 0 ? { ...c, quantity: newQty } : null
          }
          return c
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  const cartTax = vatEnabled ? cartTotal * 0.10 : 0
  const cartGrandTotal = cartTotal + cartTax

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: orderType,
          tableId: orderType === 'DINE_IN' ? selectedTable : null,
          staffId: user.id,
          items: cart.map(c => ({
            menuItemId: c.menuItem.id,
            quantity: c.quantity,
            notes: c.notes,
          })),
          deliveryPlatform: orderType === 'DELIVERY' ? deliveryPlatform : null,
          notes,
          vatEnabled,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to create order')
        return
      }

      setOrderSuccess(data.order)
      setCart([])
      setSelectedTable('')
      setNotes('')
      setTimeout(() => setOrderSuccess(null), 10000)
    } catch (err) {
      alert('Connection error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMenu = menu.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => searchQuery === '' || cat.items.length > 0)

  const availableTables = tables.filter(t => t.status === 'AVAILABLE')

  return (
    <div className="p-6">
      {orderSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <Check className="h-5 w-5 flex-shrink-0" />
          <div className="flex items-center gap-3">
            <span className="font-medium">Order {orderSuccess.orderNumber} created!</span>
            <button
              onClick={() => printReceipt(orderSuccess)}
              className="bg-white text-green-700 px-3 py-1 rounded font-medium text-sm hover:bg-green-50 transition flex items-center gap-1"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => setOrderSuccess(null)}
              className="text-white/70 hover:text-white ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Grid */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOrderType('DINE_IN')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  orderType === 'DINE_IN' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Store className="h-4 w-4 inline mr-1" />
                Dine-in
              </button>
              <button
                onClick={() => setOrderType('TAKEAWAY')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  orderType === 'TAKEAWAY' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-1" />
                Takeaway
              </button>
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  orderType === 'DELIVERY' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Truck className="h-4 w-4 inline mr-1" />
                Delivery
              </button>
            </div>
          </div>

          {/* Table Selection */}
          {orderType === 'DINE_IN' && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
              <div className="flex flex-wrap gap-2">
                {availableTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedTable === table.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    Table {table.number} ({table.capacity} seats)
                  </button>
                ))}
                {availableTables.length === 0 && (
                  <p className="text-gray-500 text-sm">No tables available</p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Platform */}
          {orderType === 'DELIVERY' && (
            <div className="mb-4 p-4 bg-orange-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Platform</label>
              <div className="flex gap-2">
                {['TALABAT', 'KEETA', 'DIRECT'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => setDeliveryPlatform(platform)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      deliveryPlatform === platform
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(searchQuery ? filteredMenu : menu).map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(searchQuery ? filteredMenu : menu)
              .filter(c => c.id === activeCategory || searchQuery)
              .flatMap(c => c.items)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-lg p-4 text-left hover:shadow-lg transition border border-gray-100"
                >
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                  <p className="text-green-600 font-bold mt-2">
                    {item.price.toFixed(3)} {item.currency === 'FILLS' ? 'fills' : 'BD'}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-lg p-4 h-fit sticky top-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
          </h3>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items in cart</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-auto">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.menuItem.name}</p>
                      <p className="text-green-600 text-sm">{item.menuItem.price.toFixed(3)} BD</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                        className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                        className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <textarea
                placeholder="Order notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm mb-4 resize-none"
                rows={2}
              />

              {/* VAT Toggle */}
              <div className="mb-3 flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">VAT (10%)</span>
                <button
                  onClick={() => setVatEnabled(!vatEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    vatEnabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    vatEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{cartTotal.toFixed(3)} BD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT (10%) {vatEnabled ? '' : '(excluded)'}</span>
                  <span>{cartTax.toFixed(3)} BD</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">{cartGrandTotal.toFixed(3)} BD</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || cart.length === 0 || (orderType === 'DINE_IN' && !selectedTable)}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== ACTIVE ORDERS =====
function ActiveOrders({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentOrder, setPaymentOrder] = useState<any>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/pos/orders?date=' + getBahrainDate())
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchOrders()
    } catch (err) {
      alert('Failed to update order')
    }
  }

  const completeOrder = async (orderId: string, paymentMethod: string) => {
    try {
      const res = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', paymentMethod, paymentStatus: 'PAID' }),
      })
      if (res.ok) {
        setPaymentOrder(null)
        fetchOrders()
      }
    } catch (err) {
      alert('Failed to complete order')
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'border-yellow-300 bg-yellow-50',
    PREPARING: 'border-blue-300 bg-blue-50',
    READY: 'border-green-300 bg-green-50',
    COMPLETED: 'border-gray-300 bg-gray-50 opacity-75',
    CANCELLED: 'border-red-300 bg-red-50 opacity-50',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    PREPARING: 'Preparing',
    READY: 'Ready for Pickup',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const activeOrders = orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status))
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED')

  return (
    <div className="p-6">
      {/* Payment Modal */}
      {paymentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
              <button onClick={() => setPaymentOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">{paymentOrder.orderNumber}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{paymentOrder.total.toFixed(3)} BD</p>
            </div>
            <p className="text-sm text-gray-600 mb-3 font-medium">Select payment method:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => completeOrder(paymentOrder.id, 'CASH')}
                className="p-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Banknote className="h-5 w-5" />
                Cash
              </button>
              <button
                onClick={() => completeOrder(paymentOrder.id, 'CARD')}
                className="p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Card
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
        <div className="flex items-center gap-4">
          {activeOrders.length > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">{activeOrders.length} active</span>
          )}
          <span className="text-sm text-gray-500">{orders.length} total today</span>
        </div>
      </div>

      {activeOrders.length === 0 && completedOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No orders yet today</p>
        </div>
      ) : (
        <>
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {activeOrders.map((order: any) => (
                <div key={order.id} className={`rounded-xl border-2 p-4 ${statusColors[order.status] || statusColors.PENDING}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('en-GB', { timeStyle: 'short', hour12: true })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'READY' ? 'bg-green-200 text-green-700' :
                      order.status === 'PREPARING' ? 'bg-blue-200 text-blue-700' :
                      'bg-yellow-200 text-yellow-700'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{item.quantity}x {item.menuItem?.name || 'Unknown'}</span>
                        <span className="text-gray-600">{((item.price || 0) * item.quantity).toFixed(3)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-2 mb-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{order.total.toFixed(3)} BD</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.type === 'DINE_IN' ? '🍽️ Dine-In' : order.type === 'TAKEAWAY' ? '🛒 Takeaway' : '🚗 Delivery'}
                      {order.table?.number ? ` • Table #${order.table.number}` : ''}
                    </div>
                  </div>

                  {/* Status Flow Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
                      >
                        🔥 Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => updateStatus(order.id, 'READY')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition"
                      >
                        ✅ Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => setPaymentOrder(order)}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-yellow-600 transition"
                      >
                        💳 Pay & Complete
                      </button>
                    )}
                    <button
                      onClick={() => printReceipt(order)}
                      className="px-3 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm hover:bg-violet-200 transition"
                      title="Print Receipt"
                    >
                      🖨️
                    </button>
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => { if (confirm('Cancel this order?')) updateStatus(order.id, 'CANCELLED') }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition"
                        title="Cancel Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4">Completed Today</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {completedOrders.map((order: any) => (
                  <div key={order.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-700">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {order.total.toFixed(3)} BD • {order.paymentMethod || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => printReceipt(order)}
                        className="px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ===== TABLE MANAGEMENT =====
function TableManagement({ user }: { user: User }) {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/pos/tables')
      const data = await res.json()
      setTables(data.tables || [])
    } catch (err) {
      console.error('Failed to fetch tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
    const interval = setInterval(fetchTables, 10000)
    return () => clearInterval(interval)
  }, [])

  const updateTableStatus = async (tableId: string, status: string) => {
    try {
      await fetch(`/api/pos/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchTables()
    } catch (err) {
      console.error('Failed to update table')
    }
  }

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-500',
    OCCUPIED: 'bg-red-500',
    RESERVED: 'bg-yellow-500',
  }

  const indoorTables = tables.filter(t => t.section === 'indoor')
  const outdoorTables = tables.filter(t => t.section === 'outdoor')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Table Management</h1>

      {/* Legend */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-gray-600">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-sm text-gray-600">Reserved</span>
        </div>
      </div>

      {/* Indoor Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Store className="h-5 w-5" />
          Indoor
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {indoorTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              statusColors={statusColors}
              onStatusChange={updateTableStatus}
            />
          ))}
        </div>
      </div>

      {/* Outdoor Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Outdoor
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {outdoorTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              statusColors={statusColors}
              onStatusChange={updateTableStatus}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TableCard({ table, statusColors, onStatusChange }: {
  table: TableData
  statusColors: Record<string, string>
  onStatusChange: (id: string, status: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className={`p-4 rounded-xl ${statusColors[table.status]} text-white cursor-pointer transition hover:scale-105`}>
        <div className="text-center">
          <p className="text-2xl font-bold">#{table.number}</p>
          <p className="text-sm opacity-90">{table.capacity} seats</p>
          <p className="text-xs opacity-75 mt-1">{table.status}</p>
        </div>
        {table.orders && table.orders.length > 0 && (
          <div className="mt-2 text-xs border-t border-white/30 pt-2">
            {table.orders.length} active order(s)
          </div>
        )}
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10">
          {table.status === 'AVAILABLE' && (
            <>
              <button
                onClick={() => onStatusChange(table.id, 'OCCUPIED')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded text-red-600"
              >
                Mark Occupied
              </button>
              <button
                onClick={() => onStatusChange(table.id, 'RESERVED')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-yellow-50 rounded text-yellow-600"
              >
                Mark Reserved
              </button>
            </>
          )}
          {table.status === 'OCCUPIED' && (
            <button
              onClick={() => onStatusChange(table.id, 'AVAILABLE')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded text-green-600"
            >
              Mark Available
            </button>
          )}
          {table.status === 'RESERVED' && (
            <>
              <button
                onClick={() => onStatusChange(table.id, 'OCCUPIED')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded text-red-600"
              >
                Check In
              </button>
              <button
                onClick={() => onStatusChange(table.id, 'AVAILABLE')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded text-green-600"
              >
                Cancel Reservation
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ===== REPORTS =====
function Reports() {
  const [report, setReport] = useState<any>(null)
  const [date, setDate] = useState(getBahrainDate())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/pos/reports/daily?date=${date}`)
      .then(r => r.json())
      .then(data => {
        setReport(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [date])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{report.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">{report.totalRevenue?.toFixed(3)} BD</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-500 text-sm">Cash Sales</p>
              <p className="text-3xl font-bold text-gray-900">{report.cashTotal?.toFixed(3)} BD</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-500 text-sm">Card Sales</p>
              <p className="text-3xl font-bold text-gray-900">{report.cardTotal?.toFixed(3)} BD</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Orders by Type</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-600" />
                    Dine-in
                  </span>
                  <span className="font-bold">{report.dineInOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    Takeaway
                  </span>
                  <span className="font-bold">{report.takeawayOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-600" />
                    Delivery
                  </span>
                  <span className="font-bold">{report.deliveryOrders}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Top Items</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {Object.entries(report.categorySales || {})
                  .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)
                  .slice(0, 10)
                  .map(([name, data]: any) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{name}</span>
                      <span className="text-gray-500">{data.count}x - {data.revenue.toFixed(3)} BD</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ===== INVENTORY =====
function Inventory({ user }: { user: User }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'kg', minStock: 10, cost: 0, supplier: '' })

  useEffect(() => {
    fetch('/api/pos/inventory')
      .then(r => r.json())
      .then(data => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddItem = async () => {
    try {
      const res = await fetch('/api/pos/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        const data = await res.json()
        setItems([...items, { ...data.item, transactions: [] }])
        setShowAddForm(false)
        setNewItem({ name: '', quantity: 0, unit: 'kg', minStock: 10, cost: 0, supplier: '' })
      }
    } catch (err) {
      alert('Failed to add item')
    }
  }

  const handleUpdateStock = async (itemId: string, newQuantity: number, type: string) => {
    try {
      const res = await fetch(`/api/pos/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity, type, transactionQuantity: newQuantity }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems(items.map(i => i.id === itemId ? { ...i, quantity: data.item.quantity } : i))
      }
    } catch (err) {
      alert('Failed to update stock')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {items.filter(i => i.quantity <= i.minStock).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">Low Stock Alert</span>
          </div>
          <div className="text-sm text-red-600">
            {items.filter(i => i.quantity <= i.minStock).map(i => i.name).join(', ')}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Add New Item</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="kg">Kilograms</option>
              <option value="liters">Liters</option>
              <option value="pcs">Pieces</option>
            </select>
            <input
              type="number"
              placeholder="Min stock"
              value={newItem.minStock}
              onChange={(e) => setNewItem({ ...newItem, minStock: parseFloat(e.target.value) || 0 })}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddItem}
              disabled={!newItem.name}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                <td className="px-6 py-4">{item.minStock} {item.unit}</td>
                <td className="px-6 py-4 text-gray-500">{item.supplier || '-'}</td>
                <td className="px-6 py-4">
                  {item.quantity <= item.minStock ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low Stock</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      const qty = prompt(`Update stock for ${item.name} (current: ${item.quantity})`)
                      if (qty !== null) {
                        handleUpdateStock(item.id, parseFloat(qty), 'ADJUSTMENT')
                      }
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No inventory items yet. Add your first item!
          </div>
        )}
      </div>
    </div>
  )
}

// ===== STAFF MANAGEMENT =====
function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', pin: '', role: 'STAFF' })

  useEffect(() => {
    fetch('/api/pos/staff')
      .then(r => r.json())
      .then(data => {
        setStaff(data.staff || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddStaff = async () => {
    try {
      const res = await fetch('/api/pos/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
        return
      }

      setStaff([data.user, ...staff])
      setShowAddForm(false)
      setNewStaff({ name: '', pin: '', role: 'STAFF' })
    } catch (err) {
      alert('Failed to add staff')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/pos/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s))
      }
    } catch (err) {
      alert('Failed to update staff')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Add New Staff Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="PIN (4-6 digits)"
              value={newStaff.pin}
              onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
              maxLength={6}
            />
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="STAFF">Staff (Orders Only)</option>
              <option value="STAFF_PLUS">Staff+ (Orders + Payments + Inventory)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddStaff}
              disabled={!newStaff.name || !newStaff.pin}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Add Staff
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{person.name}</td>
                <td className="px-6 py-4 font-mono text-gray-600">{person.pin}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    person.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    person.role === 'STAFF_PLUS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {person.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(person.id, person.isActive)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      person.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {person.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500">{person._count?.orders || 0}</td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===== MENU MANAGEMENT =====
function MenuManagement() {
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price: 0, currency: 'BD', categoryId: '' })

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        setMenu(data.categories || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddItem = async () => {
    try {
      const res = await fetch('/api/pos/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        const data = await res.json()
        // Refresh menu
        const menuRes = await fetch('/api/menu')
        const menuData = await menuRes.json()
        setMenu(menuData.categories || [])
        setShowAddForm(false)
        setNewItem({ name: '', price: 0, currency: 'BD', categoryId: '' })
      }
    } catch (err) {
      alert('Failed to add item')
    }
  }

  const handleUpdateItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const res = await fetch(`/api/pos/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const menuRes = await fetch('/api/menu')
        const menuData = await menuRes.json()
        setMenu(menuData.categories || [])
        setEditingItem(null)
      }
    } catch (err) {
      alert('Failed to update item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/pos/menu/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const menuRes = await fetch('/api/menu')
        const menuData = await menuRes.json()
        setMenu(menuData.categories || [])
      }
    } catch (err) {
      alert('Failed to delete item')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Add New Menu Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
              className="p-2 border border-gray-300 rounded-lg"
              step="0.001"
            />
            <select
              value={newItem.currency}
              onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="BD">BD (Dinar)</option>
              <option value="FILLS">Fills</option>
            </select>
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select category</option>
              {menu.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.categoryId}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <div className="space-y-6">
        {menu.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">{category.name}</h3>
              {category.nameAr && <p className="text-sm text-gray-500" dir="rtl">{category.nameAr}</p>}
            </div>
            <div className="divide-y divide-gray-100">
              {category.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.nameAr && <p className="text-sm text-gray-500" dir="rtl">{item.nameAr}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{item.price.toFixed(3)} {item.currency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}