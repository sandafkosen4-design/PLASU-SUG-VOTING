document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        if (!username || !password) {
            alert("Please enter your username and password.");
            return;
        }

        const button =
            this.querySelector("button[type='submit']");

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Signing in...";

        try {

            const response = await fetch("/api/auth/admin-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Invalid username or password."
                );
            }

            // Store the JWT token
            localStorage.setItem(
                "adminToken",
                data.token
            );

            // Store basic admin information
            localStorage.setItem(
                "adminUser",
                JSON.stringify(data.admin)
            );

            // Remove the old insecure flag if it exists
            localStorage.removeItem("admin");

            window.location.href =
                "admin-dashboard.html";

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            alert(error.message);

            button.disabled = false;
            button.textContent = originalText;
        }
    });
