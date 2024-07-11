const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('person-form');
    const personIdInput = document.getElementById('person-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const personsTableBody = document.querySelector('#persons-table tbody');
    const logList = document.getElementById('log-list');

    // Fetch and display persons
    const fetchPersons = async () => {
        try {
            const response = await fetch(`${API_URL}/persons`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const persons = await response.json();
            personsTableBody.innerHTML = '';
            persons.forEach(person => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${person.Person_Id}</td>
                    <td>${person.FirstName}</td>
                    <td>${person.LastName}</td>
                    <td class="actions">
                        <button onclick="editPerson(${person.Person_Id})">Edit</button>
                        <button onclick="deletePerson(${person.Person_Id})">Delete</button>
                    </td>
                `;
                personsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching persons:', error);
        }
    };

    // Fetch and display logs
    const fetchLogs = async () => {
        try {
            const response = await fetch(`${API_URL}/logs`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const logs = await response.json();
            logList.innerHTML = '';
            logs.forEach(log => {
                const logItem = document.createElement('li');
                logItem.textContent = `[${log.timestamp}] ${log.operation}: ${JSON.stringify(log.data)}`;
                logList.appendChild(logItem);
            });
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Add or update person
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = personIdInput.value;
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;

        const person = { firstName, lastName };
        try {
            if (id) {
                await fetch(`${API_URL}/persons/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(person)
                });
            } else {
                await fetch(`${API_URL}/persons`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(person)
                });
            }
            form.reset();
            fetchPersons();
            fetchLogs();
        } catch (error) {
            console.error('Error saving person:', error);
        }
    });

    // Edit person
    window.editPerson = async (id) => {
        try {
            const response = await fetch(`${API_URL}/persons`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const persons = await response.json();
            const person = persons.find(p => p.Person_Id === id);
            if (person) {
                personIdInput.value = person.Person_Id;
                firstNameInput.value = person.FirstName;
                lastNameInput.value = person.LastName;
            }
        } catch (error) {
            console.error('Error fetching person:', error);
        }
    };

    // Delete person
    window.deletePerson = async (id) => {
        try {
            await fetch(`${API_URL}/persons/${id}`, {
                method: 'DELETE'
            });
            fetchPersons();
            fetchLogs();
        } catch (error) {
            console.error('Error deleting person:', error);
        }
    };

    // Initial fetch of persons and logs
    fetchPersons();
    fetchLogs();
});
