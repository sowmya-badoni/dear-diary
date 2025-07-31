let selectedMood = "";

function selectMood(mood) {
  selectedMood = mood;
  document.querySelectorAll("#moodSelector button").forEach(btn => {
    btn.classList.remove("selected");
    if (btn.textContent === mood) {
      btn.classList.add("selected");
    }
  });
}

function saveEntry() {
  const text = document.getElementById("diaryEntry").value;
  if (text.trim() === "") return alert("Please write something!");

  const today = new Date().toLocaleString();
  const entry = {
    text,
    date: today,
    mood: selectedMood || "😶"
  };

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to save!");

  db.collection("diaryEntries")
    .doc(user.uid)
    .collection("entries")
    .add(entry)
    .then(() => {
      document.getElementById("diaryEntry").value = "";
      selectedMood = "";
      displayEntries();
      document.querySelectorAll("#moodSelector button").forEach(btn => btn.classList.remove("selected"));
    })
    .catch(error => {
      alert("Error saving entry: " + error.message);
    });
}

function deleteEntry(entryId) {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("diaryEntries")
    .doc(user.uid)
    .collection("entries")
    .doc(entryId)
    .delete()
    .then(() => displayEntries());
}

function displayEntries() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("diaryEntries")
    .doc(user.uid)
    .collection("entries")
    .orderBy("date", "desc")
    .get()
    .then(snapshot => {
      const container = document.getElementById("entriesContainer");
      container.innerHTML = "";

      snapshot.forEach(doc => {
        const entry = doc.data();
        const entryId = doc.id;

        const div = document.createElement("div");
        div.className = "entry";

        div.innerHTML = `
          <small>${entry.date} • Mood: ${entry.mood}</small>
          <p class="entry-text">${entry.text}</p>
          <div class="edit-section" style="display: none;">
            <textarea class="edit-text">${entry.text}</textarea>
            <input class="edit-mood" value="${entry.mood}">
            <button class="save-edit" onclick="saveEdit('${entryId}', this)">Save ✅</button>
            <button onclick="cancelEdit(this)">Cancel ❌</button>
          </div>
          <button onclick="editEntry(this)">Edit ✏️</button>
          <button class="delete-btn" onclick="deleteEntry('${entryId}')">Delete 🗑️</button>
        `;

        container.appendChild(div);
      });
    });
}

function register() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Account created! Welcome 💕"))
    .catch(error => alert(error.message));
}

function login() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Login successful 🥳"))
    .catch(error => alert(error.message));
}

function logout() {
  auth.signOut().then(() => {
    alert("Logged out 👋");
    document.getElementById("authSection").style.display = "block";
    document.getElementById("diarySection").style.display = "none";
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("diarySection").style.display = "block";
    displayEntries();
  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("diarySection").style.display = "none";
  }
});
// 🌙 Theme Toggle Logic
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

// Load saved theme on page load
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.checked = true;
    themeLabel.textContent = "🌚";
  }
  displayEntries(); // load entries after setting theme
};

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    themeLabel.textContent = "🌚";
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    themeLabel.textContent = "🌞";
  }
});
function editEntry(button) {
  const entryDiv = button.parentElement;
  entryDiv.querySelector(".entry-text").style.display = "none";
  entryDiv.querySelector(".edit-section").style.display = "block";
  button.style.display = "none";
}

function cancelEdit(button) {
  const editDiv = button.parentElement;
  const entryDiv = editDiv.parentElement;
  entryDiv.querySelector(".entry-text").style.display = "block";
  editDiv.style.display = "none";
  entryDiv.querySelector("button[onclick^='editEntry']").style.display = "inline-block";
}

function saveEdit(entryId, saveButton) {
  const editDiv = saveButton.parentElement;
  const entryDiv = editDiv.parentElement;
  const newText = editDiv.querySelector(".edit-text").value;
  const newMood = editDiv.querySelector(".edit-mood").value;

  const user = auth.currentUser;
  if (!user) return;

  db.collection("diaryEntries")
    .doc(user.uid)
    .collection("entries")
    .doc(entryId)
    .update({
      text: newText,
      mood: newMood
    })
    .then(() => {
      displayEntries();
    });
}
