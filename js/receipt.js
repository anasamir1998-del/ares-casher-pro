/* ============================================================
   ARES Casher Pro — Receipt Service (Thermal Printer 80mm)
   ============================================================ */

const Receipt = {
    /**
     * Print a thermal receipt for a sale/invoice.
     * Reads company settings dynamically from db each time.
     */
    print(sale) {
        if (!sale) return;

        // Read settings dynamically every time
        const shopName = db.getSetting('company_name', 'ARES Casher Pro');
        const shopNameEn = db.getSetting('company_name_en', '');
        const shopPhone = db.getSetting('company_phone', '');
        const shopAddress = db.getSetting('company_address', '');
        const vatNumber = db.getSetting('vat_number', '');
        const logo = db.getSetting('company_logo', '');
        const currency = db.getSetting('currency', 'ر.س');

        // Build items HTML
        const items = sale.items || [];
        const itemsHtml = items.map(item => {
            const qty = item.qty || item.quantity || 1;
            const price = item.price || 0;
            const total = (price * qty).toFixed(2);
            return `
            <tr>
                <td style="text-align:start;">${Utils.escapeHTML(item.name)}</td>
                <td style="text-align:center;">${qty}</td>
                <td style="text-align:end;">${price.toFixed(2)}</td>
                <td style="text-align:end;">${total}</td>
            </tr>`;
        }).join('');

        // Calculate totals from sale data
        const subtotal = sale.subtotal || sale.total || 0;
        const vatAmount = sale.vatAmount || sale.tax || 0;
        const total = sale.total || 0;
        const paid = sale.paid || sale.total || 0;
        const change = sale.change || 0;
        const paymentMethod = sale.paymentMethod || sale.method || 'نقدي';
        const invoiceNumber = sale.invoiceNumber || sale.id || '—';
        const cashierName = sale.cashierName || sale.cashier || '—';
        const customerName = sale.customerName || '';
        const saleDate = sale.createdAt || sale.date || new Date().toISOString();
        const vatRate = sale.vatRate || db.getSetting('vat_rate', '15');

        const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl';

        const html = `
            <!DOCTYPE html>
            <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${isRtl ? 'ar' : 'en'}">
            <head>
                <meta charset="UTF-8">
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', 'Cairo', monospace;
                        width: 76mm;
                        margin: 2mm auto;
                        color: black;
                        background: white;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 8px;
                        border-bottom: 2px dashed #000;
                        padding-bottom: 8px;
                    }
                    .header img {
                        max-width: 60px;
                        max-height: 60px;
                        margin-bottom: 4px;
                    }
                    .header h2 { font-size: 16px; font-weight: bold; margin: 4px 0 2px; }
                    .header .sub { font-size: 10px; color: #444; }
                    .info {
                        margin-bottom: 8px;
                        font-size: 11px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 6px;
                    }
                    .info .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                    th {
                        border-bottom: 1px solid #000;
                        padding: 3px 2px;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    td { padding: 3px 2px; font-size: 11px; }
                    .totals {
                        border-top: 2px dashed #000;
                        padding-top: 6px;
                        margin-top: 6px;
                    }
                    .totals .row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px; }
                    .totals .total-row { font-weight: bold; font-size: 14px; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px; }
                    .footer {
                        text-align: center;
                        margin-top: 12px;
                        font-size: 10px;
                        border-top: 2px dashed #000;
                        padding-top: 8px;
                    }
                    .footer p { margin-bottom: 2px; }
                    @media print {
                        body { margin: 0; padding: 2mm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    ${logo ? `<img src="${logo}" alt="logo">` : ''}
                    <h2>${Utils.escapeHTML(shopName)}</h2>
                    ${shopNameEn ? `<div class="sub">${Utils.escapeHTML(shopNameEn)}</div>` : ''}
                    ${shopAddress ? `<div class="sub">${Utils.escapeHTML(shopAddress)}</div>` : ''}
                    ${shopPhone ? `<div class="sub">📞 ${shopPhone}</div>` : ''}
                    ${vatNumber ? `<div class="sub">${t('vat_number')}: ${vatNumber}</div>` : ''}
                </div>

                <div class="info">
                    <div class="row"><span>${t('invoice_number')}</span><span>${invoiceNumber}</span></div>
                    <div class="row"><span>${t('date')}</span><span>${Utils.formatDateTime(saleDate)}</span></div>
                    <div class="row"><span>${t('cashier')}</span><span>${Utils.escapeHTML(cashierName)}</span></div>
                    ${customerName ? `<div class="row"><span>${t('customer')}</span><span>${Utils.escapeHTML(customerName)}</span></div>` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="text-align:start; width:40%;">${t('product')}</th>
                            <th style="text-align:center; width:15%;">${t('qty')}</th>
                            <th style="text-align:end; width:20%;">${t('price')}</th>
                            <th style="text-align:end; width:25%;">${t('total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="row">
                        <span>${t('subtotal')}</span>
                        <span>${Number(subtotal).toFixed(2)} ${currency}</span>
                    </div>
                    <div class="row">
                        <span>${t('vat')} (${vatRate}%)</span>
                        <span>${Number(vatAmount).toFixed(2)} ${currency}</span>
                    </div>
                    ${sale.discount ? `
                    <div class="row">
                        <span>${t('discount')}</span>
                        <span>- ${Number(sale.discount).toFixed(2)} ${currency}</span>
                    </div>` : ''}
                    <div class="row total-row">
                        <span>${t('grand_total')}</span>
                        <span>${Number(total).toFixed(2)} ${currency}</span>
                    </div>
                    <div class="row">
                        <span>${t('paid')} (${paymentMethod})</span>
                        <span>${Number(paid).toFixed(2)} ${currency}</span>
                    </div>
                    ${change > 0 ? `
                    <div class="row">
                        <span>${t('change')}</span>
                        <span>${Number(change).toFixed(2)} ${currency}</span>
                    </div>` : ''}
                </div>

                <div class="footer">
                    <p>${t('thank_you') || 'شكراً لزيارتكم'}</p>
                    <p>Powered by ARES Casher Pro</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=400,height=700');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        } else {
            Toast.show(t('warning'), t('popup_blocked') || 'يرجى السماح بالنوافذ المنبثقة', 'warning');
        }
    }
};
