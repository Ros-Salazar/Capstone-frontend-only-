// DOM Elements declarations
let newProjectBtn;
let popupWindow;
let closeBtns;
let projectForm;
let projectContainer;
let noProjectsText;
let editPopupWindow;
let editProjectForm;
let projectList;
let navigationPane;
let archiveLink;
let archivePopupWindow;
let archivedProjectsContainer;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements after the document has loaded
    newProjectBtn = document.getElementById('newProjectBtn');
    popupWindow = document.getElementById('popupWindow');
    closeBtns = document.querySelectorAll('.close-btn');
    projectForm = document.getElementById('projectForm');
    projectContainer = document.getElementById('projectContainer');
    noProjectsText = document.getElementById('noProjectsText');
    editPopupWindow = document.getElementById('editPopupWindow');
    editProjectForm = document.getElementById('editProjectForm');
    projectList = document.getElementById('projectList');
    navigationPane = document.getElementById('navigationPane');
    archiveLink = document.getElementById('archiveLink');
    archivePopupWindow = document.getElementById('archivePopupWindow');
    archivedProjectsContainer = document.getElementById('archivedProjectsContainer');

    // Ensure all elements are found
    if (!newProjectBtn || !popupWindow || !projectForm || !projectContainer || !noProjectsText || !editPopupWindow || !editProjectForm || !projectList || !navigationPane || !archiveLink || !archivePopupWindow || !archivedProjectsContainer) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Initialize the projects array
    let projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Save projects to local storage
    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(projects));
    };

    // Show popup when 'Add Project' is clicked
    newProjectBtn.addEventListener('click', () => {
        popupWindow.style.display = 'flex';
    });

    // Close popup
    closeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            popupWindow.style.display = 'none';
            editPopupWindow.style.display = 'none';
            archivePopupWindow.style.display = 'none';
        });
    });

    // Add Project
    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const projectName = document.getElementById('project-name').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;

        const project = {
            id: Date.now().toString(),
            name: projectName,
            location: location,
            description: description,
            group: 'default',
            completion: '0%',
        };

        projects.push(project);
        saveProjects();
        loadProjects();

        projectForm.reset();
        popupWindow.style.display = 'none';
    });

    let currentProjectBox = null;

    // Redirect to Project Template
    // Redirect to Project Template
const openProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const projectName = encodeURIComponent(project.name);
        const projectDescription = encodeURIComponent(project.description);
        window.location.href = `ProjectTemplate.html?projectName=${projectName}&projectDescription=${projectDescription}`;
    }
};

    // Populate Navigation Pane
    const populateNavigationPane = () => {
        projectList.innerHTML = ''; // Clear existing items
        projects.forEach((project) => {
            const li = document.createElement('li');
            li.textContent = project.name;
            li.className = project.group;
            li.addEventListener('click', () => openProject(project.id));
            projectList.appendChild(li);
        });
    };

    // Archive Project
    const archiveProject = (projectId) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            project.group = 'archived';
            saveProjects();
            loadProjects();
        } else {
            console.error(`Project with ID: ${projectId} not found`);
        }
    };

    // Load Projects
    const loadProjects = () => {
        projectContainer.innerHTML = ''; // Clear existing projects
        archivedProjectsContainer.innerHTML = ''; // Clear existing archived projects

        projects.forEach((project) => {
            const projectBox = document.createElement('div');
            projectBox.classList.add('project-box', project.group);
            projectBox.setAttribute('data-id', project.id);
            projectBox.innerHTML = `
                <div class="project-options">
                    <i class="fas fa-trash-alt delete-icon"></i>
                    <i class="fas fa-archive archive-icon"></i>
                </div>
                <h3>${project.name}</h3>
                <p>${project.location}</p>
                <p class="completion-text">${project.completion} COMPLETED</p>
                <i class="fas fa-pencil-alt edit-icon"></i>
            `;

            // Add click event for redirecting to project template
            projectBox.addEventListener('click', () => openProject(project.id));

            // Add click event for editing project
            projectBox.querySelector('.edit-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                currentProjectBox = projectBox;
                document.getElementById('edit-project-name').value = project.name;
                document.getElementById('edit-location').value = project.location;
                document.getElementById('edit-description').value = project.description;
                editPopupWindow.style.display = 'flex';
            });

            // Add delete functionality
            projectBox.querySelector('.delete-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = projectBox.getAttribute('data-id');
                projects = projects.filter((p) => p.id !== projectId);
                saveProjects();
                loadProjects();
            });

            // Add archive functionality
            projectBox.querySelector('.archive-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = projectBox.getAttribute('data-id');
                archiveProject(projectId);
            });

            if (project.group === 'default') {
                projectContainer.appendChild(projectBox);
            } else if (project.group === 'archived') {
                archivedProjectsContainer.appendChild(projectBox);
            }
        });

        noProjectsText.style.display = projectContainer.children.length ? 'none' : 'block';
    };

    // Edit Project
    editProjectForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const updatedProjectName = document.getElementById('edit-project-name').value;
        const updatedLocation = document.getElementById('edit-location').value;
        const updatedDescription = document.getElementById('edit-description').value;

        const projectId = currentProjectBox.getAttribute('data-id');
        const project = projects.find((p) => p.id === projectId);

        if (project) {
            project.name = updatedProjectName;
            project.location = updatedLocation;
            project.description = updatedDescription;

            saveProjects();
            loadProjects();

            editPopupWindow.style.display = 'none';
            editProjectForm.reset();
        }
    });

    // Handle navigation pane toggle
    document.querySelector('.header-right a[href="#projects"]').addEventListener('click', (e) => {
        e.preventDefault();
        if (navigationPane.style.display === 'none' || !navigationPane.style.display) {
            populateNavigationPane();
            navigationPane.style.display = 'block';
        } else {
            navigationPane.style.display = 'none';
        }
    });

    // Show archive popup when 'Archive' is clicked
    archiveLink.addEventListener('click', (e) => {
        e.preventDefault();
        archivePopupWindow.style.display = 'flex';
        loadProjects(); // Ensure the archived projects are loaded when the popup is displayed
    });

    // Initial projects load
    loadProjects();
});