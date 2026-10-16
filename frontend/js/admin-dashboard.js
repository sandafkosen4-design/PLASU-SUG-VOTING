// =======================================
// ADMIN DASHBOARD
// =======================================

// Check if admin is logged in
if (localStorage.getItem("admin") !== "true") {
    alert("Please login as an administrator.");
    window.location.href = "admin-login.html";
}


// =======================================
// LOAD DASHBOARD DATA
// =======================================

async function loadDashboard() {

    try {

        // =======================================
        // GET ALL STUDENTS
        // =======================================

        const studentsResponse = await fetch(
            "/api/auth/students"
        );

        const studentsData =
            await studentsResponse.json();

        if (!studentsData.success) {
            throw new Error("Unable to load students.");
        }

        const students = studentsData.students;

        const totalStudents = students.length;


        // =======================================
        // GET VOTE COUNT
        // =======================================

        const votesResponse = await fetch(
            "/api/votes/count"
        );

        const votesData =
            await votesResponse.json();

        if (!votesData.success) {
            throw new Error("Unable to load vote count.");
        }

        const votesCast = votesData.voters;


        // =======================================
        // CALCULATE TURNOUT
        // =======================================

        const turnout =
            totalStudents > 0
                ? ((votesCast / totalStudents) * 100).toFixed(1)
                : "0.0";


        // =======================================
        // UPDATE STATISTICS
        // =======================================

        document.getElementById("students").textContent =
            totalStudents;

        document.getElementById("votes").textContent =
            votesCast;

        document.getElementById("turnout").textContent =
            turnout + "%";


        // =======================================
        // GET ELECTION RESULTS
        // =======================================

        const resultsResponse = await fetch(
            "/api/results"
        );

        const resultsData =
            await resultsResponse.json();

        if (!resultsData.success) {
            throw new Error("Unable to load election results.");
        }


        // =======================================
        // DISPLAY CANDIDATES
        // =======================================

        displayCandidates(resultsData.results);


        console.log("Dashboard loaded successfully.");
        console.log("Total Students:", totalStudents);
        console.log("Votes Cast:", votesCast);
        console.log("Turnout:", turnout + "%");
        console.log("Results:", resultsData.results);


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }
}


// =======================================
// DISPLAY CANDIDATES
// =======================================

function displayCandidates(results) {

    const tableBody =
        document.querySelector(".card:last-child tbody");

    if (!tableBody) {
        console.error("Candidate table not found.");
        return;
    }


    tableBody.innerHTML = "";


    results.forEach(candidate => {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${candidate.fullname}</td>

            <td>${candidate.position}</td>

            <td>${candidate.department}</td>

            <td>${candidate.level}</td>

            <td>
                <strong>${candidate.vote_count}</strong>
            </td>
        `;


        tableBody.appendChild(row);

    });

}


// =======================================
// START DASHBOARD
// =======================================

loadDashboard();