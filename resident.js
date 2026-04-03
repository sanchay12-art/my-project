const complaintForm = document.getElementById("complaintForm");
const formMessage = document.getElementById("formMessage");
const complaintDateInput = document.getElementById("complaintDate");
const mobileNumberInput = document.getElementById("mobileNumber");

function setTodayDate() {
  complaintDateInput.value = new Date().toISOString().split("T")[0];
}

function showMessage(message, type = "success") {
  formMessage.textContent = message;
  formMessage.style.color = type === "success" ? "var(--success)" : "var(--danger)";
}

async function registerComplaint(event) {
  event.preventDefault();

  const complaint = {
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
    status: "Open",
    createdAt: new Date().toISOString()
  };

  await createComplaint(complaint);
  complaintForm.reset();
  setTodayDate();
  showMessage(`Complaint registered successfully. Ticket ID: ${complaint.id}`);
}

function limitMobileNumber() {
  mobileNumberInput.value = mobileNumberInput.value.replace(/\D/g, "").slice(0, 10);
}

setTodayDate();
mobileNumberInput.addEventListener("input", limitMobileNumber);
complaintForm.addEventListener("submit", registerComplaint);
