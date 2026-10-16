// =======================================
// MANAGE STUDENTS
// =======================================

let allStudents = [];


// =======================================
// LOAD STUDENTS
// =======================================

async function loadStudents() {

    const table =
        document.getElementById("studentsTable");

    try {

        console.log(
            "Loading students..."
        );

        const response =
            await fetch(
                "/api/auth/students"
            );

        console.log(
            "Response status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "Students response:",
            data
        );

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load students."
            );

        }

        allStudents =
            data.students || [];

        updateStatistics(
            allStudents
        );

        displayStudents(
            allStudents
        );

    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-danger"
                >

                    Unable to load students.

                    <br>

                    <small>
                        ${error.message}
                    </small>

                </td>

            </tr>

        `;

    }

}


// =======================================
// UPDATE STATISTICS
// =======================================

function updateStatistics(students) {

    const total =
        students.length;

    const voted =
        students.filter(
            student =>
                student.has_voted === true
        ).length;

    const remaining =
        total - voted;


    document.getElementById(
        "totalStudents"
    ).textContent =
        total;


    document.getElementById(
        "votedStudents"
    ).textContent =
        voted;


    document.getElementById(
        "remainingStudents"
    ).textContent =
        remaining;

}


// =======================================
// DISPLAY STUDENTS
// =======================================

function displayStudents(students) {

    const table =
        document.getElementById(
            "studentsTable"
        );


    table.innerHTML = "";


    if (students.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center"
                >
                    No students found.
                </td>

            </tr>

        `;

        return;

    }


    students.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            const status =
                student.has_voted === true

                    ? `
                        <span
                            class="badge bg-success"
                        >
                            Voted
                        </span>
                    `

                    : `
                        <span
                            class="badge bg-warning text-dark"
                        >
                            Not Voted
                        </span>
                    `;


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${student.fullname}
                    </strong>
                </td>

                <td>
                    ${student.matric_no}
                </td>

                <td>
                    ${student.department}
                </td>

                <td>
                    ${student.faculty}
                </td>

                <td>
                    ${student.level}
                </td>

                <td>
                    ${status}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// =======================================
// SEARCH STUDENTS
// =======================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allStudents.filter(
                    student =>

                        String(
                            student.fullname || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            student.matric_no || ""
                        )
                        .toLowerCase()
                        .includes(search)
                );


            displayStudents(
                filtered
            );

        }
    );


// =======================================
// START
// =======================================

loadStudents();