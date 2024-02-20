let idb;
let request = indexedDB.open('myDatabse', 1);
request.onupgradeneeded = function (event) {
    idb = event.target.result;
    let languages = idb.createObjectStore('languages', {autoIncrement: true});
}

request.onsuccess = function (event) {
    idb = event.target.result;
    displayData();
}
request.onerror = function (event) {
    alert("Datenbank konnte nicht geöffnet werden!" + event.target.errorCode);
}

// start a readwrite transaction and reference object store 'languages'
function startReadWriteTransaction() {
    let transaction = idb.transaction(['languages'], 'readwrite');
    let store = transaction.objectStore('languages');
    return {transaction, store};
}

// start a readonly transaction and reference object store 'languages'
function startReadOnlyTransaction() {
    let transaction = idb.transaction(['languages'], 'readonly');
    let store = transaction.objectStore('languages');
    return {transaction, store};
}

function iterateOverTable(allLanguages, table) {
    for (let i = 0; i < allLanguages.length; i++) {
        let row = table.insertRow();
        row.insertCell().textContent = allLanguages[i].name;
        row.insertCell().textContent = allLanguages[i].description;
    }
}

// function to add new values
function add() {
    let {transaction, store} = startReadWriteTransaction();
    let language = {name: document.getElementById('name').value, description: document.getElementById('description').value};
    store.add(language);
    transaction.oncomplete = function () {displayData();}
    transaction.onerror = function(event) {
        alert("Datensatz konnte nicht hinzugefügt werden!" + event.target.errorCode);
    }
}

function removeAll() {
    let {transaction, store} = startReadWriteTransaction();
    store.clear();
    transaction.oncomplete = function () {displayData();}
    transaction.onerror = function (event) {
        alert("Datensätze konnten nicht gelöscht werden!" + event.target.errorCode);
        displayData();
    }
}

function remove() {
    let id = prompt("Bitte geben Sie die ID des Datensatzes ein, den Sie löschen möchten!");
    let {transaction, store} = startReadWriteTransaction();
    let request = store.delete(Number(id));
    request.onsuccess = function (event) {
        alert("Datensatz erfolgreich gelöscht!");
        displayData();
    }
    request.onerror = function (event) {
        alert("Fehler beim löschen des Datensatzes " + event.target.errorCode);
    }
}


function update() {
    let id = prompt("Bitte geben Sie die ID des Datensatzes ein, den Sie ändern möchten:");
    let {transaction, store} = startReadWriteTransaction();
    let request = store.get(Number(id));
    request.onsuccess = function(event) {
        let data = event.target.result;
        if (data) {
            let newName = prompt("Bitte geben Sie den neuen Namen ein:", data.name);
            let newDescription = prompt("Bitte geben Sie die neue Beschreibunng ein:", data.description);
            let updatedData = {name: newName, description: newDescription, id: Number(id)};
            store.put(updatedData, Number(id));
            transaction.oncomplete = function() { displayData(); }
        } else {
            alert("Kein Datensatz mit der angegebenen ID gefunden.");
        }
    }
}

// function for displaying data in the browser / UI
function displayData() {
    let {transaction, store} = startReadOnlyTransaction();
    let request = store.openCursor();
    let allLanguages = [];
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor != null) {
            allLanguages.push(cursor.value);
            cursor.continue();
        } else {
            let table = document.getElementById('table');
            table.innerHTML = "<tr><th>Name</th><th>Beschreibung</th></tr>"

            iterateOverTable(allLanguages, table);
        }
    }
}
