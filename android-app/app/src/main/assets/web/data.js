const STORAGE_KEY = "society-complaints-v2";

const sampleComplaints = [
  {
    id: "SCMS-2101",
    residentName: "Rohit Sharma",
    flatNumber: "B-203",
    mobileNumber: "9876543210",
    emailAddress: "rohit@example.com",
    category: "Water Supply",
    priority: "Urgent",
    complaintDate: "2026-04-03",
    contactTime: "Morning",
    title: "Bathroom water pressure is too low",
    description: "Bathroom aur kitchen line me pressure bahut kam aa raha hai.",
    department: "Maintenance Team",
    status: "Open",
    createdAt: "2026-04-03T09:15:00.000Z"
  },
  {
    id: "SCMS-2102",
    residentName: "Neha Verma",
    flatNumber: "C-110",
    mobileNumber: "9123456780",
    emailAddress: "neha@example.com",
    category: "Security",
    priority: "High",
    complaintDate: "2026-04-02",
    contactTime: "Evening",
    title: "Visitor entry gate delay",
    description: "Gate par visitor verification process slow hai aur residents ko wait karna pad raha hai.",
    department: "Security Team",
    status: "In Progress",
    createdAt: "2026-04-02T15:30:00.000Z"
  },
  {
    id: "SCMS-2103",
    residentName: "Ananya Singh",
    flatNumber: "A-506",
    mobileNumber: "9988776655",
    emailAddress: "ananya@example.com",
    category: "Lift",
    priority: "Medium",
    complaintDate: "2026-04-01",
    contactTime: "Anytime",
    title: "Lift floor indicator not working",
    description: "Tower A lift me floor display intermittent hai.",
    department: "Facility Desk",
    status: "Resolved",
    createdAt: "2026-04-01T08:45:00.000Z"
  }
];

const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

function loadComplaints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleComplaints));
    return [...sampleComplaints];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...sampleComplaints];
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleComplaints));
    return [...sampleComplaints];
  }
}

function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

function generateTicketId() {
  const seed = Math.floor(1000 + Math.random() * 9000);
  return `SCMS-${seed}`;
}

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "In Progress") return "status-progress";
  return "status-open";
}

function getPriorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function getDepartmentPerformance(complaints) {
  const departmentMap = complaints.reduce((acc, complaint) => {
    acc[complaint.department] = (acc[complaint.department] || 0) + (complaint.status === "Resolved" ? 1 : 0);
    return acc;
  }, {});

  return Object.entries(departmentMap).sort((a, b) => b[1] - a[1])[0] || null;
}
