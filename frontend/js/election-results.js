// =======================================
// ELECTION RESULTS
// =======================================

async function loadResults() {

    try {

        const response =
            await fetch("/api/results");

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                "Unable to load election results."
            );

        }

        displayResults(data.results);

    } catch (error) {

        console.error(
            "Results loading error:",
            error
        );

        document.getElementById(
            "resultsContainer"
        ).innerHTML = `
            <div class="alert alert-danger">
                Unable to load election results.
            </div>
        `;

    }

}


// =======================================
// DISPLAY RESULTS
// =======================================

function displayResults(results) {

    const container =
        document.getElementById(
            "resultsContainer"
        );

    container.innerHTML = "";


    // Group candidates by position

    const positions = {};

    results.forEach(candidate => {

        if (!positions[candidate.position]) {

            positions[candidate.position] = [];

        }

        positions[candidate.position].push(
            candidate
        );

    });


    // Display each position

    Object.keys(positions).forEach(position => {

        const candidates =
            positions[position];


        // Sort highest votes first

        candidates.sort(
            (a, b) =>
                b.vote_count - a.vote_count
        );


        const winner =
            candidates[0];


        const card =
            document.createElement("div");

        card.className =
            "col-12 mb-4";


        let candidateRows = "";


        candidates.forEach(
            (candidate, index) => {

                const isWinner =
                    index === 0 &&
                    candidate.vote_count > 0;


                candidateRows += `
                    <tr
                        ${isWinner
                            ? 'class="table-success"'
                            : ''
                        }
                    >

                        <td>
                            ${candidate.fullname}

                            ${
                                isWinner
                                    ? `
                                    <span
                                        class="badge bg-success ms-2"
                                    >
                                        WINNER
                                    </span>
                                    `
                                    : ""
                            }

                        </td>

                        <td>
                            ${candidate.department}
                        </td>

                        <td>
                            ${candidate.level}
                        </td>

                        <td>
                            <strong>
                                ${candidate.vote_count}
                            </strong>
                        </td>

                    </tr>
                `;

            }
        );


        card.innerHTML = `

            <div class="card shadow-sm">

                <div class="card-header bg-success text-white">

                    <h4 class="mb-0">
                        ${position}
                    </h4>

                </div>


                <div class="card-body">

                    <table
                        class="table table-bordered table-hover"
                    >

                        <thead class="table-light">

                            <tr>

                                <th>
                                    Candidate
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Level
                                </th>

                                <th>
                                    Votes
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${candidateRows}

                        </tbody>

                    </table>


                    ${
                        winner.vote_count > 0
                            ? `
                            <div
                                class="alert alert-success mb-0"
                            >
                                🏆 Winner:
                                <strong>
                                    ${winner.fullname}
                                </strong>
                                with
                                <strong>
                                    ${winner.vote_count}
                                </strong>
                                vote(s).
                            </div>
                            `
                            : `
                            <div
                                class="alert alert-secondary mb-0"
                            >
                                No votes have been recorded
                                for this position yet.
                            </div>
                            `
                    }

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


// =======================================
// START
// =======================================

loadResults();