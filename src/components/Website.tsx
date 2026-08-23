import { useState, useEffect, useCallback } from 'react'
import { MapPin, Phone, Clock, Facebook, Instagram, Twitter, Utensils, ChevronDown, ExternalLink } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  nameAr?: string
  price: number
  currency: string
  description?: string
}

interface MenuCategory {
  id: string
  name: string
  nameAr?: string
  items: MenuItem[]
}

interface WebsiteProps {
  onOpenPOS: () => void
}

const translations = {
  en: {
    nav: { home: 'Home', menu: 'Menu', about: 'About', contact: 'Contact', staffLogin: 'Staff Login' },
    hero: {
      title: 'Hakuna Matata',
      subtitle: 'Authentic Kenyan cuisine in the heart of Bahrain. Taste the flavors of East Africa!',
      viewMenu: 'View Our Menu',
      visitUs: 'Visit Us',
    },
    highlights: {
      authentic: { title: 'Authentic Recipes', desc: 'Traditional Kenyan dishes prepared with love and authentic spices' },
      fresh: { title: 'Fresh Daily', desc: 'All meals prepared fresh daily with the finest ingredients' },
      delivery: { title: 'Delivery Available', desc: 'Order via Talabat, Keeta, or visit us in Manama' },
    },
    menu: {
      title: 'Our Menu',
      subtitle: 'Explore our delicious selection of Kenyan cuisine, from hearty main dishes to traditional breakfast items',
    },
    about: {
      title: 'About Hakuna Matata',
      p1: 'Welcome to Hakuna Matata Restaurant, where we bring the authentic flavors of Kenya to Bahrain. Our name means "no worries" in Swahili, and that\'s exactly how we want you to feel when you dine with us.',
      p2: 'From our signature Fish & Ugali to our traditional Breakfast Platters, every dish is prepared with fresh ingredients and traditional recipes passed down through generations.',
      p3: 'Whether you\'re craving the taste of home or exploring Kenyan cuisine for the first time, we\'re here to make your dining experience memorable.',
      hours: 'Open Daily: 8:00 AM - 11:00 PM (Fridays: 8:00 AM - 12:00 AM)',
      noWorries: 'No Worries, Just Good Food!',
    },
    contact: {
      title: 'Visit Us',
      subtitle: 'We\'d love to see you! Here\'s how to find us.',
      address: 'Address',
      phone: 'Call Us',
      hours: 'Opening Hours',
      hoursText: { sunThu: 'Sun - Thu: 8:00 AM - 11:00 PM', fri: 'Friday: 8:00 AM - 12:00 AM', sat: 'Saturday: 8:00 AM - 11:00 PM' },
      orderOnline: 'Order Online',
      orderSubtitle: 'Available on your favorite delivery platforms',
      orderTalabat: 'Order on Talabat',
      orderKeeta: 'Order on Keeta',
    },
    footer: { rights: '© 2026 Hakuna Matata Restaurant W.L.L. All rights reserved.' },
    categories: {
      'Main Dishes': 'Main Dishes',
      'Breakfast': 'Breakfast',
      'Extra Sides': 'Extra Sides',
      'Drinks': 'Drinks',
      'Sweets': 'Sweets',
    },
    currency: { BD: 'BD', FILLS: 'fills' },
  },
  ar: {
    nav: { home: 'الرئيسية', menu: 'القائمة', about: 'من نحن', contact: 'تواصل معنا', staffLogin: 'دخول الموظفين' },
    hero: {
      title: 'هاكونا ماتاتا',
      subtitle: 'المأكولات الكينية الأصيلة في قلب البحرين. تذوق نكهات شرق أفريقيا!',
      viewMenu: 'عرض القائمة',
      visitUs: 'زورنا',
    },
    highlights: {
      authentic: { title: 'وصفات أصيلة', desc: 'أطباق كينية تقليدية محضرة بحب وبهارات أصيلة' },
      fresh: { title: 'طازج يومياً', desc: 'جميع الوجبات محضرة طازجة يومياً بأجود المكونات' },
      delivery: { title: 'التوصيل متاح', desc: 'اطلب عبر تليمونت أو كيتا أو زرنا في المنامة' },
    },
    menu: {
      title: 'قائمتنا',
      subtitle: 'استكشف تشكيلتنا اللذيذة من المأكولات الكينية، من الأطباق الرئيسية إلى وجبات الإفطار التقليدية',
    },
    about: {
      title: 'عن هاكونا ماتاتا',
      p1: 'مرحباً بكم في مطعم هاكونا ماتاتا، حيث نقدم لكم النكهات الكينية الأصيلة في البحرين. اسمنا يعني "لا تقلق" باللغة السواحلية، وهذه هي الشعور الذي نريدكم أن تشعروا به عند تناول الطعام معنا.',
      p2: 'من طبقنا المميز سمك وأوغالي إلى أطباق الإفطار التقليدية، كل طبق يُحضّر بمكونات طازجة ووصفات تقليدية انتقلت عبر الأجيال.',
      p3: 'سواء كنت تتوق إلى طعم الوطن أو تستكشف المأكولات الكينية للمرة الأولى، نحن هنا لنجعل تجربة تناول الطعام لا تُنسى.',
      hours: 'مفتوح يومياً: 8:00 صباحاً - 11:00 مساءً (الجمعة: 8:00 صباحاً - 12:00 منتصف الليل)',
      noWorries: 'لا تقلق، فقط طعام جيد!',
    },
    contact: {
      title: 'زورنا',
      subtitle: 'يسعدنا رؤيتكم! إليكم كيفية الوصول إلينا.',
      address: 'العنوان',
      phone: 'اتصل بنا',
      hours: 'ساعات العمل',
      hoursText: { sunThu: 'الأحد - الخميس: 8:00 صباحاً - 11:00 مساءً', fri: 'الجمعة: 8:00 صباحاً - 12:00 منتصف الليل', sat: 'السبت: 8:00 صباحاً - 11:00 مساءً' },
      orderOnline: 'اطلب أونلاين',
      orderSubtitle: 'متاح على منصات التوصيل المفضلة لديك',
      orderTalabat: 'اطلب من تليمونت',
      orderKeeta: 'اطلب من كيتا',
    },
    footer: { rights: '© ٢٠٢٦ مطعم هاكونا ماتاتا ذ.م.م. جميع الحقوق محفوظة.' },
    categories: {
      'Main Dishes': 'الأطباق الرئيسية',
      'Breakfast': 'الإفطار',
      'Extra Sides': 'إضافات',
      'Drinks': 'المشروبات',
      'Sweets': 'الحلويات',
    },
    currency: { BD: 'دينار', FILLS: 'فلس' },
  },
}

