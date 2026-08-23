export interface PrintOrder {
  orderNumber: string
  type: string
  created_at: string
  createdAt?: string
  subtotal: number
  tax: number
  total: number
  deliveryPlatform?: string
  staff: { name: string }
  table?: { number: number }
  items: { quantity: number; price: number; menuItem: { name: string } }[]
}

export function printReceipt(order: PrintOrder) {
  const dateStr = order.created_at || order.createdAt || ''
  const orderDate = new Date(dateStr).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const typeLabel =
    order.type === 'DINE_IN'
      ? 'Dine-In'
      : order.type === 'TAKEAWAY'
        ? 'Takeaway'
        : 'Delivery'
  const tableLabel = order.table ? `Table #${order.table.number}` : ''

  const itemsHtml = order.items
    .map(
      (item) =>
        `<div style="display:flex;justify-content:space-between;padding:3px 0;font-weight:bold;">
          <span>${item.quantity}x ${item.menuItem.name}</span>
          <span>${(item.price * item.quantity).toFixed(3)}</span>
        </div>`
    )
    .join('')

  const vatLine =
    order.tax > 0
      ? `<div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:bold;"><span>VAT (10%)</span><span>${order.tax.toFixed(3)} BD</span></div>`
      : ''

  const html = `<!DOCTYPE html>
<html><head><title>Receipt</title></head>
<body style="margin:0;padding:0;background:#fff;">
<div style="font-family:'Courier New',Courier,monospace;font-size:14px;color:#000;width:72mm;padding:4mm;font-weight:bold;">
  <div style="text-align:center;font-size:18px;font-weight:bold;">HAKUNA MATATA</div>
  <div style="text-align:center;font-size:11px;color:#555;">Restaurant &amp; Café</div>
  <div style="text-align:center;font-size:9px;color:#888;">CR: 174753-1</div>
  <div style="border-top:1px dashed #000;margin:6px 0;"></div>
  <div style="display:flex;justify-content:space-between;">
    <span style="font-weight:bold;">${order.orderNumber}</span>
    <span>${orderDate}</span>
  </div>
  <div style="font-weight:bold;">${typeLabel}${tableLabel ? ' — ' + tableLabel : ''}</div>
  ${order.deliveryPlatform ? `<div style="font-weight:bold;">Platform: ${order.deliveryPlatform}</div>` : ''}
  <div style="font-weight:bold;">Staff: ${order.staff.name}</div>
  <div style="border-top:2px solid #000;margin:6px 0;"></div>
  ${itemsHtml}
  <div style="border-top:2px solid #000;margin:6px 0;"></div>
  <div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:bold;"><span>Subtotal</span><span>${order.subtotal.toFixed(3)} BD</span></div>
  ${vatLine}
  <div style="display:flex;justify-content:space-between;padding:4px 0 2px;font-weight:bold;font-size:16px;border-top:1px solid #000;margin-top:4px;">
    <span>TOTAL</span><span>${order.total.toFixed(3)} BD</span>
  </div>
  <div style="border-top:1px dashed #000;margin:6px 0;"></div>
  <div style="text-align:center;font-size:11px;font-weight:bold;">Thank you for dining with us!</div>
  <div style="text-align:center;font-size:10px;color:#777;font-weight:bold;">Hakuna Matata — No Worries!</div>
</div>
</body></html>`

  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) {
    alert('Please allow popups to print receipts.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.onload = () => {
    win.print()
  }
}
