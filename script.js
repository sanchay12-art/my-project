const STORAGE_KEY = "society-complaints-v1";

const sampleComplaints = [
  {
    id: "SCMS-1048",
    residentName: "Rohit Sharma",
    flatNumber: "B-203",
    mobileNumber: "9876543210",
    emailAddress: "rohit@example.com",
    category: "Water Supply",
    priority: "Urgent",
    complaintDate: "2026-04-03",
    contactTime: "Morning",
    title: "Bathroom water pressure is too low",
    description: "Since last night bathroom and kitchen dono jagah water pressure bahut low aa raha hai.",
    department: "Maintenance Team",
    status: "Open",
    createdAt: "2026-04-03T09:15:00.000Z"
  },
  {
    id: "SCMS-1049",
    residentName: "Neha Verma",
    flatNumber: "C-110",
    mobileNumber: "9123456780",
    emailAddress: "neha@example.com",
    category: "Security",
    priority: "High",
    complaintDate: "2026-04-02",
    contactTime: "Evening",
    title: "Visitor entry gate delay",
    description: "Delivery visitors ko entry me extra delay ho raha hai, gate process streamline karna hai.",
    department: "Security Team",
    status: "In Progress",
    createdAt: "2026-04-02T15:30:00.000Z"
  },
  {
    id: "SCMS-1050",
    residentName: "Ananya Singh",
    flatNumber: "A-506",
    mobileNumber: "9988776655",
    emailAddress: "ananya@example.com",
    category: "Lift",
    priority: "Medium",
    complaintDate: "2026-04-01",
    contactTime: "Anytime",
    title: "Lift floor indicator not working",
    description: "Tower A ki lift me floor indicator kabhi kabhi blank ho jata hai.",
    department: "Facility Desk",
    status: "Resolved",
    createdAt: "2026-04-01T08:45:00.000Z"
  }
];

const els = {
  complaintForm: document.getElementById("complaintForm"),
  formMessage: document.getElementById("formMessage"),
  complaintTableBody: document.getElementById("complaintTableBody"),
  emptyState: document.getElementById("emptyState"),
  statsGrid: document.getElementById("statsGrid"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortBy: document.getElementById("sortBy"),
  seedDataBtn: document.getElementById("seedDataBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  heroTotal: document.getElementById("heroTotal"),
  heroOpen: document.getElementById("heroOpen"),
  heroResolved: document.getElementById("heroResolved"),
  urgentCount: document.getElementById("urgentCount"),
  topDepartment: document.getElementById("topDepartment")
};

const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

let complaints = loadComplaints();

function loadComplaints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [...sampleComplaints];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...sampleComplaints];
  } catch (error) {
    return [...sampleComplaints];
  }
}

function saveComplaints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

function generateTicketId() {
  const seed = Math.floor(1000 + Math.random() * 9000);
  return `SCMS-${seed}`;
}

function setTodayDate() {
  document.getElementById("complaintDate").value = new Date().toISOString().split("T")[0];
}

function showMessage(message, type = "success") {
  els.formMessage.textContent = message;
  els.formMessage.style.color = type === "success" ? "var(--success)" : "var(--danger)";
}

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "In Progress") return "status-progress";
  return "status-open";
}

function getPriorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function buildStats(data) {
  const open = data.filter((item) => item.status === "Open").length;
  const inProgress = data.filter((item) => item.status === "In Progress").length;
  const resolved = data.filter((item) => item.status === "Resolved").length;
  const urgent = data.filter((item) => item.priority === "Urgent" && item.status !== "Resolved").length;

  const stats = [
    { label: "Open Complaints", value: open, note: "Need assignment or action" },
    { label: "In Progress", value: inProgress, note: "Currently being handled" },
    { label: "Resolved", value: resolved, note: "Completed successfully" },
    { label: "Urgent Active", value: urgent, note: "Immediate attention cases" }
  ];

  els.statsGrid.innerHTML = stats.map((stat) => `
    <article class="stat-card">
      <p>${stat.label}</p>
      <strong>${stat.value}</strong>
      <p>${stat.note}</p>
    </article>
  `).join("");

  els.heroTotal.textContent = data.length;
  els.heroOpen.textContent = open + inProgress;
  els.heroResolved.textContent = resolved;
  els.urgentCount.textContent = `${urgent} urgent complaints need immediate attention`;

  const departmentMap = data.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + (item.status === "Resolved" ? 1 : 0);
    return acc;
  }, {});

  const topDepartmentEntry = Object.entries(departmentMap).sort((a, b) => b[1] - a[1])[0];
  els.topDepartment.textContent = topDepartmentEntry
    ? `${topDepartmentEntry[0]} resolved ${topDepartmentEntry[1]} complaint(s)`
    : "No department data yet";
}

