document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  let messageHideTimeoutId;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");
    if (messageHideTimeoutId) {
      clearTimeout(messageHideTimeoutId);
    }
    messageHideTimeoutId = setTimeout(() => {
      messageDiv.classList.add("hidden");
      messageHideTimeoutId = undefined;
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity dropdown options while keeping the placeholder (if any)
      if (activitySelect) {
        const placeholderOption = activitySelect.querySelector("option");
        activitySelect.innerHTML = "";
        if (placeholderOption && placeholderOption.value === "") {
          activitySelect.appendChild(placeholderOption);
        }
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsHTML = details.participants.length > 0
          ? `<div class="participants">
              <h5>Participants</h5>
              <ul class="participant-list">
                ${details.participants.map((p) => `<li><span class="participant-email">${p}</span> <button class="delete-participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(p)}" aria-label="Remove ${p}">✕</button></li>`).join("")}
              </ul>
            </div>`
          : `<div class="participants"><h5>Participants</h5><p class="no-participants">No participants yet.</p></div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      activitiesList.querySelectorAll(".delete-participant").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const activityName = decodeURIComponent(btn.dataset.activity);
          const participantEmail = decodeURIComponent(btn.dataset.email);

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participantEmail)}`,
              { method: "DELETE" }
            );
            const result = await response.json();
            if (response.ok) {
              showMessage(result.message, "success");
              fetchActivities();
            } else {
              showMessage(result.detail || "Could not remove participant", "error");
            }
          } catch (error) {
            showMessage("Failed to remove participant. Try again.", "error");
            console.error("Error removing participant:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
