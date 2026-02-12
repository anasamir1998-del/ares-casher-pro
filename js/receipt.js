class ReceiptService {
    constructor() {
        this.shopName = localStorage.getItem('ares_shop_name') || 'ARES CASHER';
        this.shopPhone = localStorage.getItem('ares_shop_phone') || '+966 568 400 202';
        this.currency = I18n.currency;
    }

    generateHtml(invoice) {
        const date = new Date(invoice.date).toLocaleString(I18n.currentLang);
        const itemsHtml = invoice.items.map(item => `
            <tr>
                <td style="text-align:start;">${item.name}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:end;">${item.price}</td>
                <td style="text-align:end;">${(item.price * item.qty).toFixed(2)}</td>
            </tr>
        `).join('');

        const isRtl = document.dir === 'rtl';

        return `
            <!DOCTYPE html>
            <html dir="${isRtl ? 'rtl' : 'ltr'}">
            <head>
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    body {
                        font-family: 'Courier New', monospace;
                        width: 76mm;
                        margin: 2mm auto;
                        color: black;
                        background: white;
                        font-size: 12px;
                    }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 10px; }
                    .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
                    .info { margin-bottom: 10px; font-size: 11px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th { border-bottom: 1px solid black; padding: 2px 0; font-size: 11px; }
                    td { padding: 4px 0; font-size: 11px; }
                    .totals { border-top: 1px dashed black; padding-top: 5px; margin-top: 5px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .total-row { font-weight: bold; font-size: 14px; margin-top: 5px; }
                    .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed black; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.shopName}</h2>
                    <div>${this.shopPhone}</div>
                </div>
                <div class="info">
                    <div class="row"><span>${I18n.t('invoice')} #</span><span>${invoice.id}</span></div>
                    <div class="row"><span>${I18n.t('date')}</span><span>${date}</span></div>
                    <div class="row"><span>${I18n.t('cashier')}</span><span>${invoice.cashier}</span></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:start; width:40%;">${I18n.t('item_name') || 'Item'}</th>
                            <th style="text-align:center; width:15%;">${I18n.t('qty') || 'Qty'}</th>
                            <th style="text-align:end; width:20%;">${I18n.t('price') || 'Price'}</th>
                            <th style="text-align:end; width:25%;">${I18n.t('total') || 'Total'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="totals">
                    <div class="row">
                        <span>${I18n.t('subtotal')}</span>
                        <span>${invoice.subtotal.toFixed(2)} ${this.currency}</span>
                    </div>
                    <div class="row">
                        <span>${I18n.t('tax')} (${invoice.taxRate}%)</span>
                        <span>${invoice.tax.toFixed(2)} ${this.currency}</span>
                    </div>
                    <div class="row total-row">
                        <span>${I18n.t('total')}</span>
                        <span>${invoice.total.toFixed(2)} ${this.currency}</span>
                    </div>
                    <div class="row" style="margin-top:5px; font-size:11px;">
                        <span>${I18n.t('paid')} (${invoice.method === 'cash' ? I18n.t('cash') : I18n.t('card')})</span>
                        <span>${invoice.paid.toFixed(2)} ${this.currency}</span>
                    </div>
                    <div class="row" style="font-size:11px;">
                        <span>${I18n.t('change')}</span>
                        <span>${invoice.change.toFixed(2)} ${this.currency}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for shopping with us!</p>
                    <p>Software By: Samir Mohamed</p>
                </div>
                <script>
                    window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
    }

    print(invoice) {
        const html = this.generateHtml(invoice);
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(html);
        printWindow.document.close();
    }
}

// Global instance
const Receipt = new ReceiptService();
