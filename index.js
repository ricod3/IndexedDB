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

// function for displaying data on the browser / UI
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
