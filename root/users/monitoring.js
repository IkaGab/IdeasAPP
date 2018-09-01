window.onload = showAllActivity();

function showAllActivity() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let ideas = JSON.parse(xhttp.responseText);
            getUsersName();
            showDailyActivity(ideas);
            showMonthActivity(ideas);
            showYearActivity(ideas);
            calcImprovement(ideas);
        }
    };
    xhttp.open("GET", "/ideas", true);
    xhttp.send();
}

function showDailyActivity(ideas) {
    let ideasCounter = 0;
    let labels = [];
    for (let index = 0; index < 24; index++) labels[index] = "" + index;
    let data = [];
    for (let index = 0; index < 24; index++) data[index] = 0;
    let today = new Date();
    let todayD = today.getDate() >= 10 ? today.getDate() : '0' + today.getDate();
    let todayM = today.getMonth() + 1;
    todayM = todayM >= 10 ? todayM : '0' + todayM;
    let todayY = today.getFullYear();

    for (let id in ideas) {
        if (ideas.hasOwnProperty(id)) {
            ideasCounter++;
            let hoursAndDate = ideas[id][1].split(" ");
            let dateDMY = hoursAndDate[1].split("/");

            if (todayD == dateDMY[0] && todayM == dateDMY[1] && todayY == dateDMY[2]) {
                let hours = hoursAndDate[0].substring(0, 2);

                if (hours.charAt(0) == '0') {
                    hours = hours.substring(1, 2);
                }
                data[hours]++;
            }
        }
    }

    let ctx = document.getElementById('cnvDaily');
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Ideas Inserted",
                backgroundColor: '#A4E8D7',
                borderColor: '#79E5C5',
                data: data,
            }]
        },
        options: {
            resposive: false,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Today\'s Activity',
                fontColor: '#272727'
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '# Ideas'
                    },
                    ticks: {
                        min: 0,
                        stepSize: 1,
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Hours'
                    },
                    gridLines: {
                        display: false
                    }
                }]
            }
        }
    });

    document.getElementById("divIdeaCounter").innerText = ideasCounter;
    document.getElementById("divIdeaLastAdded").innerText = ideas[ideasCounter][1];
}

function showYearActivity(ideas) {
    let data = [];
    for (let index = 0; index < 12; index++) data[index] = 0;
    let today = new Date();
    let todayY = today.getFullYear();

    for (let id in ideas) {
        if (ideas.hasOwnProperty(id)) {
            let hoursAndDate = ideas[id][1].split(" ");
            let dateDMY = hoursAndDate[1].split("/");

            if (todayY == dateDMY[2]) {
                let month = dateDMY[1];

                if (month.charAt(0) == '0') {
                    month = month.substring(1, 2);
                }
                month = parseInt(month) - 1;
                data[month]++;
            }
        }
    }

    let ctx = document.getElementById('cnvYear');
    let chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                backgroundColor: ["#3a0fac", "#3ab624", "#bd75b1", "#cbc647", "#672931", "#bd0f47", "#554b42", "#0a9bcb", "#7489b9", "#427bfe", "#df9719", "#62cd89"],
                data: data,
            }]
        },
        options: {
            resposive: false,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Activity In Last Year',
                fontColor: '#272727'
            }
        }
    });
}

function showMonthActivity(ideas) {
    let data = [];
    for (let index = 0; index < 31; index++) data[index] = 0;
    let labels = [];
    for (let index = 0; index < 31; index++) labels[index] = index + 1;
    let backgroundColor = [];
    for (let index = 0; index < 31; index++) {
        backgroundColor[index] = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    }

    let today = new Date();
    let todayM = today.getMonth() + 1;
    todayM = todayM >= 10 ? todayM : '0' + todayM;
    let todayY = today.getFullYear();

    for (let id in ideas) {
        if (ideas.hasOwnProperty(id)) {
            let hoursAndDate = ideas[id][1].split(" ");
            let dateDMY = hoursAndDate[1].split("/");

            if (todayY == dateDMY[2] && todayM == dateDMY[1]) {
                let day = dateDMY[0];

                if (day.charAt(0) == '0') {
                    day = day.substring(1, 2);
                }
                day = parseInt(day) - 1;
                data[day]++;
            }
        }
    }

    let ctx = document.getElementById('cnvMonth');
    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: backgroundColor,
                data: data,
            }]
        },
        options: {
            resposive: false,
            maintainAspectRatio: false,
            legend: { display: false },
            title: {
                display: true,
                text: 'Activity In Last Month',
                fontColor: '#272727'
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '# Ideas'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Dates'
                    },
                    gridLines: {
                        display: false
                    }
                }]
            }
        }
    });
}

function calcImprovement(ideas) {
    let curMonthCounter = 0, preMonthCounter = 0, result = 0;
    let today = new Date();
    let todayM = today.getMonth() + 1;
    todayM = todayM >= 10 ? todayM : '0' + todayM;
    let yesterM = today.getMonth();
    yesterM = yesterM >= 10 ? yesterM : '0' + yesterM;
    let todayY = today.getFullYear();

    for (let id in ideas) {
        if (ideas.hasOwnProperty(id)) {
            let hoursAndDate = ideas[id][1].split(" ");
            let dateDMY = hoursAndDate[1].split("/");

            if (todayY == dateDMY[2] && todayM == dateDMY[1]) {
                curMonthCounter++;
            }
            else if (todayY == dateDMY[2] && yesterM == dateDMY[1]) {
                preMonthCounter++;
            }
        }
    }

    if (preMonthCounter == 0) {
        result = 100;
    } else {
        result = (curMonthCounter - preMonthCounter) * 100 / preMonthCounter;
        result = Math.round(result);
    }

    if (result > 0) {
        document.getElementById("divImprovement").innerText = result + '%';
        document.getElementById("lblStatusImpro").className = "fa fa-chevron-circle-up";
        document.getElementById("lblStatusImpro").style.color = "#00B837";
    } else if (result == 0) {
        document.getElementById("divImprovement").innerText = 'No Improvement';
        document.getElementById("lblStatusImpro").className = "fa fa-chevron-circle-right";
        document.getElementById("lblStatusImpro").style.color = "#F8CF00";
    } else {
        document.getElementById("divImprovement").innerText = Math.abs(result) + '%';
        document.getElementById("lblStatusImpro").className = "fa fa-chevron-circle-down";
        document.getElementById("lblStatusImpro").style.color = "#DD0030";
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