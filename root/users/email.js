window.onload = insertIntoSelect();

function insertIntoSelect() {
    getUsersName();
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let ideas = JSON.parse(xhttp.responseText);

            let ideasCheckBox = document.getElementById('chkIdea');
            let check_value = [];
            let index = 0;

            for (let id in ideas) {
                if (ideas.hasOwnProperty(id)) {
                    check_value[index] = ideas[id][0];
                    index++;
                }
            }

            for (let i in check_value) {
                let ideaRecord = document.createElement("input");
                ideaRecord.name = "chkCollection";
                ideaRecord.type = "checkbox";
                ideaRecord.id = "idea" + i;
                ideaRecord.value = check_value[i];
                ideaRecord.className = "form-checkbox";
                let text = document.createElement("span");
                text.innerHTML = " " + check_value[i] + "</br>";
                text.setAttribute("for", ideaRecord.id);
                text.className = "checkBoxTex";
                ideasCheckBox.appendChild(ideaRecord);
                ideasCheckBox.appendChild(text);
            }

        }
    };
    xhttp.open("GET", "/ideas", true);
    xhttp.send();
}

function sendEmaiData() {
    let data = {};
    data.email = document.getElementById("txtEmail").value;
    data.ideas = [];

    if (data.email === '' || data.email === 'Email') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Entered empty email. Please enter valid email.';
        return;
    }

    let chkCollection = document.getElementsByName("chkCollection");

    for (let index = 0; index < chkCollection.length; index++) {
        if (chkCollection[index].checked) {
            data.ideas.push(chkCollection[index].value);
        }
    }

    if (data.ideas.length === 0) {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-warning';
        element.style.display = 'block';
        element.innerText = 'No ideas selected. Please select ideas from check-box.';
        return;
    }

    document.getElementById("circularG").style.display = "block";

    let xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        document.getElementById("circularG").style.display = "none";
        if (xhttp.status == "200") {
            document.getElementById("txtEmail").value = "";
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-success';
            element.style.display = 'block';
            element.innerText = 'Email was sent successfully!';
        } else {
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-danger';
            element.style.display = 'block';
            element.innerText = 'Email delivery failed. Try again.';
        }
    }
    xhttp.open("POST", "/email", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(JSON.stringify(data));
}

function closeTab() {
    document.getElementById("txtMsg").style.display = 'none';
}

function clearCheckBox() {
    let chkCollection = document.getElementsByName("chkCollection");
    for (let index = 0; index < chkCollection.length; index++) {
        if (chkCollection[index].checked) {
            chkCollection[index].checked = false;
        }
    }
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