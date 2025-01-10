// DOM Elements
const profileForm = document.querySelector('.profile-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const positionInput = document.getElementById('position');
const logoutButton = document.getElementById('logoutButton');
const navigationPane = document.getElementById('navigationPane');
const projectList = document.getElementById('projectList');

// Redirect to Project Template
const openProject = (projectId) => {
    window.location.href = `projectTemplate.html?projectId=${projectId}`;
};

// Populate Navigation Pane
const fetchProjectsForNav = async () => {
    try {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
};

const populateNavigationPane = async () => {
    projectList.innerHTML = ''; // Clear existing items
    const projects = await fetchProjectsForNav();
    projects.forEach((project) => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.className = project.group;
        li.addEventListener('click', () => openProject(project.id));
        projectList.appendChild(li);
    });
};

// Handle navigation pane toggle
document.querySelector('.header-right a[href="#projects"]').addEventListener('click', async (e) => {
    e.preventDefault();
    if (navigationPane.style.display === 'none' || !navigationPane.style.display) {
        await populateNavigationPane();
        navigationPane.style.display = 'block';
    } else {
        navigationPane.style.display = 'none';
    }
});

// Function to fetch user profile from localStorage
const fetchUserProfile = async (uid) => {
    try {
        const userData = localStorage.getItem(`user_${uid}`);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

// Function to save user profile to localStorage
const saveUserProfile = async (uid, userData) => {
    try {
        localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
        alert("Profile updated successfully.");
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
    }
};

// Populate Profile Form
const populateProfile = (userData) => {
    if (userData) {
        firstNameInput.value = userData.firstName || "";
        lastNameInput.value = userData.lastName || "";
        emailInput.value = userData.email || "";
        positionInput.value = userData.position || "";

        // Make position and email fields uneditable
        emailInput.setAttribute('readonly', true);
        positionInput.setAttribute('readonly', true);
    } else {
        alert("Failed to load profile information.");
    }
};

// Mock user data for demonstration purposes
const mockUsers = [
    { email: 'ceo_admin@ceo.com', password: 'ceo_admin', role: 'admin' },
    { email: 'ceo_staff@ceo.com', password: 'ceo_staff', role: 'staff' },
    { email: 'ceo_manager@ceo.com', password: 'ceo_manager', role: 'manager' }
];

// Use mock user data instead of Firebase auth
const userData = await fetchUserProfile(mockUser.uid);
populateProfile(userData);

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate password fields
    const newPassword = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (newPassword && newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const updatedUserData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        position: positionInput.value.trim(),
    };

    // Save updated profile data
    await saveUserProfile(mockUser.uid, updatedUserData);

    // Update password if changed
    if (newPassword) {
        try {
            // Mock password update
            alert("Password updated successfully.");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Failed to update password. Please try again.");
        }
    }
});

// Logout Button Functionality
logoutButton.addEventListener('click', () => {
    try {
        // Mock sign out
        alert("You have been logged out.");
        window.location.href = "C:\Users\eros\Desktop\frontend only\Capstone Backup 12-31\Capstone\Capstone\public\index.html";
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Failed to log out. Please try again.");
    }
});