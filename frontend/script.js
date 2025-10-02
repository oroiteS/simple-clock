class AlarmManager {
    constructor() {
        // 使用相对URL，这样无论在什么端口都能正常工作
        this.baseUrl = '';
        this.editingAlarmId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAlarms();
    }

    bindEvents() {
        // 添加闹钟表单提交
        document.getElementById('alarmForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAlarm();
        });

        // 编辑闹钟表单提交
        document.getElementById('editAlarmForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAlarm();
        });

        // 模态框关闭事件
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeEditModal();
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
            }
        });
    }

    async loadAlarms() {
        try {
            const response = await fetch(`${this.baseUrl}/alarms`);
            if (!response.ok) throw new Error('获取闹钟列表失败');

            const alarms = await response.json();
            this.renderAlarms(alarms);
        } catch (error) {
            console.error('加载闹钟失败:', error);
            this.renderError();
            this.showNotification('获取闹钟列表失败', 'error');
        }
    }

    async addAlarm() {
        const form = document.getElementById('alarmForm');
        const formData = new FormData(form);
        
        const alarmData = {
            time: document.getElementById('alarmTime').value,
            label: document.getElementById('alarmLabel').value || '闹钟',
            repeat: document.getElementById('alarmRepeat').value,
            enabled: true
        };

        try {
            const response = await fetch(`${this.baseUrl}/alarms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alarmData)
            });

            if (!response.ok) throw new Error('添加闹钟失败');

            const result = await response.json();
            this.showNotification('闹钟添加成功！', 'success');
            form.reset();
            this.loadAlarms(); // 重新加载闹钟列表
        } catch (error) {
            console.error('添加闹钟失败:', error);
            this.showNotification('添加闹钟失败，请重试', 'error');
        }
    }

    async toggleAlarm(id, enabled) {
        try {
            const response = await fetch(`${this.baseUrl}/alarms/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: enabled })
            });

            if (!response.ok) throw new Error('更新闹钟状态失败');

            this.showNotification(enabled ? '闹钟已启用' : '闹钟已禁用', 'success');
            this.loadAlarms();
        } catch (error) {
            console.error('切换闹钟状态失败:', error);
            this.showNotification('操作失败，请重试', 'error');
        }
    }

    async deleteAlarm(id) {
        if (!confirm('确定要删除这个闹钟吗？')) return;

        try {
            const response = await fetch(`${this.baseUrl}/alarms/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('删除闹钟失败');

            this.showNotification('闹钟已删除', 'success');
            this.loadAlarms();
        } catch (error) {
            console.error('删除闹钟失败:', error);
            this.showNotification('删除失败，请重试', 'error');
        }
    }

    openEditModal(alarm) {
        this.editingAlarmId = alarm.id;
        document.getElementById('editAlarmTime').value = this.extractTimeFromAlarm(alarm.time);
        document.getElementById('editAlarmLabel').value = alarm.label || '';
        document.getElementById('editAlarmRepeat').value = alarm.repeat || 'none';
        document.getElementById('editAlarmEnabled').checked = alarm.enabled !== false;
        document.getElementById('editModal').style.display = 'block';
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingAlarmId = null;
    }

    async updateAlarm() {
        if (!this.editingAlarmId) return;

        const alarmData = {
            time: document.getElementById('editAlarmTime').value,
            label: document.getElementById('editAlarmLabel').value || '闹钟',
            repeat: document.getElementById('editAlarmRepeat').value,
            enabled: document.getElementById('editAlarmEnabled').checked
        };

        try {
            const response = await fetch(`${this.baseUrl}/alarms/${this.editingAlarmId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alarmData)
            });

            if (!response.ok) throw new Error('更新闹钟失败');

            this.showNotification('闹钟更新成功！', 'success');
            this.closeEditModal();
            this.loadAlarms();
        } catch (error) {
            console.error('更新闹钟失败:', error);
            this.showNotification('更新失败，请重试', 'error');
        }
    }

    renderAlarms(alarms) {
        const container = document.getElementById('alarmsList');
        
        if (!alarms || alarms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>还没有设置任何闹钟</p>
                    <p>点击上方"添加新闹钟"开始使用</p>
                </div>
            `;
            return;
        }

        container.innerHTML = alarms.map(alarm => `
            <div class="alarm-item ${alarm.enabled === false ? 'disabled' : ''}">
                <div class="alarm-info">
                    <div class="alarm-time">${this.formatTime(alarm.time)}</div>
                    <div class="alarm-details">
                        <span class="alarm-label">${alarm.label || '闹钟'}</span>
                        <span class="alarm-repeat">${this.formatRepeat(alarm.repeat)}</span>
                    </div>
                </div>
                <div class="alarm-actions">
                    <button class="btn-toggle ${alarm.enabled === false ? 'off' : 'on'}" 
                            onclick="alarmManager.toggleAlarm('${alarm.id}', ${alarm.enabled === false ? 'true' : 'false'})">
                        ${alarm.enabled === false ? '启用' : '禁用'}
                    </button>
                    <button class="btn-edit" onclick="alarmManager.openEditModal(${JSON.stringify(alarm).replace(/"/g, '&quot;')})">
                        编辑
                    </button>
                    <button class="btn-delete" onclick="alarmManager.deleteAlarm('${alarm.id}')">
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderError() {
        const container = document.getElementById('alarmsList');
        container.innerHTML = `
            <div class="error-state">
                <p>❌ 加载闹钟失败</p>
                <button class="btn btn-primary" onclick="alarmManager.loadAlarms()">重试</button>
            </div>
        `;
    }

    extractTimeFromAlarm(timeStr) {
        if (!timeStr) return '';
        
        // 如果是ISO格式，提取时间部分
        if (timeStr.includes('T')) {
            return timeStr.split('T')[1].substring(0, 5); // 获取HH:MM
        }
        
        // 如果已经是HH:MM格式
        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        
        return timeStr;
    }

    formatTime(timeStr) {
        if (!timeStr) return '';
        
        // 如果是ISO格式，提取时间部分
        if (timeStr.includes('T')) {
            const timePart = timeStr.split('T')[1];
            return timePart.substring(0, 5); // 获取HH:MM
        }
        
        // 如果已经是HH:MM格式
        return timeStr;
    }

    formatRepeat(repeat) {
        const repeatMap = {
            'none': '不重复',
            'daily': '每天',
            'weekly': '每周'
        };
        return repeatMap[repeat] || '不重复';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// 初始化闹钟管理器
const alarmManager = new AlarmManager();

// 页面可见性变化时重新加载闹钟
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        alarmManager.loadAlarms();
    }
});