<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Manage Level Ranges — Admin</title>
    <link rel="stylesheet" href="/css/style.css"/>
    <style>
        .admin-wrapper {
            display: flex;
            min-height: calc(100vh - 68px);
        }

        .admin-sidebar {
            width: 280px;
            background: var(--navy);
            position: fixed;
            height: calc(100vh - 68px);
            overflow-y: auto;
        }

        .admin-content {
            flex: 1;
            margin-left: 280px;
            padding: 2rem;
            background: var(--off-white);
        }

        .admin-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 24px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }

        .admin-nav-item:hover {
            background: rgba(255,255,255,0.1);
            color: var(--gold);
        }

        .admin-nav-item.active {
            background: rgba(255,255,255,0.1);
            color: var(--gold);
            border-left-color: var(--gold);
        }

        .form-card-small {
            background: white;
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }

        .form-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
        }

        .level-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }

        .level-table th {
            background: var(--navy);
            color: white;
            padding: 12px;
            text-align: left;
        }

        .level-table td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--gray-100);
        }

        .level-table tr:hover {
            background: var(--off-white);
        }

        .badge-level {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            background: var(--gold);
            color: white;
        }

        /* Modal Styles */
        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10001;
            width: 90%;
            max-width: 500px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
        }

        .modal.show {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            visibility: visible;
        }

        .modal-header {
            background: var(--navy);
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .modal-header h3 {
            color: white;
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--gray-100);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        /* Modal Backdrop */
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease;
        }

        .modal-backdrop.show {
            opacity: 1;
            visibility: visible;
        }

        @media (max-width: 768px) {
            .admin-sidebar { display: none; }
            .admin-content { margin-left: 0; }
            .form-row { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar">
    <a href="/" class="nav-brand">
        <img src="/images/logo2.png" alt="Logo" onerror="this.style.display='none'"/>
        <div class="nav-brand-text">
            <div class="title">University of Ruhuna</div>
            <div class="sub">Faculty of Technology</div>
        </div>
    </a>
    <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/index" class="btn-nav-login">Logout</a></li>
    </ul>
</nav>

<div class="admin-wrapper">
    <!-- Sidebar -->
    <div class="admin-sidebar">
        <a href="/admin/dashboard" class="admin-nav-item">📊 Dashboard</a>
        <a href="/admin/events" class="admin-nav-item">📅 Event Requests</a>
        <a href="/admin/resources" class="admin-nav-item">🪑 Manage Resources</a>
        <a href="/admin/levels" class="admin-nav-item active">📚 Manage Level Ranges</a>
        <a href="/admin/users" class="admin-nav-item">👥 Manage Users</a>
    </div>

    <!-- Main Content -->
    <div class="admin-content">
        <h1 class="section-title">Manage Level Ranges</h1>
        <div class="divider"></div>

        <!-- Add New Level Range Form -->
        <div class="form-card-small">
            <h3 style="margin-bottom: 1rem; color: var(--navy);">➕ Add New Batch (Level Range)</h3>
            <form id="addLevelForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Level *</label>
                        <select id="level" class="form-control" required>
                            <option value="">Select Level</option>
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Academic Year *</label>
                        <input type="text" id="academicYear" class="form-control" placeholder="e.g., 2024" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Number *</label>
                        <input type="number" id="startNumber" class="form-control" placeholder="e.g., 1903" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Number *</label>
                        <input type="number" id="endNumber" class="form-control" placeholder="e.g., 2226" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">➕ Add Level Range</button>
            </form>
        </div>

        <!-- Current Level Ranges Table -->
        <h3 style="color: var(--navy); margin-bottom: 1rem;">📋 Current Level Ranges</h3>

        <table class="level-table">
            <thead>
            <tr>
                <th>Level</th>
                <th>Academic Year</th>
                <th>Student ID Range</th>
                <th>Actions</th>
            </thead>
            <tbody>
            <tr th:each="range : ${levelRanges}">
                <td><span class="badge-level" th:text="|Level ${range.level}|">Level 1</span></td>
                <td th:text="${range.academicYear}">2024</td>
                <td th:text="|TG/${range.academicYear}/${range.startNumber} - TG/${range.academicYear}/${range.endNumber}|">TG/2024/1903 - TG/2024/2226</td>
                <td>
                    <button class="btn btn-primary btn-sm" th:data-id="${range.id}" th:data-level="${range.level}" th:data-year="${range.academicYear}" th:data-start="${range.startNumber}" th:data-end="${range.endNumber}" onclick="openEditModal(this)">✏️ Edit</button>
                    <button class="btn btn-danger btn-sm" th:onclick="|deleteLevel(${range.id})|">🗑️ Delete</button>
                </td>
            </tr>
            <tr th:if="${levelRanges.isEmpty()}">
                <td colspan="4" style="text-align: center; color: var(--gray-500);">No level ranges found. Add one above.</td>
            </tr>
            </tbody>
        </table>

        <div style="margin-top: 1rem; padding: 0.8rem; background: #fff3cd; border-radius: 8px; font-size: 0.85rem;">
            💡 <strong>Note:</strong> Student ID format should be <strong>TG/Year/Number</strong>. Example: TG/2024/1903
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div id="editModal" class="modal">
    <div class="modal-header">
        <h3>✏️ Edit Level Range</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
        <input type="hidden" id="editId">
        <div class="form-group">
            <label class="form-label">Level *</label>
            <select id="editLevel" class="form-control" required>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Academic Year *</label>
            <input type="text" id="editAcademicYear" class="form-control" required>
        </div>
        <div class="form-group">
            <label class="form-label">Start Number *</label>
            <input type="number" id="editStartNumber" class="form-control" required>
        </div>
        <div class="form-group">
            <label class="form-label">End Number *</label>
            <input type="number" id="editEndNumber" class="form-control" required>
        </div>
        <div id="editError" class="alert alert-danger" style="display: none;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEdit()">Save Changes</button>
    </div>
</div>

<script>
    let activeBackdrop = null;

    // Add Level Range
    document.getElementById('addLevelForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const levelData = {
            level: document.getElementById('level').value,
            academicYear: document.getElementById('academicYear').value,
            startNumber: parseInt(document.getElementById('startNumber').value),
            endNumber: parseInt(document.getElementById('endNumber').value)
        };

        fetch('/admin/level/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(levelData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('✅ Level range added successfully!', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast('❌ Failed to add level range', 'error');
                }
            });
    });

    // Delete Level Range
    function deleteLevel(id) {
        showConfirmDialog('Delete this level range? This will affect student registration validation.', 'Delete', 'Cancel', () => {
            fetch(`/admin/level/delete/${id}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('🗑️ Level range deleted successfully!', 'success');
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        showToast('❌ Failed to delete level range', 'error');
                    }
                });
        });
    }

    // Open Edit Modal
    function openEditModal(btn) {
        document.getElementById('editId').value = btn.getAttribute('data-id');
        document.getElementById('editLevel').value = btn.getAttribute('data-level');
        document.getElementById('editAcademicYear').value = btn.getAttribute('data-year');
        document.getElementById('editStartNumber').value = btn.getAttribute('data-start');
        document.getElementById('editEndNumber').value = btn.getAttribute('data-end');
        document.getElementById('editError').style.display = 'none';
        openModal();
    }

    // Save Edit
    function saveEdit() {
        const id = document.getElementById('editId').value;
        const levelData = {
            level: document.getElementById('editLevel').value,
            academicYear: document.getElementById('editAcademicYear').value,
            startNumber: parseInt(document.getElementById('editStartNumber').value),
            endNumber: parseInt(document.getElementById('editEndNumber').value)
        };

        fetch(`/admin/level/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(levelData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('✅ Level range updated successfully!', 'success');
                    closeModal();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    document.getElementById('editError').textContent = data.message || 'Failed to update level range';
                    document.getElementById('editError').style.display = 'block';
                }
            });
    }

    function openModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
        setTimeout(() => backdrop.classList.add('show'), 10);
        activeBackdrop = backdrop;

        const modal = document.getElementById('editModal');
        modal.classList.add('show');
    }

    function closeModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        if (activeBackdrop) {
            activeBackdrop.classList.remove('show');
            setTimeout(() => activeBackdrop.remove(), 300);
            activeBackdrop = null;
        }
    }

    // Toast Notification
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `<div class="toast-content">${message}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Confirmation Dialog
    function showConfirmDialog(message, confirmText, cancelText, onConfirm) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
        setTimeout(() => backdrop.classList.add('show'), 10);

        const modal = document.createElement('div');
        modal.className = 'toast-confirm';
        modal.innerHTML = `
            <div class="toast-confirm-content">
                <span class="toast-confirm-message">${message}</span>
                <div class="toast-confirm-buttons">
                    <button class="toast-confirm-btn cancel">${cancelText}</button>
                    <button class="toast-confirm-btn confirm">${confirmText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const close = () => {
            modal.classList.remove('show');
            backdrop.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                backdrop.remove();
            }, 300);
        };

        modal.querySelector('.cancel').onclick = close;
        modal.querySelector('.confirm').onclick = () => {
            close();
            onConfirm();
        };
    }
</script>

</body>
</html>
