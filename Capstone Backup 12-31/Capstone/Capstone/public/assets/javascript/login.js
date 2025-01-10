// Toggle Password Visibility
window.togglePassword = (id) => {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling.querySelector("ion-icon");

    if (input.type === "password") {
        input.type = "text";
        icon.name = "eye-off-outline";
    } else {
        input.type = "password";
        icon.name = "eye-outline";
    }
};

const mockUsers = [
    { email: 'ceo_admin@ceo.com', password: 'ceo_admin', role: 'admin' },
    { email: 'ceo_staff@ceo.com', password: 'ceo_staff', role: 'staff' },
    { email: 'ceo_manager@ceo.com', password: 'ceo_manager', role: 'manager' }
];

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Simulate authentication process
    const user = mockUsers.find(user => user.email === email && user.password === password);

    if (user) {
        alert(`Welcome back, ${user.name}`);
        window.location.href = "Dashboard.html";
    } else {
        errorMessage.textContent = 'Incorrect credentials, please try again.';
    }
});