let allCandidates = [];

let editingCandidateId = null;


// ==========================================
// LOAD CANDIDATES
// ==========================================

async function loadCandidates() {

    const table = document.getElementById("candidatesTable");

    try {

        const response = await fetch("/api/candidates");

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load candidates."
            );
        }

        allCandidates = data.candidates || [];

        updateStatistics(allCandidates);

        displayCandidates(allCandidates);

    } catch (error) {

        console.error(
            "Candidate loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-danger"
                >
                    Unable to load candidates.
                    <br>
                    <small>${error.message}</small>
                </td>
            </tr>
        `;
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(candidates) {

    const total = candidates.length;

    const positions = new Set(
        candidates.map(candidate => candidate.position)
    ).size;

    const average =
        positions > 0
            ? (total / positions).toFixed(1)
            : "0";

    document.getElementById(
        "totalCandidates"
    ).textContent = total;

    document.getElementById(
        "totalPositions"
    ).textContent = positions;

    document.getElementById(
        "averageCandidates"
    ).textContent = average;
}


// ==========================================
// DISPLAY CANDIDATES
// ==========================================

function displayCandidates(candidates) {

    const table =
        document.getElementById(
            "candidatesTable"
        );

    table.innerHTML = "";


    if (candidates.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-muted"
                >
                    No candidates registered yet.
                </td>
            </tr>
        `;

        return;
    }


    candidates.forEach(
        (candidate, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(candidate.fullname)}
                    </strong>
                </td>

                <td>
                    <span class="badge bg-success">
                        ${escapeHtml(candidate.position)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(candidate.department)}
                </td>

                <td>
                    ${escapeHtml(candidate.level)}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-primary me-1"
                        onclick="editCandidate(${candidate.id})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteCandidate(${candidate.id})"
                    >
                        🗑 Delete
                    </button>

                </td>
            `;

            table.appendChild(row);
        }
    );
}


// ==========================================
// ADD / UPDATE CANDIDATE
// ==========================================

document
    .getElementById("candidateForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fullname =
                document
                    .getElementById("fullname")
                    .value
                    .trim();

            const position =
                document
                    .getElementById("position")
                    .value
                    .trim();

            const department =
                document
                    .getElementById("department")
                    .value
                    .trim();

            const level =
                document
                    .getElementById("level")
                    .value
                    .trim();


            const candidateData = {
                fullname,
                position,
                department,
                level
            };


            try {

                let response;


                // UPDATE
                if (editingCandidateId) {

                    response = await fetch(
                        `/api/candidates/${editingCandidateId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    candidateData
                                )
                        }
                    );

                }

                // ADD
                else {

                    response = await fetch(
                        "/api/candidates",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    candidateData
                                )
                        }
                    );

                }


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to save candidate."
                    );
                }


                showMessage(
                    data.message,
                    "success"
                );


                resetForm();

                await loadCandidates();


            } catch (error) {

                console.error(
                    "Candidate save error:",
                    error
                );

                showMessage(
                    error.message,
                    "danger"
                );
            }
        }
    );


// ==========================================
// EDIT CANDIDATE
// ==========================================

function editCandidate(id) {

    const candidate =
        allCandidates.find(
            item => item.id === id
        );


    if (!candidate) {
        return;
    }


    editingCandidateId = id;


    document.getElementById(
        "fullname"
    ).value = candidate.fullname;


    document.getElementById(
        "position"
    ).value = candidate.position;


    document.getElementById(
        "department"
    ).value = candidate.department;


    document.getElementById(
        "level"
    ).value = candidate.level;


    const submitButton =
        document.querySelector(
            "#candidateForm button[type='submit']"
        );


    submitButton.textContent =
        "💾 Update Candidate";


    document
        .getElementById("cancelEdit")
        .classList
        .remove("d-none");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CANCEL EDIT
// ==========================================

document
    .getElementById("cancelEdit")
    .addEventListener(
        "click",
        resetForm
    );


function resetForm() {

    editingCandidateId = null;


    document
        .getElementById("candidateForm")
        .reset();


    const submitButton =
        document.querySelector(
            "#candidateForm button[type='submit']"
        );


    submitButton.textContent =
        "➕ Add Candidate";


    document
        .getElementById("cancelEdit")
        .classList
        .add("d-none");
}


// ==========================================
// DELETE CANDIDATE
// ==========================================

async function deleteCandidate(id) {

    const candidate =
        allCandidates.find(
            item => item.id === id
        );


    if (!candidate) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${candidate.fullname}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/candidates/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to delete candidate."
            );
        }


        showMessage(
            data.message,
            "success"
        );


        await loadCandidates();


    } catch (error) {

        console.error(
            "Candidate deletion error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            "candidateMessage"
        );


    container.innerHTML = `
        <div class="alert alert-${type}">
            ${escapeHtml(message)}
        </div>
    `;


    setTimeout(() => {

        container.innerHTML = "";

    }, 4000);
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START
// ==========================================

loadCandidates();
