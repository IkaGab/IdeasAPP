function registerToIdeas() {
    let userData = {};
    userData.name = document.getElementById("txtName").value;
    userData.user = document.getElementById("txtUser").value;
    userData.pass = document.getElementById("txtPassword").value;
    let element;

    if (userData.name === '' || userData.user === '' || userData.pass === '') {
        element = document.getElementById("txtMsg");
        element.className = 'alert alert-danger';
        element.style.display = 'block';
        element.innerText = 'Please Fill All Fields.'
        return;
    }

    let json = JSON.stringify(userData);

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/users/register", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhttp.onreadystatechange = function () {
        if (xhttp.status == "403") {
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-warning';
            element.style.display = 'block';
            element.innerText = 'User Already Exist. No Need For Registration.'
        }
        if (xhttp.status == "402") {
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-danger';
            element.style.display = 'block';
            element.innerText = 'Username Is Already Reserved. Please Choose Unique Username.'
        }
        if (xhttp.status == "200" && xhttp.readyState == 4) {
            element = document.getElementById("txtMsg");
            element.className = 'alert alert-success';
            element.style.display = 'block';
            element.innerText = 'Registration Was Successfull! Please Click Login Link.'
            document.getElementById("linkToLogin").style.cssText = "visibility: visible;";
        }
    }
    xhttp.send(json);
}

function closeTab() {
    document.getElementById("txtMsg").style.display = 'none';
}
