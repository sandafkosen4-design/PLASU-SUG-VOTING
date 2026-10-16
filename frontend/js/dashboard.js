// =======================================
// STUDENT DASHBOARD
// PLASU SUG VOTING SYSTEM
// =======================================

const studentData = localStorage.getItem("student");


// =======================================
// CHECK LOGIN
// =======================================

if (!studentData) {

    alert("Please login first.");

    window.location.href = "login.html";

} else {

    const student = JSON.parse(studentData);


    // =======================================
    // STUDENT INFORMATION
    // =======================================

    document.getElementById("studentName").textContent =
        student.fullname || "N/A";

    document.getElementById("matricNo").textContent =
        student.matric_no || "N/A";

    document.getElementById("department").textContent =
        student.department || "N/A";

    document.getElementById("level").textContent =
        student.level || "N/A";


    // =======================================
    // ELECTION STATUS
    // =======================================

    const totalPositions = 5;

    const progressBar =
        document.getElementById("progressBar");

    const progressText =
        document.getElementById("progressText");


    // =======================================
    // VOTE BUTTON
    // =======================================

    const voteButton =
        document.querySelector('a[href="vote.html"]');


    // =======================================
    // CHECK VOTING STATUS
    // =======================================

    if (student.has_voted === true) {

        // Student has already voted

        const completed = totalPositions;

        const percentage = 100;


        // Progress bar

        if (progressBar) {

            progressBar.style.width =
                percentage + "%";

            progressBar.textContent =
                percentage + "%";

        }


        // Progress text

        if (progressText) {

            progressText.textContent =
                completed +
                " of " +
                totalPositions +
                " Positions Completed";

        }


        // Change vote button

        if (voteButton) {

            voteButton.textContent =
                "✓ Already Voted";

            voteButton.classList.remove("btn-success");

            voteButton.classList.add("btn-secondary");

            voteButton.removeAttribute("href");

            voteButton.style.pointerEvents =
                "none";

        }


        // Change action heading

        const heading =
            document.querySelector(
                ".card.p-4.text-center h3"
            );

        if (heading) {

            heading.textContent =
                "You Have Already Cast Your Vote";

        }


        // Change description

        const description =
            document.querySelector(
                ".card.p-4.text-center p"
            );

        if (description) {

            description.textContent =
                "Your vote has already been recorded successfully.";

        }


    } else {

        // =======================================
        // STUDENT HAS NOT VOTED
        // =======================================

        const completed = 0;

        const percentage = 0;


        if (progressBar) {

            progressBar.style.width =
                percentage + "%";

            progressBar.textContent =
                percentage + "%";

        }


        if (progressText) {

            progressText.textContent =
                completed +
                " of " +
                totalPositions +
                " Positions Completed";

        }


        if (voteButton) {

            voteButton.textContent =
                "🗳 Vote Now";

            voteButton.classList.remove("btn-secondary");

            voteButton.classList.add("btn-success");

            voteButton.setAttribute(
                "href",
                "vote.html"
            );

            voteButton.style.pointerEvents =
                "auto";

        }

    }

}