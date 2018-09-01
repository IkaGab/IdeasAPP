function loginToIdeas() {
    let userData = {};
    userData.user = document.getElementById("txtUser").value;
    userData.pass = document.getElementById("txtPassword").value;

    if (userData.user === '' || userData.pass === '') {
        window.alert('Please Fill Both Fields');
    }
}