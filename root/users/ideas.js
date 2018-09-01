let element;

onload = getUsersName();

function getAllIdeas() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let ideas = JSON.parse(xhttp.responseText);

            let ideasString = "";
            for (let id in ideas) {
                if (ideas.hasOwnProperty(id)) {
                    ideasString += "<tr><th>" + id + "</th><td>" + ideas[id][0] + "</td><td>" + ideas[id][1] + "</tr>";
                }
            }
            document.getElementById("txtIdeas").innerHTML = ideasString;
        }
    };
    xhttp.open("GET", "/ideas", true);
    xhttp.send();
}

function putAnIdea() {
    let data = {};
    data.idea = document.getElementById("txtGetIdea").value;

    if (data.idea === '') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Entered empty string. Please enter valid idea.';
        return;
    }

    let json = JSON.stringify(data);

    let xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/idea", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhttp.onload = function () {
        if (xhttp.readyState == 4 && xhttp.status == "200") {
            let ideaID = xhttp.responseText;
            document.getElementById("txtGetIdea").value = "";
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-success';
            element.style.display = 'block';
            element.innerText = 'Idea ID is : ' + ideaID;
            getAllIdeas();
        }
    }
    xhttp.send(json);
}

function deleteIdea() {
    let data = {};
    data.id = document.getElementById("txtGetDeleteId").value;

    if (data.id === '') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Entered an empty ID. Please enter valid ID.'
        return;
    }

    if (isNaN(data.id)) {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Not valid format. Please enter integer value for ID.';
        return;
    }

    let json = JSON.stringify(data);

    let xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/idea", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhttp.onload = function () {
        if (xhttp.readyState == 4 && xhttp.status == "200") {
            let status = xhttp.responseText;
            element = document.getElementById("txtMsg");

            if (status === '0') {
                document.getElementById("txtGetDeleteId").value = "";
                element.className = 'alert alert-success';
                element.style.display = 'block';
                element.innerText = 'The idea was deleted successfully';
                getAllIdeas();
            } else {
                element.className = 'alert alert-warning';
                element.style.display = 'block';
                element.innerText = 'The idea was not deleted or does not exist';
            }
        }
    }
    xhttp.send(json);
}

function UpdateIdea() {
    let data = {};
    data.idea = document.getElementById("txtIdeaToUpdate").value;
    data.id = document.getElementById("txtIDToUpdate").value;

    if (data.idea === '') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Entered empty string. Please enter valid idea.';
        return;
    }

    if (data.id === '') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Entered empty ID. Please enter valid ID.';
        return;
    }

    if (isNaN(data.id)) {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Please enter integer value for ID demand.';
        return;
    }

    let json = JSON.stringify(data);

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/idea", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhttp.onload = function () {
        if (xhttp.readyState == 4 && xhttp.status == "200") {
            let res = xhttp.responseText;
            document.getElementById("txtIdeaToUpdate").value = "";
            document.getElementById("txtIDToUpdate").value = "";
            if (res === 'ID was updated') {
                element = document.getElementById("txtMsg");
                element.className = 'alert alert-success';
                element.style.display = 'block';
                element.innerText = 'Idea was updated successfully.';
                document.getElementById("txtIDToUpdate").value = "ID";
                document.getElementById("txtIdeaToUpdate").value = "Idea";
            } else {
                element = document.getElementById("txtMsg");
                element.className = 'alert alert-warning';
                element.style.display = 'block';
                element.innerText = 'Idea update fail. Not such ID exist.';
            }
            getAllIdeas();
        }
    }
    xhttp.send(json);
}

function getUsersName() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("lblName").innerText = "Hello, " + xhttp.responseText;
        }
    };
    xhttp.open("GET", "/name", true);
    xhttp.send();
}

function closeTab() {
    document.getElementById("txtMsg").style.display = 'none';
}
