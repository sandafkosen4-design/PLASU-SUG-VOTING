// Dynamic Vote Page
// =======================================

const API = "http://localhost:5000";

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// Student Information
document.getElementById("studentName").textContent = student.fullname;
document.getElementById("matricNo").textContent = student.matric_no;
document.getElementById("department").textContent = student.department;
document.getElementById("level").textContent = student.level;

let totalPositions = 0;

// =======================================
// LOAD CANDIDATES
// =======================================

async function loadCandidates() {

    try {

        const response = await fetch(`${API}/api/candidates`);

        const data = await response.json();

        if (!data.success) {
            alert("Unable to load candidates.");
            return;
        }

        const container = document.getElementById("candidateContainer");

        container.innerHTML = "";

        const grouped = {};

        data.candidates.forEach(candidate => {

            if (!grouped[candidate.position]) {
                grouped[candidate.position] = [];
            }

            grouped[candidate.position].push(candidate);

        });

        totalPositions = Object.keys(grouped).length;

        Object.keys(grouped).forEach(position => {

            const section = document.createElement("div");

            section.className = "position-section";

            section.innerHTML = `
                <h2>${position}</h2>
                <hr>
            `;

            grouped[position].forEach(candidate => {

                section.innerHTML += `
                    <div class="candidate-card">

                        <h3>${candidate.fullname}</h3>

                        <p>${candidate.department}</p>

                        <p>${candidate.level}</p>

                        <p>${candidate.manifesto}</p>

                        <label>

                            <input
                                type="radio"
                                name="${position}"
                                value="${candidate.id}">

                            Vote

                        </label>

                    </div>
                `;

            });

            container.appendChild(section);

        });

        document
            .querySelectorAll("input[type='radio']")
            .forEach(radio => {

                radio.addEventListener("change", updateProgress);

            });

        updateProgress();

    } catch (err) {

        console.error("Candidate loading error:", err);

        alert("Unable to connect to server.");

    }

}

// =======================================
// PROGRESS BAR
// =======================================

function updateProgress() {

    const positions = [...new Set(
        [...document.querySelectorAll("input[type='radio']")]
            .map(radio => radio.name)
    )];

    let completed = 0;

    positions.forEach(position => {

        if (
            document.querySelector(
                `input[name="${position}"]:checked`
            )
        ) {
            completed++;
        }

    });

    const percentage = totalPositions === 0
        ? 0
        : Math.round((completed / totalPositions) * 100);

    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    if (progressBar) {
        progressBar.style.width = percentage + "%";
        progressBar.innerHTML = percentage + "%";
    }

    if (progressText) {
        progressText.innerHTML =
            `${completed} of ${totalPositions} Positions Completed`;
    }

}

// =======================================
// SUBMIT VOTE
// =======================================

document
    .getElementById("voteForm")
    .addEventListener("submit", async function(e) {

        e.preventDefault();

        const confirmVote =
            document.getElementById("confirmVote");

        if (!confirmVote.checked) {

            alert("Please confirm your vote.");

            return;

        }

        const votes = [];

        const positions = [...new Set(
            [...document.querySelectorAll("input[type='radio']")]
                .map(radio => radio.name)
        )];

        for (const position of positions) {

            const selected =
                document.querySelector(
                    `input[name="${position}"]:checked`
                );

            if (!selected) {

                alert(
                    "Please vote for every position."
                );

                return;

            }

            votes.push({

                position: position,

                candidate_id: selected.value

            });

        }

        try {

            const response = await fetch(
                `${API}/api/votes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        student_id: student.id,
                        votes: votes
                    })
                }
            );

            const data = await response.json();

     if (data.success) {

    // Update local student data
    student.has_voted = true;

    localStorage.setItem(
        "student",
        JSON.stringify(student)
    );

    // Go to thank-you page
    window.location.href = "thankyou.html";

    return;

            } else {

                alert(data.message);

            }

        } catch (err) {

            console.error(
                "Vote submission error:",
                err
            );

            alert(
                "Unable to connect to the server."
            );

        }

    });

// =======================================
// START
// =======================================

loadCandidates();