  // ========== USER MANAGEMENT WITH LOCALSTORAGE ==========
    
    // Default users data
    let users = [
      { id: 1, name: "Jane Doe", email: "jane@example.com", role: "Admin", status: "Active", sales: 45000 },
      { id: 2, name: "John Smith", email: "john@example.com", role: "Manager", status: "Inactive", sales: 12500 },
      { id: 3, name: "Alice Brown", email: "alice@example.com", role: "Salesperson", status: "Active", sales: 28300 },
      { id: 4, name: "Michael Lee", email: "michael@example.com", role: "Manager", status: "Active", sales: 67200 },
      { id: 5, name: "Susan Green", email: "susan@example.com", role: "Salesperson", status: "Inactive", sales: 8900 }
    ];
    
    // Load users from localStorage or initialize
    function loadUsersFromStorage() {
      const stored = localStorage.getItem('nyondstock_users');
      if (stored) {
        users = JSON.parse(stored);
      } else {
        saveUsersToStorage();
      }
      renderUsersTable();
    }
    
    // Save users to localStorage
    function saveUsersToStorage() {
      localStorage.setItem('nyondstock_users', JSON.stringify(users));
      // Also trigger a storage event for other pages (like dashboard)
      window.dispatchEvent(new Event('storage'));
    }
    
    // Render table with current users
    function renderUsersTable() {
      const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
      const roleValue = document.getElementById('roleFilter')?.value || 'All';
      const tbody = document.getElementById('usersTableBody');
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchValue) || user.email.toLowerCase().includes(searchValue);
        const matchesRole = roleValue === 'All' || user.role === roleValue;
        return matchesSearch && matchesRole;
      });
      
      if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No users found</td></tr>';
        return;
      }
      
      filteredUsers.forEach(user => {
        const row = tbody.insertRow();
        const roleClass = user.role === 'Admin' ? 'badge-admin' : (user.role === 'Manager' ? 'badge-manager' : 'badge-salesperson');
        const statusClass = user.status === 'Active' ? 'badge-active' : 'badge-inactive';
        
        row.innerHTML = `
          <td><strong>${user.name}</strong></td>
          <td>${user.email}</td>
          <td><span class="badge ${roleClass}">${user.role}</span></td>
          <td><span class="badge ${statusClass}">${user.status}</span></td>
          <td>UGX ${user.sales.toLocaleString()}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-user-btn" data-id="${user.id}">✏️ Edit</button>
            <button class="btn btn-danger btn-sm delete-user-btn" data-id="${user.id}">🗑️ Delete</button>
          </td>
        `;
      });
      
      // Attach event listeners to edit/delete buttons
      document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const userId = parseInt(btn.getAttribute('data-id'));
          openEditModal(userId);
        });
      });
      
      document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const userId = parseInt(btn.getAttribute('data-id'));
          deleteUser(userId);
        });
      });
    }
    
    // Add new user
    function addUser(name, email, role, status) {
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: name,
        email: email,
        role: role,
        status: status,
        sales: 0
      };
      users.push(newUser);
      saveUsersToStorage();
      renderUsersTable();
      showToast('✅ User added successfully!', 'success');
    }
    
    // Delete user
    function deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        saveUsersToStorage();
        renderUsersTable();
        showToast('🗑️ User deleted successfully!', 'danger');
      }
    }
    
    // Update user
    function updateUser(id, name, email, role, status) {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, email, role, status };
        saveUsersToStorage();
        renderUsersTable();
        showToast('✏️ User updated successfully!', 'success');
      }
    }
    
    // Open edit modal with user data
    function openEditModal(userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserStatus').value = user.status;
        
        const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
        editModal.show();
      }
    }
    
    // Toast notification function
    function showToast(message, type) {
      const toastDiv = document.createElement('div');
      toastDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed bottom-0 end-0 m-3`;
      toastDiv.style.zIndex = '9999';
      toastDiv.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
      toastDiv.style.color = '#fff';
      toastDiv.style.padding = '12px 20px';
      toastDiv.style.borderRadius = '8px';
      toastDiv.style.fontWeight = 'bold';
      toastDiv.innerHTML = message;
      document.body.appendChild(toastDiv);
      
      setTimeout(() => {
        toastDiv.remove();
      }, 3000);
    }
    
    // Event Listeners
    document.getElementById('addUserForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const role = document.getElementById('userRole').value;
      const status = document.getElementById('userStatus').value;
      
      addUser(name, email, role, status);
      
      this.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
      modal.hide();
    });
    
    document.getElementById('editUserForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = parseInt(document.getElementById('editUserId').value);
      const name = document.getElementById('editUserName').value;
      const email = document.getElementById('editUserEmail').value;
      const role = document.getElementById('editUserRole').value;
      const status = document.getElementById('editUserStatus').value;
      
      updateUser(id, name, email, role, status);
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
      modal.hide();
    });
    
    document.getElementById('searchInput')?.addEventListener('keyup', () => renderUsersTable());
    document.getElementById('roleFilter')?.addEventListener('change', () => renderUsersTable());
    
    // Initialize
    loadUsersFromStorage();
    
    // Listen for changes from other tabs/pages
    window.addEventListener('storage', function(e) {
      if (e.key === 'nyondstock_users') {
        users = JSON.parse(e.newValue);
        renderUsersTable();
      }
    });