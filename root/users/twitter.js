window.onload = insertIntoSelect();

function insertIntoSelect() {
    getUsersName();
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let ideas = JSON.parse(xhttp.responseText);

            let ideasString = "";
            let select = document.getElementById("selectLst");

            for (let id in ideas) {
                if (ideas.hasOwnProperty(id)) {
                    let option = document.createElement("option");
                    option.value = id;
                    option.innerHTML = ideas[id][0];
                    select.appendChild(option);
                }
            }
        }
    };
    xhttp.open("GET", "/ideas", true);
    xhttp.send();
}

function findTweets() {
    let xhttp = new XMLHttpRequest();
    let data = {};
    data.idea = document.getElementById('selectLst').options[document.getElementById('selectLst').selectedIndex].text;
    document.getElementById("circularG").style.display = 'block';

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let tweets = JSON.parse(xhttp.responseText);
            document.getElementById("circularG").style.display = 'none';

            if (Object.keys(tweets).length === 0 && tweets.constructor === Object) {
                element = document.getElementById("txtMsg");
                element.className = 'alert alert-danger';
                element.style.display = 'block';
                element.innerText = 'No Tweets Found.';
                document.getElementById("tweetPanel").style.display = "none";
                return;
            }
            document.getElementById("banner").src = tweets.profile_banner_url;
            document.getElementById("image").src = tweets.profile_image_url;
            document.getElementById("txtTweet").innerText = tweets.text;
            document.getElementById("txtName").innerText = tweets.name;
            document.getElementById("txtDescrip").innerText = tweets.description;
            document.getElementById("txtNumFoll").innerText = tweets.followers_count;
            document.getElementById("txtLocation").innerText = tweets.location;
            document.getElementById("tweetPanel").style.display = "block";
            document.getElementById("txtMsg").style.display = "none";
        }
    };
    xhttp.open("POST", "/tweets", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(JSON.stringify(data));
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