function sortComplaints(data) {
  const sortBy = els.sortBy.value;
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
  const search = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;
  const category = els.categoryFilter.value;

  const filtered = complaints.filter((item) => {
    const searchable = [
      item.id,
      item.residentName,
      item.flatNumber,
      item.title,
      item.mobileNumber,
      item.category
    ].join(" ").toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    const matchesStatus = status === "All" || item.status === status;
    const matchesCategory = category === "All" || item.category === category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return sortComplaints(filtered);
}

function renderComplaints() {
  const data = getFilteredComplaints();
  els.complaintTableBody.innerHTML = "";
  els.emptyState.classList.toggle("hidden", data.length !== 0);

  data.forEach((complaint) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="ticket-cell">
        <span class="ticket-badge">${complaint.id}</span>
      </td>
      <td class="resident-cell">
        <div class="resident-meta">
          <strong>${complaint.residentName}</strong>
          <span>Flat ${complaint.flatNumber}</span>
          <span>${complaint.mobileNumber}</span>
        </div>
      </td>
      <td class="category-cell">
        <div class="category-stack">
          <strong>${complaint.category}</strong>
          <span>${complaint.title}</span>
        </div>
      </td>
      <td class="priority-cell">
        <span class="priority-badge ${getPriorityClass(complaint.priority)}">${complaint.priority}</span>
      </td>
      <td class="status-cell">
        <span class="status-badge ${getStatusClass(complaint.status)}">${complaint.status}</span>
      </td>
      <td class="department-cell">
        <div class="department-stack">
          <strong>${complaint.department}</strong>
          <span>${complaint.contactTime}</span>
        </div>
      </td>
      <td class="date-cell">${complaint.complaintDate}</td>
      <td class="action-cell">
        <div class="row-actions">
          <button type="button" class="mini-button progress" data-action="progress" data-id="${complaint.id}">Mark In Progress</button>
          <button type="button" class="mini-button resolve" data-action="resolve" data-id="${complaint.id}">Resolve</button>
          <button type="button" class="mini-button delete" data-action="delete" data-id="${complaint.id}">Delete</button>
        </div>
      </td>
    `;

    els.complaintTableBody.appendChild(row);
  });

  buildStats(complaints);
}

function registerComplaint(event) {
  event.preventDefault();

  const formData = {
    id: generateTicketId(),
    residentName: document.getElementById("residentName").value.trim(),
    flatNumber: document.getElementById("flatNumber").value.trim().toUpperCase(),
    mobileNumber: document.getElementById("mobileNumber").value.trim(),
    emailAddress: document.getElementById("emailAddress").value.trim(),
    category: document.getElementById("category").value,
    priority: document.getElementById("priority").value,
    complaintDate: document.getElementById("complaintDate").value,
    contactTime: document.getElementById("contactTime").value,
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    department: document.getElementById("department").value,
    status: document.getElementById("status").value,
    createdAt: new Date().toISOString()
  };

  complaints.unshift(formData);
  saveComplaints();
  renderComplaints();
  els.complaintForm.reset();
  setTodayDate();
  showMessage(`Complaint registered successfully. Ticket ID: ${formData.id}`);
}

function updateComplaintStatus(id, status) {
  complaints = complaints.map((item) => item.id === id ? { ...item, status } : item);
  saveComplaints();
  renderComplaints();
}

function deleteComplaint(id) {
  complaints = complaints.filter((item) => item.id !== id);
  saveComplaints();
  renderComplaints();
}

function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "progress") {
    updateComplaintStatus(id, "In Progress");
  }
  if (action === "resolve") {
    updateComplaintStatus(id, "Resolved");
  }
  if (action === "delete") {
    deleteComplaint(id);
  }
}

function seedData() {
  complaints = [...sampleComplaints];
  saveComplaints();
  renderComplaints();
  showMessage("Sample complaints loaded.");
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  complaints = [];
  saveComplaints();
  renderComplaints();
  showMessage("All complaint data reset successfully.");
}

function bindEvents() {
  els.complaintForm.addEventListener("submit", registerComplaint);
  els.complaintTableBody.addEventListener("click", handleTableAction);
  els.searchInput.addEventListener("input", renderComplaints);
  els.statusFilter.addEventListener("change", renderComplaints);
  els.categoryFilter.addEventListener("change", renderComplaints);
  els.sortBy.addEventListener("change", renderComplaints);
  els.seedDataBtn.addEventListener("click", seedData);
  els.resetDataBtn.addEventListener("click", resetData);
}

function init() {
  setTodayDate();
  bindEvents();
  renderComplaints();
}

init();
