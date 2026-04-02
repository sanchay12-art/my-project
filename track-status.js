const trackEls = {
  form: document.getElementById("trackStatusForm"),
  complaintId: document.getElementById("trackComplaintId"),
  message: document.getElementById("trackMessage"),
  resultCard: document.getElementById("trackResultCard"),
  resultTitle: document.getElementById("resultTitle"),
  resultStatus: document.getElementById("resultStatus"),
  resultResident: document.getElementById("resultResident"),
  resultFlat: document.getElementById("resultFlat"),
  resultCategory: document.getElementById("resultCategory"),
  resultPriority: document.getElementById("resultPriority"),
  resultDepartment: document.getElementById("resultDepartment"),
  resultDate: document.getElementById("resultDate"),
  resultSubject: document.getElementById("resultSubject"),
  resultDescription: document.getElementById("resultDescription")
};

function showTrackMessage(message, type = "error") {
  trackEls.message.textContent = message;
  trackEls.message.style.color = type === "success" ? "var(--success)" : "var(--danger)";
}

function renderTrackResult(complaint) {
  trackEls.resultCard.classList.remove("hidden");
  trackEls.resultTitle.textContent = complaint.id;
  trackEls.resultStatus.className = `status-badge ${getStatusClass(complaint.status)}`;
  trackEls.resultStatus.textContent = complaint.status;
  trackEls.resultResident.textContent = complaint.residentName;
  trackEls.resultFlat.textContent = `Flat ${complaint.flatNumber}`;
  trackEls.resultCategory.textContent = complaint.category;
  trackEls.resultPriority.textContent = `Priority: ${complaint.priority}`;
  trackEls.resultDepartment.textContent = complaint.department;
  trackEls.resultDate.textContent = `Complaint Date: ${complaint.complaintDate}`;
  trackEls.resultSubject.textContent = complaint.title;
  trackEls.resultDescription.textContent = complaint.description;
}

function handleTrackSubmit(event) {
  event.preventDefault();

  const enteredId = trackEls.complaintId.value.trim().toUpperCase();
  const complaints = loadComplaints();
  const foundComplaint = complaints.find((item) => item.id.toUpperCase() === enteredId);

  if (!foundComplaint) {
    trackEls.resultCard.classList.add("hidden");
    showTrackMessage("Complaint ID not found. Please check the ticket ID and try again.");
    return;
  }

  showTrackMessage("Complaint found successfully.", "success");
  renderTrackResult(foundComplaint);
}

trackEls.form.addEventListener("submit", handleTrackSubmit);
