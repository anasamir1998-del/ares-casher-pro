/* ============================================================
   ARES Casher Pro — Dashboard Module
   ============================================================ */

const Dashboard = {
    render() {
        const content = document.getElementById('content-body');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isAdmin = Auth.isAdmin();
        const userId = Auth.currentUser.id;

        // Get today's sales — filtered by user if not admin
        const todaySales = db.query('sales', s => {
            if (new Date(s.createdAt) < today) return false;
            if (!isAdmin && s.cashierId !== userId) return false;
            return true;
        });

        const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
        const totalVAT = todaySales.reduce((sum, s) => sum + s.vatAmount, 0);
        const invoiceCount = todaySales.length;

        // Admin-only data
        const productsCount = db.count('products');
        const customersCount = db.count('customers');
        const lowStock = db.query('products', p => p.stock !== undefined && p.stock <= 10);

        // Role label
        const scopeLabel = isAdmin ? t('all_sales') : t('your_sales');

        content.innerHTML = `
            <div class="stagger-in">
                <!-- Welcome Banner -->
                <div class="glass-card p-24 mb-24" style="background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.1)); border-color: rgba(102,126,234,0.2);">
                    <h2 style="font-size: 24px; margin-bottom: 8px;">${t('welcome')}، ${Auth.currentUser.name} 👋</h2>
                    <p style="color: var(--text-secondary);">${t('dashboard')} — ${Utils.formatDate(new Date())} | <span class="badge ${isAdmin ? 'badge-accent' : 'badge-info'}" style="font-size:11px;">${t('role_' + (Auth.currentUser.role === 'مدير' ? 'admin' : Auth.currentUser.role === 'مشرف' ? 'supervisor' : 'cashier'))}</span> <span style="font-size:12px; color:var(--text-muted);">(${scopeLabel})</span></p>
                </div>

                <!-- Stat Cards -->
                <div class="stat-cards">
                    <div class="glass-card stat-card accent">
                        <div class="stat-card-icon">💰</div>
                        <h3>${Utils.formatCurrency(totalRevenue)}</h3>
                        <p>${t('today_revenue')} (${t('sar')})</p>
                    </div>
                    <div class="glass-card stat-card success">
                        <div class="stat-card-icon">🧾</div>
                        <h3>${invoiceCount}</h3>
                        <p>${t('today_invoices')}</p>
                    </div>
                    <div class="glass-card stat-card warning">
                        <div class="stat-card-icon">🏦</div>
                        <h3>${Utils.formatCurrency(totalVAT)}</h3>
                        <p>${t('vat_collected')} (${t('sar')})</p>
                    </div>
                    ${isAdmin ? `
                    <div class="glass-card stat-card info">
                        <div class="stat-card-icon">📦</div>
                        <h3>${productsCount}</h3>
                        <p>${t('total_products')}</p>
                    </div>` : `
                    <div class="glass-card stat-card info">
                        <div class="stat-card-icon">📊</div>
                        <h3>${Utils.formatCurrency(totalRevenue > 0 ? totalRevenue / Math.max(invoiceCount, 1) : 0)}</h3>
                        <p>${t('avg_invoice')}</p>
                    </div>`}
                </div>

                <!-- Charts Row -->
                <div class="grid-2 mb-24">
                    <div class="glass-card p-20">
                        <h3 style="margin-bottom: 16px; font-size: 16px;">📈 ${isAdmin ? t('sales_7days') : t('your_sales_7days')}</h3>
                        <div class="chart-container" style="height: 250px;">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-card p-20">
                        <h3 style="margin-bottom: 16px; font-size: 16px;">🔝 ${isAdmin ? t('top_products') : t('your_top_products')}</h3>
                        <div id="topProductsChart" style="padding: 10px;">
                            ${this.renderTopProducts()}
                        </div>
                    </div>
                </div>

                <!-- Bottom Row -->
                <div class="grid-2">
                    <!-- Recent Sales -->
                    <div class="glass-card p-20">
                        <h3 style="margin-bottom: 16px; font-size: 16px;">🕐 ${isAdmin ? t('recent_sales') : t('your_recent_sales')}</h3>
                        ${this.renderRecentSales()}
                    </div>

                    ${isAdmin ? `
                    <!-- Low Stock Alert (Admin only) -->
                    <div class="glass-card p-20">
                        <h3 style="margin-bottom: 16px; font-size: 16px;">⚠️ ${t('stock_alerts')}</h3>
                        ${lowStock.length > 0 ? lowStock.map(p => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; background: var(--bg-glass); border-radius: var(--radius-sm);">
                                <span>${p.emoji || p.icon || '📦'} ${p.name}</span>
                                <span class="badge ${p.stock <= 5 ? 'badge-danger' : 'badge-warning'}">${p.stock} ${t('pieces')}</span>
                            </div>
                        `).join('') : `<div class="empty-state" style="padding: 30px;"><p style="color: var(--text-muted);">✅ ${t('stock_ok')}</p></div>`}
                    </div>` : `
                    <!-- Shift Info (Non-admin) -->
                    <div class="glass-card p-20">
                        <h3 style="margin-bottom: 16px; font-size: 16px;">⏰ ${t('shift_info')}</h3>
                        ${this.renderShiftInfo()}
                    </div>`}
                </div>

                <!-- Quick Actions -->
                <div class="glass-card p-20 mt-24">
                    <h3 style="margin-bottom: 16px; font-size: 16px;">⚡ ${t('quick_actions')}</h3>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        ${Auth.hasPermission('make_sale') ? `<button class="btn btn-primary" onclick="App.navigate('pos')">🛒 ${t('start_sale')}</button>` : ''}
                        ${Auth.hasPermission('manage_products') ? `<button class="btn btn-success" onclick="App.navigate('products')">📦 ${t('manage_products')}</button>` : ''}
                        ${Auth.hasPermission('view_reports') ? `<button class="btn btn-ghost" onclick="App.navigate('reports')">📊 ${t('view_reports')}</button>` : ''}
                        ${Auth.hasPermission('view_invoices') ? `<button class="btn btn-ghost" onclick="App.navigate('invoices')">🧾 ${t('view_invoices')}</button>` : ''}
                        ${Auth.hasPermission('manage_shifts') ? `<button class="btn btn-ghost" onclick="App.navigate('shifts')">⏰ ${t('shifts')}</button>` : ''}
                        ${Auth.hasPermission('manage_settings') ? `<button class="btn btn-ghost" onclick="App.navigate('settings')">⚙️ ${t('settings')}</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Draw sales chart
        setTimeout(() => this.drawSalesChart(), 100);
    },

    renderRecentSales() {
        const isAdmin = Auth.isAdmin();
        const userId = Auth.currentUser.id;

        let sales = db.getCollection('sales');
        if (!isAdmin) {
            sales = sales.filter(s => s.cashierId === userId);
        }
        sales = sales.slice(-5).reverse();

        if (sales.length === 0) {
            return `<div class="empty-state" style="padding: 30px;"><p style="color: var(--text-muted);">${t('no_sales_yet')}</p></div>`;
        }
        return sales.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; background: var(--bg-glass); border-radius: var(--radius-sm);">
                <div>
                    <div style="font-weight: 600; font-size: 14px;">${s.invoiceNumber || '—'}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${Utils.formatDateTime(s.createdAt)}${isAdmin && s.cashierName ? ` — ${s.cashierName}` : ''}</div>
                </div>
                <div style="text-align: ${I18n.isRTL() ? 'left' : 'right'};">
                    <div style="font-weight: 700; color: var(--accent-start); font-family: Inter;">${Utils.formatSAR(s.total)}</div>
                    <span class="badge badge-accent" style="font-size: 11px;">${s.paymentMethod === 'نقدي' ? t('cash_sales') : s.paymentMethod === 'بطاقة' ? t('card_sales') : s.paymentMethod === 'تحويل' ? t('transfer_sales') : (s.paymentMethod || t('cash_sales'))}</span>
                </div>
            </div>
        `).join('');
    },

    renderTopProducts() {
        const isAdmin = Auth.isAdmin();
        const userId = Auth.currentUser.id;

        let sales = db.getCollection('sales');
        if (!isAdmin) {
            sales = sales.filter(s => s.cashierId === userId);
        }

        const productSales = {};
        sales.forEach(s => {
            (s.items || []).forEach(item => {
                if (!productSales[item.name]) productSales[item.name] = 0;
                productSales[item.name] += item.qty;
            });
        });
        const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sorted.length === 0) {
            return `<div class="empty-state" style="padding: 30px;"><p style="color: var(--text-muted);">${t('not_enough_data')}</p></div>`;
        }
        const maxQty = sorted[0][1];
        return sorted.map(([name, qty], i) => {
            const colors = ['#667eea', '#00d68f', '#ffaa00', '#00b4d8', '#ff6b81'];
            const width = (qty / maxQty * 100);
            return `
                <div style="margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 13px; font-weight: 600;">${name}</span>
                        <span style="font-size: 13px; color: var(--text-muted); font-family: Inter;">${qty} ${t('sales_count')}</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-glass); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${width}%; background: ${colors[i]}; border-radius: 4px; transition: width 1s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderShiftInfo() {
        const userId = Auth.currentUser.id;
        const openShift = db.query('shifts', s => s.userId === userId && s.status === 'open');

        if (openShift.length > 0) {
            const shift = openShift[0];
            const startTime = Utils.formatDateTime(shift.createdAt);
            const shiftSales = db.query('sales', s => s.shiftId === shift.id);
            const shiftTotal = shiftSales.reduce((sum, s) => sum + s.total, 0);
            return `
                <div style="padding: 12px; background: rgba(0,214,143,0.08); border-radius: var(--radius-sm); border-${I18n.isRTL() ? 'right' : 'left'}: 3px solid var(--success); margin-bottom: 12px;">
                    <div style="font-weight:700; color:var(--success); margin-bottom:6px;">🟢 ${t('shift_open')}</div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-bottom:4px;">${t('shift_started')}: ${startTime}</div>
                    <div style="font-size:13px; color:var(--text-secondary);">${t('shift_invoices')}: <strong>${shiftSales.length}</strong> | ${t('total')}: <strong>${Utils.formatSAR(shiftTotal)}</strong></div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="App.navigate('shifts')">⏰ ${t('manage_shift')}</button>
            `;
        }
        return `
            <div class="empty-state" style="padding: 30px;">
                <p style="color: var(--text-muted); margin-bottom:12px;">${t('no_open_shift')}</p>
                <button class="btn btn-primary btn-sm" onclick="App.navigate('shifts')">⏰ ${t('open_new_shift')}</button>
            </div>
        `;
    },

    drawSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const isAdmin = Auth.isAdmin();
        const userId = Auth.currentUser.id;

        // Get last 7 days data — filtered by user
        const data = [];
        const labels = [];
        const locale = I18n.currentLang === 'ur' ? 'ur-PK' : I18n.currentLang === 'en' ? 'en-US' : 'ar-SA';
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const daySales = db.query('sales', s => {
                const d = new Date(s.createdAt);
                if (d < date || d >= nextDate) return false;
                if (!isAdmin && s.cashierId !== userId) return false;
                return true;
            });
            const total = daySales.reduce((sum, s) => sum + s.total, 0);
            data.push(total);
            labels.push(date.toLocaleDateString(locale, { weekday: 'short' }));
        }

        const maxVal = Math.max(...data, 100);
        const padding = { top: 20, right: 30, bottom: 40, left: 60 };
        const chartW = canvas.width - padding.left - padding.right;
        const chartH = canvas.height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect theme for grid color
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const gridColor = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
        const labelColor = theme === 'light' ? '#888' : '#5c6189';

        // Grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(canvas.width - padding.right, y);
            ctx.stroke();

            // Y-axis labels
            ctx.fillStyle = labelColor;
            ctx.font = '11px Inter';
            ctx.textAlign = 'right';
            const val = maxVal - (maxVal / 4) * i;
            ctx.fillText(Math.round(val), padding.left - 10, y + 4);
        }

        // Draw area + line
        if (data.some(d => d > 0)) {
            const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)');

            const points = data.map((val, i) => ({
                x: padding.left + (chartW / (data.length - 1)) * i,
                y: padding.top + chartH - (val / maxVal) * chartH
            }));

            // Area
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line
            ctx.beginPath();
            points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Points
            const bgColor = theme === 'light' ? '#ffffff' : '#0a0e27';
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#667eea';
                ctx.fill();
                ctx.strokeStyle = bgColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // X-axis labels
        ctx.fillStyle = labelColor;
        ctx.font = '12px Cairo';
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
            const x = padding.left + (chartW / (labels.length - 1)) * i;
            ctx.fillText(label, x, canvas.height - 10);
        });
    }
};
