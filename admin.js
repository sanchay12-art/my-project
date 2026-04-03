const ADMIN_SESSION_KEY = "society-admin-session-v1";
const ADMIN_CREDENTIALS = {
  id: "admin",
  password: "admin123"
};

const adminEls = {
  adminAuthPanel: document.getElementById("adminAuthPanel"),
  adminProtectedContent: document.getElementById("adminProtectedContent"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  adminLoginMessage: document.getElementById("adminLoginMessage"),
  adminId: document.getElementById("adminId"),
  adminPassword: document.getElementById("adminPassword"),
  adminLogoutBtn: document.getElementById("adminLogoutBtn"),
  complaintTableBody: document.getElementById("complaintTableBody"),
  emptyState: document.getElementById("emptyState"),
  statsGrid: document.getElementById("statsGrid"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortBy: document.getElementById("sortBy"),
  seedDataBtn: document.getElementById("seedDataBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  urgentCount: document.getElementById("urgentCount"),
  topDepartment: document.getElementById("topDepartment")
};

let complaints = [];

function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "authenticated";
}

function setAdminAuthenticated(value) {
  if (value) {
    localStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
    return;
  }

  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function toggleAdminView() {
  const authenticated = isAdminAuthenticated();
  adminEls.adminAuthPanel.classList.toggle("hidden", authenticated);
  adminEls.adminProtectedContent.classList.toggle("hidden", !authenticated);
}

function showLoginMessage(message, type = "error") {
  adminEls.adminLoginMessage.textContent = message;
  adminEls.adminLoginMessage.style.color = type === "success" ? "var(--success)" : "var(--danger)";
}

function handleAdminLogin(event) {
  event.preventDefault();

  const enteredId = adminEls.adminId.value.trim();
  const enteredPassword = adminEls.adminPassword.value.trim();

  if (enteredId === ADMIN_CREDENTIALS.id && enteredPassword === ADMIN_CREDENTIALS.password) {
    setAdminAuthenticated(true);
    toggleAdminView();
    adminEls.adminLoginForm.reset();
    showLoginMessage("");
    renderComplaints();
    return;
  }

  showLoginMessage("Invalid admin ID or password. Please try again.");
}

function handleAdminLogout() {
  setAdminAuthenticated(false);
  toggleAdminView();
  showLoginMessage("");
}

function buildStats(data) {
  const open = data.filter((item) => item.status === "Open").length;
  const inProgress = data.filter((item) => item.status === "In Progress").length;
  const resolved = data.filter((item) => item.status === "Resolved").length;
  const urgent = data.filter((item) => item.priority === "Urgent" && item.status !== "Resolved").length;

  const stats = [
    { label: "Total Complaints", value: data.length, note: "All registered records" },
    { label: "Open", value: open, note: "Need team attention" },
    { label: "In Progress", value: inProgress, note: "Currently being handled" },
    { label: "Resolved", value: resolved, note: "Successfully closed" }
  ];

  adminEls.statsGrid.innerHTML = stats.map((stat) => `
    <article class="stat-card">
      <p>${stat.label}</p>
      <strong>${stat.value}</strong>
      <p>${stat.note}</p>
    </article>
  `).join("");

  adminEls.urgentCount.textContent = `${urgent} urgent complaints need action`;
  const topDepartment = getDepartmentPerformance(data);
  adminEls.topDepartment.textContent = topDepartment
    ? `${topDepartment[0]} resolved ${topDepartment[1]} complaint(s)`
    : "No department data yet";
}

function sortComplaints(data) {
  const sortBy = adminEls.sortBy.value;
  const sorted = [...data];

  if (sortBy === "priority") {
    return sorted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  if (sortBy === "resident") {
    return sorted.sort((a, b) => a.residentName.localeCompare(b.residentName));
  }

  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getFilteredComplaints() {
  const search = adminEls.searchInput.value.trim().toLowerCase();
  const status = adminEls.statusFilter.value;
  const category = adminEls.categoryFilter.value;

  const filtered = complaints.filter((item) => {
    const searchable = [
      item.id,
      item.residentName,
      item.flatNumber,
      item.title,
      item.mobileNumber,
      item.category,
      item.description
    ].join(" ").toLowerCase();

    return (!search || searchable.includes(search))
      && (status === "All" || item.status === status)
      && (category === "All" || item.category === category);
  });

  return sortComplaints(filtered);
}

function renderComplaints() {
  const filtered = getFilteredComplaints();
  adminEls.complaintTableBody.innerHTML = "";
  adminEls.emptyState.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach((complaint) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="ticket-badge">${complaint.id}</span></td>
      <td>
        <div class="resident-meta">
          <strong>${complaint.residentName}</strong>
          <span>Flat ${complaint.flatNumber}</span>
          <span>${complaint.mobileNumber}</span>
        </div>
      </td>
      <td>
        <div class="issue-stack">
          <strong>${complaint.category}</strong>
          <span>${complaint.title}</span>
          <span>${complaint.description}</span>
        </div>
      </td>
      <td><span class="priority-badge ${getPriorityClass(complaint.priority)}">${complaint.priority}</span></td>
      <td><span class="status-badge ${getStatusClass(complaint.status)}">${complaint.status}</span></td>
      <td>
        <div class="department-stack">
          <strong>${complaint.department}</strong>
          <span>${complaint.contactTime}</span>
        </div>
      </td>
      <td>${complaint.complaintDate}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="mini-button progress" data-action="progress" data-id="${complaint.id}">Progress</button>
          <button type="button" class="mini-button resolve" data-action="resolve" data-id="${complaint.id}">Resolve</button>
          <button type="button" class="mini-button delete" data-action="delete" data-id="${complaint.id}">Delete</button>
        </div>
      </td>
    `;
    adminEls.complaintTableBody.appendChild(row);
  });

  buildStats(complaints);
}

async function updateComplaintStatus(id, status) {
  await updateComplaint(id, { status });
  complaints = await loadComplaints();
  renderComplaints();
}

async function deleteComplaint(id) {
  await removeComplaint(id);
  complaints = await loadComplaints();
  renderComplaints();
}

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "progress") await updateComplaintStatus(id, "In Progress");
  if (action === "resolve") await updateComplaintStatus(id, "Resolved");
  if (action === "delete") await deleteComplaint(id);
}

async function resetData() {
  for (const complaint of complaints) {
    await removeComplaint(complaint.id);
  }
  complaints = await loadComplaints();
  renderComplaints();
}

async function seedData() {
  const current = await loadComplaints();
  for (const complaint of current) {
    await removeComplaint(complaint.id);
  }
  for (const complaint of sampleComplaints) {
    await createComplaint(complaint);
  }
  complaints = await loadComplaints();
  renderComplaints();
}

adminEls.adminLoginForm.addEventListener("submit", handleAdminLogin);
adminEls.adminLogoutBtn.addEventListener("click", handleAdminLogout);
adminEls.complaintTableBody.addEventListener("click", handleTableAction);
adminEls.searchInput.addEventListener("input", renderComplaints);
adminEls.statusFilter.addEventListener("change", renderComplaints);
adminEls.categoryFilter.addEventListener("change", renderComplaints);
adminEls.sortBy.addEventListener("change", renderComplaints);
adminEls.resetDataBtn.addEventListener("click", resetData);
adminEls.seedDataBtn.addEventListener("click", seedData);

async function initAdminPage() {
  complaints = await loadComplaints();
  toggleAdminView();
  if (isAdminAuthenticated()) {
    renderComplaints();
  }
}

initAdminPage();
