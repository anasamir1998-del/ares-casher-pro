/* ============================================================
   ARES Casher Pro — Settings Module (Enhanced)
   ============================================================ */

const Settings = {
    render() {
        const content = document.getElementById('content-body');
        content.innerHTML = `
            <div class="stagger-in">
                <div class="tabs mb-24" style="flex-wrap:wrap;">
                    <button class="tab-btn active" onclick="Settings.switchTab(this, 'company')">🏢 ${t('company')}</button>
                    <button class="tab-btn" onclick="Settings.switchTab(this, 'tax')">🏦 ${t('tax_settings')}</button>
                    <button class="tab-btn" onclick="Settings.switchTab(this, 'users')">👥 ${t('users')}</button>
                    <button class="tab-btn" onclick="Settings.switchTab(this, 'appearance')">🎨 ${t('appearance')}</button>
                    <button class="tab-btn" onclick="Settings.switchTab(this, 'shortcuts')">⌨️ ${t('keyboard_shortcuts')}</button>
                    <button class="tab-btn" onclick="Settings.switchTab(this, 'backup')">💾 ${t('backup')}</button>
                </div>
                <div id="settings-content">
                    ${this.renderCompanySettings()}
                </div>
            </div>
        `;
    },

    applyShopName() {
        const name = db.getSetting('company_name', 'ARES');
        const nameEn = db.getSetting('company_name_en', 'Casher Pro');

        // Update document title
        document.title = `${name} — ${nameEn}`;

        // Update UI elements
        const loginBrand = document.getElementById('brand-name-login');
        const sidebarBrand = document.getElementById('brand-name-sidebar');
        const sidebarSubtitle = document.getElementById('brand-subtitle-sidebar');
        const topbarBrand = document.getElementById('brand-name-topbar');

        if (loginBrand) loginBrand.textContent = name + ' ' + nameEn;
        if (sidebarBrand) sidebarBrand.textContent = name;
        if (sidebarSubtitle) sidebarSubtitle.textContent = nameEn;
        if (topbarBrand) topbarBrand.textContent = name;
    },

    switchTab(btn, tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = document.getElementById('settings-content');
        switch (tab) {
            case 'company': container.innerHTML = this.renderCompanySettings(); break;
            case 'tax': container.innerHTML = this.renderTaxSettings(); break;
            case 'users': container.innerHTML = this.renderUserManagement(); break;
            case 'appearance': container.innerHTML = this.renderAppearanceSettings(); break;
            case 'shortcuts': container.innerHTML = this.renderShortcuts(); break;
            case 'backup': container.innerHTML = this.renderBackupSettings(); break;
        }
    },

    renderCompanySettings() {
        const logo = db.getSetting('company_logo', '');
        return `
            <div class="glass-card p-24" style="max-width: 700px;">
                <h3 style="margin-bottom: 20px;">🏢 ${t('company_info')}</h3>
                
                <!-- Logo Upload -->
                <div class="form-group" style="text-align:center; margin-bottom:24px;">
                    <label style="display:block; margin-bottom:8px;">${t('company_logo')}</label>
                    <div class="image-upload-area" style="width:100px; height:100px; margin:0 auto;" onclick="document.getElementById('logo-input').click()">
                        ${logo ? `<img src="${logo}" style="width:100%;height:100%;object-fit:contain;">` : `<span class="upload-icon">🏢</span><span class="upload-text">${t('upload_logo')}</span>`}
                    </div>
                    <input type="file" id="logo-input" accept="image/*" onchange="Settings.handleLogoUpload(event)" style="display:none;">
                    ${logo ? `<button class="btn btn-ghost btn-sm" style="margin-top:8px;" onclick="Settings.removeLogo()">🗑️ ${t('remove_logo')}</button>` : ''}
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>${t('company_name_ar')}</label>
                        <input type="text" class="form-control" id="s-company-name" value="${db.getSetting('company_name', '')}">
                    </div>
                    <div class="form-group">
                        <label>${t('company_name_en')}</label>
                        <input type="text" class="form-control" id="s-company-name-en" value="${db.getSetting('company_name_en', '')}" style="direction:ltr;">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>${t('vat_number')} (VAT Number)</label>
                        <input type="text" class="form-control" id="s-vat-number" value="${db.getSetting('vat_number', '')}" style="direction:ltr;" placeholder="3xxxxxxxxxxxxxxx">
                    </div>
                    <div class="form-group">
                        <label>${t('cr_number')} (CR Number)</label>
                        <input type="text" class="form-control" id="s-cr-number" value="${db.getSetting('cr_number', '')}" style="direction:ltr;">
                    </div>
                </div>
                <div class="form-group">
                    <label>${t('address')}</label>
                    <textarea class="form-control" id="s-address" rows="2">${db.getSetting('company_address', '')}</textarea>
                </div>
                <div class="form-group">
                    <label>${t('phone')}</label>
                    <input type="text" class="form-control" id="s-phone" value="${db.getSetting('company_phone', '')}" style="direction:ltr;">
                </div>
                <button class="btn btn-primary" onclick="Settings.saveCompany()">💾 ${t('save_data')}</button>
                
                <!-- Preview -->
                <div style="margin-top:24px; border-top:1px solid var(--border-color); padding-top:16px;">
                    <h4 style="margin-bottom:12px; font-size:14px; color:var(--text-muted);">👁️ ${t('report_header_preview')}:</h4>
                    ${App.getCompanyBrandHTML()}
                </div>
            </div>
        `;
    },

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 256000) {
            Toast.show(t('warning'), t('logo_too_large'), 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            db.setSetting('company_logo', e.target.result);
            Toast.show(t('success'), t('logo_uploaded'), 'success');
            // Re-render
            document.getElementById('settings-content').innerHTML = this.renderCompanySettings();
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        db.setSetting('company_logo', '');
        Toast.show(t('success'), t('logo_removed'), 'info');
        document.getElementById('settings-content').innerHTML = this.renderCompanySettings();
    },

    saveCompany() {
        db.setSetting('company_name', document.getElementById('s-company-name').value.trim());
        db.setSetting('company_name_en', document.getElementById('s-company-name-en').value.trim());
        db.setSetting('vat_number', document.getElementById('s-vat-number').value.trim());
        db.setSetting('cr_number', document.getElementById('s-cr-number').value.trim());
        db.setSetting('company_address', document.getElementById('s-address').value.trim());
        db.setSetting('company_phone', document.getElementById('s-phone').value.trim());
        Toast.show(t('success'), t('company_saved'), 'success');
        // Refresh preview
        document.getElementById('settings-content').innerHTML = this.renderCompanySettings();
        // Apply changes immediately
        this.applyShopName();
    },

    renderTaxSettings() {
        return `
            <div class="glass-card p-24" style="max-width: 700px;">
                <h3 style="margin-bottom: 20px;">🏦 ${t('vat_settings')}</h3>
                <div class="glass-card p-20 mb-20" style="background: var(--warning-bg); border-color: rgba(255,170,0,0.2);">
                    <p style="font-size:13px; color: var(--warning);">
                        ⚠️ ${t('vat_notice')}
                    </p>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>${t('vat_rate')} (%)</label>
                        <input type="number" class="form-control" id="s-vat-rate" value="${db.getSetting('vat_rate', '15')}" min="0" max="100" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>${t('currency_symbol')}</label>
                        <input type="text" class="form-control" id="s-currency" value="${db.getSetting('currency', 'ر.س')}">
                    </div>
                </div>
                <button class="btn btn-primary" onclick="Settings.saveTax()">💾 ${t('save_tax_settings')}</button>
            </div>
        `;
    },

    saveTax() {
        db.setSetting('vat_rate', document.getElementById('s-vat-rate').value);
        db.setSetting('currency', document.getElementById('s-currency').value.trim());
        Toast.show(t('success'), t('tax_settings_saved'), 'success');
    },

    renderUserManagement() {
        const users = db.getCollection('users');
        return `
            <div class="flex items-center justify-between mb-20">
                <h3>👥 ${t('user_management')}</h3>
                <button class="btn btn-primary" onclick="Settings.showAddUser()">➕ ${t('add_user')}</button>
            </div>
            <div class="glass-card" style="overflow:hidden;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t('full_name')}</th>
                            <th>${t('username')}</th>
                            <th>${t('role')}</th>
                            <th>${t('status')}</th>
                            <th>${t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                        <tr>
                            <td><strong>${Utils.escapeHTML(u.name)}</strong></td>
                            <td style="font-family:Inter;">${u.username}</td>
                            <td><span class="badge ${u.role === 'مدير' ? 'badge-accent' : u.role === 'مشرف' ? 'badge-warning' : 'badge-info'}">${t('role_' + (u.role === 'مدير' ? 'admin' : u.role === 'مشرف' ? 'supervisor' : 'cashier'))}</span></td>
                            <td><span class="badge ${u.active !== false ? 'badge-success' : 'badge-danger'}">${u.active !== false ? t('active') : t('disabled')}</span></td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="Settings.editUser('${u.id}')" title="${t('edit')}">✏️</button>
                                <button class="btn btn-ghost btn-sm" onclick="Settings.editPermissions('${u.id}')" title="${t('permissions')}">🔑</button>
                                ${u.username !== 'admin' ? `<button class="btn btn-ghost btn-sm" onclick="Settings.toggleUser('${u.id}')">${u.active !== false ? '🔒' : '🔓'}</button>` : ''}
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showAddUser(user = null) {
        const isEdit = !!user;
        Modal.show(isEdit ? `✏️ ${t('edit_user')}` : `➕ ${t('add_user')}`, `
            <div class="form-group">
                <label>${t('full_name')}</label>
                <input type="text" class="form-control" id="u-name" value="${user ? Utils.escapeHTML(user.name) : ''}">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>${t('username')}</label>
                    <input type="text" class="form-control" id="u-username" value="${user?.username || ''}" ${isEdit ? 'readonly' : ''} style="direction:ltr;">
                </div>
                <div class="form-group">
                    <label>${isEdit ? t('new_password') : t('password')}</label>
                    <input type="password" class="form-control" id="u-password" style="direction:ltr;">
                </div>
            </div>
            <div class="form-group">
                <label>${t('role')}</label>
                <select class="form-control" id="u-role">
                    <option value="كاشير" ${user?.role === 'كاشير' ? 'selected' : ''}>${t('role_cashier')}</option>
                    <option value="مشرف" ${user?.role === 'مشرف' ? 'selected' : ''}>${t('role_supervisor')}</option>
                    <option value="مدير" ${user?.role === 'مدير' ? 'selected' : ''}>${t('role_admin')}</option>
                </select>
            </div>
            <div class="glass-card p-20" style="background:var(--info-bg); border-color:rgba(0,180,216,0.2);">
                <p style="font-size:12px; color:var(--info);">💡 ${t('permissions_hint')}</p>
            </div>
        `, `
            <button class="btn btn-primary" onclick="Settings.saveUser(${isEdit ? `'${user.id}'` : 'null'})">${isEdit ? t('save_changes') : t('add')}</button>
            <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
        `);
    },

    saveUser(id) {
        const name = document.getElementById('u-name').value.trim();
        const username = document.getElementById('u-username').value.trim();
        const password = document.getElementById('u-password').value;
        const role = document.getElementById('u-role').value;

        if (!name || !username) {
            Toast.show(t('error'), t('enter_name_username'), 'error');
            return;
        }

        if (id) {
            const updates = { name, role };
            if (password) updates.password = password;
            // Reset permissions when role changes
            const oldUser = db.getById('users', id);
            if (oldUser && oldUser.role !== role) {
                updates.permissions = null; // Will fall back to new role defaults
            }
            db.update('users', id, updates);
            Toast.show(t('success'), t('user_edited'), 'success');
        } else {
            if (!password) {
                Toast.show(t('error'), t('enter_password'), 'error');
                return;
            }
            const existing = db.query('users', u => u.username === username);
            if (existing.length > 0) {
                Toast.show(t('error'), t('username_exists'), 'error');
                return;
            }
            db.insert('users', { name, username, password, role, active: true });
            Toast.show(t('success'), t('user_added'), 'success');
        }
        Modal.hide();
        this.goToUsersTab();
    },

    editUser(id) {
        const user = db.getById('users', id);
        if (user) this.showAddUser(user);
    },

    toggleUser(id) {
        const user = db.getById('users', id);
        if (user) {
            db.update('users', id, { active: user.active === false ? true : false });
            this.goToUsersTab();
        }
    },

    /* ── Permissions Editor ── */
    editPermissions(userId) {
        const user = db.getById('users', userId);
        if (!user) return;

        const effectivePerms = Auth.getEffectivePermissions(user);
        const groups = {};
        Auth.allPermissions.forEach(p => {
            if (!groups[p.group]) groups[p.group] = [];
            groups[p.group].push(p);
        });

        let html = `
            <div class="mb-16">
                <strong>${Utils.escapeHTML(user.name)}</strong> — 
                <span class="badge ${user.role === 'مدير' ? 'badge-accent' : user.role === 'مشرف' ? 'badge-warning' : 'badge-info'}">${t('role_' + (user.role === 'مدير' ? 'admin' : user.role === 'مشرف' ? 'supervisor' : 'cashier'))}</span>
            </div>
        `;

        for (const [group, perms] of Object.entries(groups)) {
            html += `<h4 style="margin:16px 0 8px; font-size:14px; color:var(--text-muted);">${group}</h4>`;
            html += `<div class="permission-grid">`;
            perms.forEach(p => {
                const checked = effectivePerms.includes(p.key) ? 'checked' : '';
                html += `
                    <div class="permission-item">
                        <input type="checkbox" id="perm-${p.key}" data-perm="${p.key}" ${checked}>
                        <label for="perm-${p.key}">${p.label}</label>
                    </div>
                `;
            });
            html += `</div>`;
        }

        Modal.show(`🔑 ${t('permissions')}: ${user.name}`, html, `
            <button class="btn btn-primary" onclick="Settings.savePermissions('${userId}')">💾 ${t('save_permissions')}</button>
            <button class="btn btn-ghost" onclick="Settings.resetPermissions('${userId}')">🔄 ${t('reset_default')}</button>
            <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
        `, { wide: true });
    },

    savePermissions(userId) {
        const checkboxes = document.querySelectorAll('[data-perm]');
        const permissions = [];
        checkboxes.forEach(cb => {
            if (cb.checked) permissions.push(cb.dataset.perm);
        });
        db.update('users', userId, { permissions });

        // Update session if editing self
        if (Auth.currentUser && Auth.currentUser.id === userId) {
            Auth.currentUser.permissions = permissions;
            sessionStorage.setItem('ares_session', JSON.stringify(Auth.currentUser));
            App.setupSidebar();
        }

        Modal.hide();
        Toast.show(t('success'), t('permissions_saved'), 'success');
        this.goToUsersTab();
    },

    resetPermissions(userId) {
        const user = db.getById('users', userId);
        if (!user) return;
        db.update('users', userId, { permissions: null });

        if (Auth.currentUser && Auth.currentUser.id === userId) {
            Auth.currentUser.permissions = null;
            sessionStorage.setItem('ares_session', JSON.stringify(Auth.currentUser));
            App.setupSidebar();
        }

        Modal.hide();
        Toast.show(t('success'), t('permissions_reset'), 'info');
        this.goToUsersTab();
    },

    /* ── Appearance Settings ── */
    renderAppearanceSettings() {
        const currentTheme = localStorage.getItem('ares_theme') || 'dark';
        return `
            <div class="glass-card p-24" style="max-width:700px;">
                <h3 style="margin-bottom:20px;">🎨 ${t('appearance_settings')}</h3>
                
                <div class="grid-2 mb-20">
                    <div class="glass-card p-20" style="cursor:pointer; text-align:center; border-width:2px; ${currentTheme === 'dark' ? 'border-color:var(--accent-start);' : ''}" onclick="Settings.setTheme('dark')">
                        <div style="font-size:48px; margin-bottom:8px;">🌙</div>
                        <h4>${t('dark_mode')}</h4>
                        <p style="font-size:12px; color:var(--text-muted);">${t('dark_mode_desc')}</p>
                        ${currentTheme === 'dark' ? `<span class="badge badge-accent" style="margin-top:8px;">${t('active')}</span>` : ''}
                    </div>
                    <div class="glass-card p-20" style="cursor:pointer; text-align:center; border-width:2px; ${currentTheme === 'light' ? 'border-color:var(--accent-start);' : ''}" onclick="Settings.setTheme('light')">
                        <div style="font-size:48px; margin-bottom:8px;">☀️</div>
                        <h4>${t('light_mode')}</h4>
                        <p style="font-size:12px; color:var(--text-muted);">${t('light_mode_desc')}</p>
                        ${currentTheme === 'light' ? `<span class="badge badge-accent" style="margin-top:8px;">${t('active')}</span>` : ''}
                    </div>
                </div>

                <div class="glass-card p-20" style="background:var(--info-bg); border-color:rgba(0,180,216,0.2);">
                    <p style="font-size:12px; color:var(--info);">💡 ${t('theme_toggle_hint')}</p>
                </div>
            </div>
        `;
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ares_theme', theme);
        App.updateThemeIcon(theme);
        Toast.show(t('appearance'), theme === 'light' ? `☀️ ${t('light_mode_activated')}` : `🌙 ${t('dark_mode_activated')}`, 'info', 2000);
        document.getElementById('settings-content').innerHTML = this.renderAppearanceSettings();
    },

    /* ── Keyboard Shortcuts ── */
    renderShortcuts() {
        const shortcuts = [
            { key: 'F1', action: `🛒 ${t('pos')}` },
            { key: 'F2', action: `📊 ${t('dashboard')}` },
            { key: 'F3', action: `📦 ${t('product_management')}` },
            { key: 'F4', action: `🧾 ${t('invoices')}` },
            { key: 'F5', action: `📈 ${t('reports')}` },
            { key: 'F7', action: `⏰ ${t('shifts')}` },
            { key: 'Esc', action: `❌ ${t('close')}` },
        ];

        return `
            <div class="glass-card p-24" style="max-width:700px;">
                <h3 style="margin-bottom:20px;">⌨️ ${t('keyboard_shortcuts')}</h3>
                <div class="shortcuts-grid">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <span>${s.action}</span>
                            <span class="shortcut-key">${s.key}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /* ── Backup ── */
    renderBackupSettings() {
        return `
            <div class="glass-card p-24" style="max-width:700px;">
                <h3 style="margin-bottom:20px;">💾 ${t('backup_restore')}</h3>

                <div class="glass-card p-20 mb-20" style="background: var(--success-bg); border-color: rgba(0,214,143,0.2);">
                    <h4 style="margin-bottom:8px;">📤 ${t('export_data')}</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">${t('export_desc')}</p>
                    <button class="btn btn-success" onclick="Settings.exportData()">📤 ${t('export_backup')}</button>
                </div>

                <div class="glass-card p-20 mb-20" style="background: var(--warning-bg); border-color: rgba(255,170,0,0.2);">
                    <h4 style="margin-bottom:8px;">📥 ${t('import_data')}</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">⚠️ ${t('import_warning')}</p>
                    <button class="btn btn-warning" onclick="Settings.importData()">📥 ${t('import_backup')}</button>
                </div>

                <div class="glass-card p-20" style="background: var(--danger-bg); border-color: rgba(255,77,106,0.2);">
                    <h4 style="margin-bottom:8px;">🗑️ ${t('clear_all_data')}</h4>
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">⛔ ${t('clear_warning')}</p>
                    <button class="btn btn-danger" onclick="Settings.clearAllData()">🗑️ ${t('clear_data')}</button>
                </div>
            </div>
        `;
    },

    exportData() {
        const data = db.backupAll();
        data._meta = {
            exported: new Date().toISOString(),
            system: 'ARES Casher Pro',
            version: '2.0'
        };
        const filename = `ares_backup_${new Date().toISOString().split('T')[0]}.json`;
        Utils.exportJSON(data, filename);
        Toast.show(t('success'), `${t('backup_exported')}: ${filename}`, 'success');
    },

    async importData() {
        try {
            const data = await Utils.importJSON();
            if (!data._meta || data._meta.system !== 'ARES Casher Pro') {
                Toast.show(t('error'), t('invalid_backup'), 'error');
                return;
            }
            Modal.show(`⚠️ ${t('confirm_import')}`, `
                <p>${t('import_replace_warning')}</p>
                <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">${t('backup_date')}: ${Utils.formatDateTime(data._meta.exported)}</p>
            `, `
                <button class="btn btn-warning" id="confirm-import-btn">${t('confirm_import')}</button>
                <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
            `);
            document.getElementById('confirm-import-btn').onclick = () => {
                delete data._meta;
                db.restoreAll(data);
                Modal.hide();
                Toast.show(t('success'), t('data_imported'), 'success');
                setTimeout(() => location.reload(), 1000);
            };
        } catch (err) {
            Toast.show(t('error'), err.toString(), 'error');
        }
    },

    clearAllData() {
        Modal.show(`⛔ ${t('confirm_clear')}`, `
            <p style="color: var(--danger);">${t('clear_confirm_msg')}</p>
            <p style="font-size:13px; color:var(--text-muted); margin-top:8px;">${t('no_undo')}</p>
        `, `
            <button class="btn btn-danger" onclick="Settings.confirmClear()">${t('yes_clear_all')}</button>
            <button class="btn btn-ghost" onclick="Modal.hide()">${t('cancel')}</button>
        `);
    },

    confirmClear() {
        const collections = ['users', 'products', 'categories', 'customers', 'sales', 'shifts', 'settings', 'held_orders'];
        collections.forEach(c => localStorage.removeItem('ares_pos_' + c));
        Modal.hide();
        Toast.show(t('success'), t('all_data_cleared'), 'success');
        setTimeout(() => location.reload(), 1000);
    },

    goToUsersTab() {
        this.render();
        setTimeout(() => {
            const tabs = document.querySelectorAll('.tab-btn');
            tabs.forEach(t => t.classList.remove('active'));
            tabs[2].classList.add('active');
            document.getElementById('settings-content').innerHTML = this.renderUserManagement();
        }, 50);
    }
};