const menuTranslations: Record<string, Record<string, string>> = {
  'Fish & Ugali': { ar: 'سمك وأوغالي' },
  'Fish Wet Fry with Ugali': { ar: 'سمك مقلي مع صلصة وأوغالي' },
  'Coconut Cassava with Fish': { ar: 'كسافا بالجوز مع سمك' },
  'Coconut Beans & 3 Chapati': { ar: 'فاصوليا بالجوز و ٣ شباتي' },
  'Coconut Fish (Kupaka) with Rice': { ar: 'سمك كوباكا بالجوز مع أرز' },
  'Fish (Full) & Chips': { ar: 'سمك كامل مع بطاطس' },
  'Matumbo (Tripe) with Ugali': { ar: 'ماتومبو (كبدة معدة) مع أوغالي' },
  'Beef Wet Fry with Ugali': { ar: 'لحم بقر مقلي مع أوغالي' },
  'Soup with 3 Chapatis': { ar: 'حساء مع ٣ شباتي' },
  'Beef Stew with 3 Chapati': { ar: 'يخنطة لحم مع ٣ شباتي' },
  'Mukimo with Beef Stew': { ar: 'موكيمو مع يخنطة لحم' },
  'Beef Matoke': { ar: 'لحم بقر مع ماتوكي' },
  'Githeri with Avocado': { ar: 'غيثيري مع أفوكادو' },
  'Chicken (Quarter) & Chips': { ar: 'دجاج (ربع) مع بطاطس' },
  'Chicken Biryani': { ar: 'برياني دجاج' },
  'Meat Pilau': { ar: 'بليلة لحم' },
  'Choma Ugali with Greens': { ar: 'تشوما أوغالي مع خضروات' },
  'Chicken Tikka Chips': { ar: 'تيكا دجاج مع بطاطس' },
  'Chicken Tikka Chips Masala': { ar: 'تيكا دجاج مع بطاطس ماسالا' },
  'Omena Ugali Greens': { ar: 'أومينا أوغالي مع خضروات' },
  'Kenyan Pizza with Chips Masala': { ar: 'بيتزا كينية مع بطاطس ماسالا' },
  'Swahili Platter': { ar: 'طبق سواحيلي' },
  'Mbahazi Mahamri 10pcs': { ar: 'مهامري ١٠ قطع' },
  'Zege (Fries & Omelette)': { ar: 'زيجي (بطاطس وأومليت)' },
  'Chapati Egg Roll (Rolex)': { ar: 'لفائف شباتي بالبيض (رولكس)' },
  'Smocha (Sausage Chapati)': { ar: 'سموشا (شباتي بالسوفتاج)' },
  'Spring Rolls 3pcs': { ar: 'لفائف ربيعية ٣ قطع' },
  'Samosa Beef 5pcs': { ar: 'سموسا لحم ٥ قطع' },
  'Kebab Swahili 3pcs': { ar: 'كباب سواحيلي ٣ قطع' },
  'Mitai 5pcs': { ar: 'ميتي ٥ قطع' },
  'Vitumbua 3pcs': { ar: 'فيتومبوا ٣ قطع' },
  'Ngumu 4pcs': { ar: 'نجومو ٤ قطع' },
  'Viazi Karai 10pcs': { ar: 'فيازي كاراي ١٠ قطع' },
  'Bajia 8pcs': { ar: 'باجيا ٨ قطع' },
  'Zanzibari Nutella 5pcs': { ar: 'زنجباري نوتيلا ٥ قطع' },
  'Zanzibari Plain 10pcs': { ar: 'زنجباري عادي ١٠ قطع' },
  'Zanzibari Cheese 8pcs': { ar: 'زنجباري جبنة ٨ قطع' },
  'White Rice': { ar: 'أرز أبيض' },
  'Ugali': { ar: 'أوغالي' },
  'Chapati': { ar: 'شباتي' },
  'Fries': { ar: 'بطاطس مقلية' },
  'Chips Masala': { ar: 'بطاطس ماسالا' },
  'Kachumbari Salad': { ar: 'سلطة كاتشومباري' },
  'Greens': { ar: 'خضروات' },
  'Fresh Juices': { ar: 'عصائر طازجة' },
  'Soft Drink': { ar: 'مشروب غازي' },
  'Water': { ar: 'ماء' },
  'Elkasus Chai': { ar: 'شاي الكاسوس' },
  'Chai Masala': { ar: 'شاي ماسالا' },
  'Black Tea': { ar: 'شاي أحمر' },
  'Achari': { ar: 'آشاري' },
  'Mabuyu': { ar: 'مابويو' },
  'Labania': { ar: 'لبانيا' },
}

