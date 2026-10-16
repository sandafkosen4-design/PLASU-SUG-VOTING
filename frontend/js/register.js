// =======================================
// STUDENT REGISTRATION
// PLASU SUG VOTING SYSTEM
// =======================================

const API = "http://localhost:5000";

const form = document.getElementById("registerForm");
const message = document.getElementById("message");
const button = document.getElementById("registerButton");


// =======================================
// FORM SUBMISSION
// =======================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();


    // Get form values

    const fullname =
        document.getElementById("fullname").value.trim();

    const matric_no =
        document.getElementById("matric_no").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const faculty =
        document.getElementById("faculty").value.trim();

    const level =
        document.getElementById("level").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // =======================================
    // VALIDATION
    // =======================================

    if (
        !fullname ||
        !matric_no ||
        !department ||
        !faculty ||
        !level ||
        !password ||
        !confirmPassword
    ) {

        showMessage(
            "Please fill in all fields.",
            false
        );

        return;
    }


    // Check password length

    if (password.length < 4) {

        showMessage(
            "Password must be at least 4 characters.",
            false
        );

        return;
    }


    // Check passwords

    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            false
        );

        return;
    }


    // =======================================
    // DISABLE BUTTON
    // =======================================

    button.disabled = true;

    button.textContent = "Creating Account...";


    try {

        console.log("Sending registration request...");


        // =======================================
        // SEND DATA TO BACKEND
        // =======================================

        const response = await fetch(
            `${API}/api/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    fullname: fullname,

                    matric_no: matric_no,

                    department: department,

                    faculty: faculty,

                    level: level,

                    password: password

                })
            }
        );


        console.log(
            "Registration HTTP status:",
            response.status
        );


        const data = await response.json();


        console.log(
            "Registration response:",
            data
        );


        // =======================================
        // SUCCESS
        // =======================================

        if (response.ok && data.success) {

            showMessage(
                "Registration successful! Redirecting to login...",
                true
            );


            // Clear form

            form.reset();


            // Redirect to login

            setTimeout(function () {

                window.location.href = "login.html";

            }, 1500);


            return;
        }


        // =======================================
        // SERVER ERROR
        // =======================================

        showMessage(
            data.message || "Registration failed.",
            false
        );


        button.disabled = false;

        button.textContent = "Create Student Account";


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            "Unable to connect to the server. Make sure the backend is running.",
            false
        );


        button.disabled = false;

        button.textContent = "Create Student Account";

    }

});


// =======================================
// MESSAGE FUNCTION
// =======================================

function showMessage(text, success) {

    message.textContent = text;

    message.style.display = "block";


    if (success) {

        message.style.backgroundColor = "#d1e7dd";

        message.style.color = "#0f5132";

        message.style.border =
            "1px solid #badbcc";

    } else {

        message.style.backgroundColor = "#f8d7da";

        message.style.color = "#842029";

        message.style.border =
            "1px solid #f5c2c7";

    }

}