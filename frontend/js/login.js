document
.getElementById("loginForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    const matric_no = document.getElementById("matric").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/student-login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    matric_no,
                    password
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("student", JSON.stringify(data.student));

            window.location.href = "dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.error(err);

        alert("Unable to connect to the server.");

    }

});