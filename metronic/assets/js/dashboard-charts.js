////BAR chart
//var ctx = document.getElementById("myChart").getContext('2d');
//var myChart = new Chart(ctx, {
//    type: 'bar',
//    data: {
//    labels: ["Withdrawal", "Transfer", "Bills"],
//    datasets: [{
//    label: '# of Transactions',
//    data: [1000, 920, 600],
//    backgroundColor: [
//    'rgba(54, 162, 235, 0.2)',
//    'rgba(75, 192, 192, 0.2)',
//    'rgba(153, 102, 255, 0.2)',
//    ],
//    borderColor: [
//    'rgba(54, 162, 235, 1)',
//    'rgba(75, 192, 192, 1)',
//    'rgba(153, 102, 255, 1)',
//    ],
//    borderWidth: 1
//    }]
//    },
//    options: {
//        scales: {
//            yAxes: [{
//                ticks: {
//                beginAtZero: true
//                }
//    }]
//        }
//    }
//});

////line chart: Monthly Commission
//var ctxL = document.getElementById("lineChart").getContext('2d');
//var myLineChart = new Chart(ctxL, {
//    type: 'line',
//    data: {
//        labels: ["January", "February", "March", "April", "May", "June", "July"],
//        datasets: [
//            {
//                label: "My First dataset",
//                data: [65, 59, 80, 81, 56, 55, 40],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(0, 0, 0, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//        ]
//    },
//    options: {
//        responsive: true,
//
//    }
//});

//var ctxlDaily = document.getElementById("lineChart-daily").getContext('2d');
//var myLineChartDaily = new Chart(ctxlDaily, {
//    type: 'line',
//    data: {
//        labels: ["05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
//                 "17", "18", "19", "20","21", "22", "23", "24"],
//        datasets: [
//            {
//                label: "Withdrawal",
//                data: ["", "", "", "", "","" ,65, 59, 80, 81, 56, 55, 40,"", "", "", "","", "", "", ""],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(127, 191, 63, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//            {
//                label: "Transfers",
//                data: ["", "", "", "", "","" ,20, 25, 30, 43, 55, 55, 56,"", "", "", "","", "", "", ""],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(250, 10, 10, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//        ]
//    },
//    options: {
//        responsive: true,
//
//    }
//});

//var txnLineDaily = document.getElementById("txnDailylineChart").getContext('2d');
//var txnChartDaily = new Chart(txnLineDaily, {
//    type: 'line',
//    data: {
//        labels: ["05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
//                 "17", "18", "19", "20","21", "22", "23", "24"],
//        datasets: [
//            {
//                label: "Withdrawal",
//                data: ["", "", "", "", "","" ,65, 59, 80, 81, 56, 55, 40,"", "", "", "","", "", "", ""],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(127, 191, 63, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//        ]
//    },
//    options: {
//        responsive: true,
//
//    }
//});


//var transferLineDaily = document.getElementById("transferDailyLineChart").getContext('2d');
//var transferLineChartDaily = new Chart(transferLineDaily, {
//    type: 'line',
//    data: {
//        labels: ["05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
//                 "17", "18", "19", "20","21", "22", "23", "24"],
//        datasets: [
//            {
//                label: "Transfers",
//                data: ["", "", "", "", "","" ,20, 25, 30, 43, 55, 55, 56,"", "", "", "","", "", "", ""],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(250, 10, 10, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//        ]
//    },
//    options: {
//        responsive: true,
//
//    }
//});


//var tCC = document.getElementById("todayCommissionChart").getContext('2d');
//var todayCommissionChart = new Chart(tCC, {
//    type: 'bar',
//    data: {
//    labels: ["Withdrawal", "Transfer", "Bills"],
//    datasets: [{
//    label: 'Commissions earned',
//    data: [21000, 14000, 0],
//    backgroundColor: [
//    'rgba(54, 162, 235, 0.2)',
//    'rgba(75, 192, 192, 0.2)',
//    'rgba(153, 102, 255, 0.2)',
//    ],
//    borderColor: [
//    'rgba(54, 162, 235, 1)',
//    'rgba(75, 192, 192, 1)',
//    'rgba(153, 102, 255, 1)',
//    ],
//    borderWidth: 1
//    }]
//    },
//    options: {
//        scales: {
//            yAxes: [{
//                ticks: {
//                beginAtZero: true
//                }
//    }]
//        }
//    }
//});
//
//var dCLC = document.getElementById("dailyCommissionLineChart").getContext('2d');
//var dailyCommissionLineChart = new Chart(dCLC, {
//    type: 'line',
//    data: {
//        labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
//                 "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
//        datasets: [
//            {
//                label: "Withdrawal",
//                data: [39000, 35000, 36500, 30200, 34000, 37000, 31700],
//                backgroundColor: [
//                'rgba(255, 255, 255, .2)',
//                ],
//                borderColor: [
//                'rgba(127, 191, 63, .7)',
//                ],
//                borderWidth: 2,
//                lineTension:0
//            },
//        ]
//    },
//    options: {
//        responsive: true,
//
//    }
//});
