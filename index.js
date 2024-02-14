let db;
let request = indexedDB.open('myDatabse', 1);
request.onupgradeneeded = function (event) {
    db = event.target.result;
    let languages = db.createObjectStore('languages', {autoIncrement: true});
}

request.onsuccess = function (event) {
    db = event.target.result;
    displayData();
}
request.onerror = function (event) {
    alert('error opening database' + event.target.errorCode);
}

// function to add new values
function add() {
    let x = db.transaction(['languages'], 'readwrite');
    let store = x.objectStore('languages');
    let language = {name: document.getElementById('name').value, description: document.getElementById('description').value};
    store.add(language);
    x.oncomplete = function () {displayData();}
    x.onerror = function(event) {
        alert('error storing note ' + event.target.errorCode);
    }
}

function remove() {
    let x = db.transaction(['languages'], 'readwrite');
    let store = x.objectStore('languages');
    store.clear();
    x.oncomplete = function () {displayData();}
    x.onerror = function (event) {
        alert('error storing note' + event.target.errorCode);
    }
}

function update() {
    let id = prompt("Bitte geben Sie die ID des Datensatzes ein, den Sie ändern möchten:");
    let x = db.transaction(['languages'], 'readwrite');
    let store = x.objectStore('languages');
    let request = store.get(Number(id));
    request.onsuccess = function(event) {
        let data = event.target.result;
        if (data) {
            let newName = prompt("Bitte geben Sie den neuen Namen ein:", data.name);
            let newDescription = prompt("Bitte geben Sie die neue Beschreibunng ein:", data.description);
            let updatedData = {name: newName, description: newDescription, id: Number(id)};
            store.put(updatedData, Number(id));
            x.oncomplete = function() { displayData(); }
        } else {
            alert("Kein Datensatz mit der angegebenen ID gefunden.");
        }
    }
    request.onerror = function(event) {
        alert('error getting data ' + event.target.errorCode);
    }
}


// function for displaying data in the browser / UI
function displayData() {
    let x = db.transaction(['languages'],  'readonly');
    let store = x.objectStore('languages');
    let req = store.openCursor();
    let allLanguages = [];
    req.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor != null) {
            allLanguages.push(cursor.value);
            cursor.continue();
        } else {
            let table = document.getElementById('table');
            table.innerHTML = "<tr><th>Name</th><th>Beschreibung</th></tr>"

            for (let i = 0; i < allLanguages.length; i++) {
                let row = table.insertRow();
                row.insertCell().textContent = allLanguages[i].name;
                row.insertCell().textContent = allLanguages[i].description;
            }
        }
    }
}
