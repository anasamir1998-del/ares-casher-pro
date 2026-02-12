/* ============================================================
   ARES Casher Pro — Shift Management Module
   ============================================================ */

const Shifts = {
    render() {
        const content = document.getElementById('content-body');
        const shifts = db.getCollection('shifts').reverse();
        const activeShift = App.activeShiftId ? db.getById('shifts', App.activeShiftId) : null;

        content.innerHTML = `
            <div class="stagger-in">
                <!-- Active Shift Status -->
                <div class="glass-card p-24 mb-24" style="background: ${activeShift ? 'linear-gradient(135deg, rgba(0,214,143,0.1), rgba(0,214,143,0.03))' : 'linear-gradient(135deg, rgba(255,77,106,0.1), rgba(255,77,106,0.03))'}; border-color: ${activeShift ? 'rgba(0,214,143,0.2)' : 'rgba(255,77,106,0.2)'};">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 style="font-size: 20px; margin-bottom: 8px;">
                                ${activeShift ? `🟢 ${t('shift_open')}` : `🔴 ${t('no_open_shift')}`}
                            </h2>
                            ${activeShift ? `
                                <p style="color: var(--text-secondary);">
                                    ${t('shift_started')}: ${Utils.formatDateTime(activeShift.startTime)} |
                                    ${t('opening_cash')}: ${Utils.formatSAR(activeShift.openingCash || 0)}
                                </p>
                            ` : `<p style="color: var(--text-secondary);">${t('open_shift_hint')}</p>`}
                        </div>
                        <div>
                            ${activeShift
                ? `<button class="btn btn-danger btn-lg" onclick="Shifts.closeShift()">🔒 ${t('close_shift')}</button>`
                : `<button class="btn btn-success btn-lg" onclick="Shifts.openShift()">🔓 ${t('open_new_shift')}</button>`
            }
                        </div>
                    </div>
                </div>

                ${activeShift ? this.renderActiveShiftStats() : ''}

                <!-- Shift History -->
                <div class="glass-card" style="overflow: hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                        <h3 style="font-size: 16px;">📋 ${t('shift_history')}</h3>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>${t('employee')}</th>
                                <th>${t('shift_start')}</th>
                                <th>${t('shift_end')}</th>
                                <th>${t('opening_cash')}</th>
                                <th>${t('total_sales')}</th>
                                <th>${t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shifts.map(s => {
                const shiftSales = db.query('sales', sale => sale.shiftId === s.id);
                const totalSales = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
                return `
                                <tr>
                                    <td><strong>${s.userName || '—'}</strong></td>
                                    <td style="font-size:13px;">${Utils.formatDateTime(s.startTime)}</td>
                                    <td style="font-size:13px;">${s.endTime ? Utils.formatDateTime(s.endTime) : '—'}</td>
                                    <td style="font-family:Inter;">${Utils.formatSAR(s.openingCash || 0)}</td>
                                    <td style="font-family:Inter; font-weight:600;">${Utils.formatSAR(totalSales)}</td>
                                    <td>
                                        <span class="badge ${s.status === 'open' ? 'badge-success' : 'badge-info'}">${s.status === 'open' ? t('status_open') : t('status_closed')}</span>
                                    </td>
                                </tr>`;
            }).join('')}
                        </tbody>
                    </table>
                    ${shifts.length === 0 ? `<div class="empty-state p-24"><p>${t('no_shift_history')}</p></div>` : ''}
                </div>
            </div>
        `;
    },

    renderActiveShiftStats() {
        const shiftSales = db.query('sales', s => s.shiftId === App.activeShiftId);
        const totalSales = shiftSales.reduce((sum, s) => sum + s.total, 0);
        const totalVAT = shiftSales.reduce((sum, s) => sum + s.vatAmount, 0);
        const cashTotal = shiftSales.filter(s => s.paymentMethod === 'نقدي').reduce((sum, s) => sum + s.total, 0);

        return `
            <div class="stat-cards mb-24">
                <div class="glass-card stat-card accent">
                    <div class="stat-card-icon">💰</div>
                    <h3>${Utils.formatCurrency(totalSales)}</h3>
                    <p>${t('shift_sales')} (${t('sar')})</p>
                </div>
                <div class="glass-card stat-card success">
                    <div class="stat-card-icon">🧾</div>
                    <h3>${shiftSales.length}</h3>
                    <p>${t('operations_count')}</p>
                </div>
                <div class="glass-card stat-card warning">
                    <div class="stat-card-icon">💵</div>
                    <h3>${Utils.formatCurrency(cashTotal)}</h3>
                    <p>${t('cash_sales')} (${t('sar')})</p>
                </div>
                <div class="glass-card stat-card info">
                    <div class="stat-card-icon">🏦</div>
                    <h3>${Utils.formatCurrency(totalVAT)}</h3>
                    <p>${t('vat_collected')} (${t('sar')})</p>
                </div>
            </div>
        `;
    },

    openShift() {
        Modal.show(`🔓 ${t('open_new_shift')}`, `
            <div class="form-group">
                <label>${t('opening_cash')} (${t('sar')})</label>
                <input type="number" class="form-control" id="opening-cash" value="0" min="0" step="0.01">
            </div>
            <div class="glass-card p-20" style="background: var(--info-bg); border-color: rgba(0,180,216,0.2);">
                <p style="font-size: 13px; color: var(--info);">
                    ℹ️ ${t('shift_register_msg')}: <strong>${Auth.currentUser.name}</strong>
                </p>
            </div>
        `, `
            <button class="btn btn-success" onclick="Shifts.confirmOpen()">✅ ${t('open_shift')}</button>
            <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
        `);
    },

    confirmOpen() {
        const openingCash = parseFloat(document.getElementById('opening-cash').value) || 0;
        const shift = db.insert('shifts', {
            userId: Auth.currentUser.id,
            userName: Auth.currentUser.name,
            startTime: Utils.isoDate(),
            openingCash,
            status: 'open'
        });
        App.activeShiftId = shift.id;
        Modal.hide();
        Toast.show(t('success'), t('shift_opened'), 'success');
        this.render();
    },

    closeShift() {
        const shiftSales = db.query('sales', s => s.shiftId === App.activeShiftId);
        const totalSales = shiftSales.reduce((sum, s) => sum + s.total, 0);
        const cashSales = shiftSales.filter(s => s.paymentMethod === 'نقدي').reduce((sum, s) => sum + s.total, 0);
        const activeShift = db.getById('shifts', App.activeShiftId);
        const expectedCash = (activeShift?.openingCash || 0) + cashSales;

        Modal.show(`🔒 ${t('close_shift')}`, `
            <div class="glass-card p-20 mb-20" style="text-align:center;">
                <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${t('shift_total_sales')}</div>
                <div style="font-size:32px; font-weight:800; font-family:Inter;" class="text-gradient">${Utils.formatSAR(totalSales)}</div>
            </div>
            
            <div class="form-group">
                <label>${t('cash_in_drawer')} (${t('sar')})</label>
                <input type="number" class="form-control" id="closing-cash" value="${expectedCash.toFixed(2)}" step="0.01">
                <small style="color:var(--text-muted); font-size:12px;">${t('expected_amount')}: ${Utils.formatSAR(expectedCash)}</small>
            </div>

            <div class="glass-card p-20" style="background: var(--bg-glass);">
                <div class="flex justify-between" style="margin-bottom:8px;"><span>${t('operations_count')}</span><span style="font-weight:600;">${shiftSales.length}</span></div>
                <div class="flex justify-between" style="margin-bottom:8px;"><span>${t('cash_sales')}</span><span style="font-weight:600;">${Utils.formatSAR(cashSales)}</span></div>
                <div class="flex justify-between"><span>${t('opening_cash')}</span><span style="font-weight:600;">${Utils.formatSAR(activeShift?.openingCash || 0)}</span></div>
            </div>
        `, `
            <button class="btn btn-danger" onclick="Shifts.confirmClose()">🔒 ${t('confirm_close')}</button>
            <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
        `);
    },

    confirmClose() {
        const closingCash = parseFloat(document.getElementById('closing-cash').value) || 0;
        db.update('shifts', App.activeShiftId, {
            endTime: Utils.isoDate(),
            closingCash,
            status: 'closed'
        });
        App.activeShiftId = null;
        Modal.hide();
        Toast.show(t('success'), t('shift_closed_msg'), 'success');
        this.render();
    }
};