export function Website({ onOpenPOS }: WebsiteProps) {
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const t = translations[lang]
  const isRtl = lang === 'ar'

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data.categories || [])
        if (data.categories?.length > 0) {
          setActiveCategory(data.categories[0].id)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const getItemName = (item: MenuItem) => {
    if (lang === 'ar' && item.nameAr) return item.nameAr
    if (lang === 'ar' && menuTranslations[item.name]?.ar) return menuTranslations[item.name].ar
    return item.name
  }

  const getCategoryName = (cat: MenuCategory) => {
    if (lang === 'ar' && cat.nameAr) return cat.nameAr
    return (t.categories as Record<string, string>)[cat.name] || cat.name
  }

  const formatPrice = (price: number, currency: string) => {
    const cur = currency === 'FILLS' ? t.currency.FILLS : t.currency.BD
    return `${price.toFixed(3)} ${cur}`
  }

  return (
    <div className={`min-h-screen ${isRtl ? 'font-[Noto_Kufi_Arabic,_Arial]' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-green-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="/logo.png" alt="Hakuna Matata" className="h-10 w-10 object-contain rounded" />
              <span className="text-xl font-bold">Hakuna Matata</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('home')} className="hover:text-yellow-400 transition">{t.nav.home}</button>
              <button onClick={() => scrollToSection('menu')} className="hover:text-yellow-400 transition">{t.nav.menu}</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-yellow-400 transition">{t.nav.about}</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-yellow-400 transition">{t.nav.contact}</button>

              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="px-3 py-1 rounded-full border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-green-800 transition text-sm font-bold"
              >
                {lang === 'en' ? 'عربي' : 'EN'}
              </button>

              <button
                onClick={onOpenPOS}
                className="bg-yellow-500 text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
              >
                {t.nav.staffLogin}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="px-2 py-1 rounded border border-yellow-400 text-yellow-400 text-xs font-bold"
              >
                {lang === 'en' ? 'عربي' : 'EN'}
              </button>
              <button
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ChevronDown className={`h-6 w-6 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 px-4 hover:bg-green-600 rounded">{t.nav.home}</button>
              <button onClick={() => scrollToSection('menu')} className="block w-full text-left py-2 px-4 hover:bg-green-600 rounded">{t.nav.menu}</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 px-4 hover:bg-green-600 rounded">{t.nav.about}</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 px-4 hover:bg-green-600 rounded">{t.nav.contact}</button>
              <button
                onClick={onOpenPOS}
                className="block w-full text-left py-2 px-4 bg-yellow-500 text-green-800 rounded font-semibold"
              >
                {t.nav.staffLogin}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-green-700 via-green-600 to-yellow-600 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-yellow-300 mb-2">
            مطعم هاكونا ماتاتا ذ.م.م
          </p>
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('menu')}
              className="bg-yellow-500 text-green-800 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition transform hover:scale-105"
            >
              {t.hero.viewMenu}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="border-2 border-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white/10 transition"
            >
              {t.hero.visitUs}
            </button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.highlights.authentic.title}</h3>
              <p className="text-gray-600">{t.highlights.authentic.desc}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.highlights.fresh.title}</h3>
              <p className="text-gray-600">{t.highlights.fresh.desc}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.highlights.delivery.title}</h3>
              <p className="text-gray-600">{t.highlights.delivery.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.menu.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.menu.subtitle}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {lang === 'en' ? '* All prices include 10% VAT' : '* جميع الأسعار تشمل ضريبة القيمة المضافة ١٠٪'}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {menu.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  activeCategory === category.id
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-100 border border-gray-200'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {menu.filter(c => c.id === activeCategory).map((category) => (
              <div key={category.id}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-green-700">{getCategoryName(category)}</h3>
                  {lang === 'en' && category.nameAr && (
                    <p className="text-lg text-gray-500" dir="rtl">{category.nameAr}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 ${isRtl ? 'text-right' : ''}`}>
                        <h4 className="font-semibold text-gray-900">{getItemName(item)}</h4>
                        {lang === 'en' && item.nameAr && (
                          <p className="text-sm text-gray-500" dir="rtl">{item.nameAr}</p>
                        )}
                        {lang === 'ar' && (
                          <p className="text-sm text-gray-500" dir="ltr">{item.name}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className={`${isRtl ? 'text-left mr-4' : 'text-right ml-4'}`}>
                        <span className="text-lg font-bold text-green-700">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={isRtl ? 'text-right' : ''}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t.about.title}</h2>
              <p className="text-gray-600 mb-4">{t.about.p1}</p>
              <p className="text-gray-600 mb-4">{t.about.p2}</p>
              <p className="text-gray-600 mb-6">{t.about.p3}</p>
              <div className={`flex items-center gap-4 text-gray-600 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Clock className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>{t.about.hours}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl p-8 text-white text-center">
              <img src="/logo.png" alt="Hakuna Matata" className="h-24 w-24 mx-auto mb-4 object-contain rounded-lg bg-white/20 p-2" />
              <h3 className="text-2xl font-bold mb-2">{t.hero.title}</h3>
              <p className="text-green-100 mb-4">مطعم هاكونا ماتاتا ذ.م.م</p>
              <p className="text-lg">{t.about.noWorries}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.contact.title}</h2>
            <p className="text-gray-600">{t.contact.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Address */}
            <div className={`bg-white rounded-xl p-6 shadow-lg text-center ${isRtl ? 'font-[Noto_Kufi_Arabic]' : ''}`}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.contact.address}</h3>
              <p className="text-gray-600">
                {isRtl ? 'بلوك ٣١٨، محل ٧٢٠' : 'Block 318, Shop 720'}<br />
                {isRtl ? 'الشارع ١٨٠٩' : 'Street 1809'}<br />
                {isRtl ? 'المنامة ٩٧٣، البحرين' : 'Manama 973, Bahrain'}
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.contact.phone}</h3>
              <a href="tel:+97377916767" className="text-green-700 text-lg font-semibold hover:underline" dir="ltr">
                +973 7791 6767
              </a>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.contact.hours}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.contact.hoursText.sunThu}<br />
                {t.contact.hoursText.fri}<br />
                {t.contact.hoursText.sat}
              </p>
            </div>
          </div>

          {/* Order Online */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-yellow-500 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">{t.contact.orderOnline}</h3>
            <p className="mb-6 text-green-100">
              {t.contact.orderSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.talabat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                {t.contact.orderTalabat} <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.keeta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                {t.contact.orderKeeta} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Hakuna Matata" className="h-8 w-8 object-contain rounded" />
              <span className="text-lg font-bold">Hakuna Matata Restaurant</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-yellow-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-green-200 text-sm">
              {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}