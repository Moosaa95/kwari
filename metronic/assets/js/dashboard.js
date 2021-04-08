$(document).ready(function(){
    //Merchants Balance DashBoard
    $.post(
        '/agent/get_balance',
        {},
        function(response, status){
            $('#accountBalanceTag').text(response.balance)
            // $('#totalWalletBalance').attr('aria-valuenow',response.)
            // $('#totalMMOBalance').attr('aria-valuenow',response.mmo_percentage)
            // $('#totalWalletBalance').text(response.merchants_percentage +'%')
            // $('#totalMMOBalance').text(response.mmo_percentage +'%' )
            // $.each(response.merchants,function(index,item){
            //     console.log(item.merchant)
            //     $('#panel1002').prepend(
            //         '<p class="note note-success">' + item.merchant + ': Balance :<span style="font-weight: bold">&#8358;'+ item.balance + '</span></p>'
            //     );
            // });

        }
    );

    //Transaction DashBoard
    $.post(
        'transactions_dashboard',
        {},
        function(response, status){
            console.log(response);
            $('#successfulTransaction').text(response.today_successful_transaction)
            $('#failedTransaction').text(response.today_failed_transaction)
            $('#yesterdaySuccessfulTransaction').text(response.yesterday_successful_transaction)
            $('#yesterdayFailedTransaction').text(response.yesterday_failed_transaction)

            //BAR chart
            var ctx = document.getElementById("myChart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                labels: ["Withdrawal", "Transfer", "Bills"],
                datasets: [{
                label: '# of Transactions',
                data: response.bar_chart_data,
                backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
                }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                            beginAtZero: true
                            }
                }]
                    }
                }
            });

            //Transaction Trend Card
            var withdrawalsDailyLine = document.getElementById("withdrawalDailylineChart").getContext('2d');
            var withdrawalsChartDaily = new Chart(withdrawalsDailyLine, {
                type: 'line',
                data: {
                    labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
                             "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
                    datasets: [
                        {
                            label: "Withdrawal",
                            data: response.line_chart.withdrawals,
                            backgroundColor: [
                            'rgba(255, 255, 255, .2)',
                            ],
                            borderColor: [
                            'rgba(127, 191, 63, .7)',
                            ],
                            borderWidth: 2,
                            lineTension:0
                        },
                    ]
                },
                options: {
                    responsive: true,

                }
            });

            var transferLineDaily = document.getElementById("transferDailyLineChart").getContext('2d');
            var transferLineChartDaily = new Chart(transferLineDaily, {
                type: 'line',
                data: {
                    labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
                             "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
                    datasets: [
                        {
                            label: "Transfers",
                            data: response.line_chart.transfers,
                            backgroundColor: [
                            'rgba(255, 255, 255, .2)',
                            ],
                            borderColor: [
                            'rgba(250, 10, 10, .7)',
                            ],
                            borderWidth: 2,
                            lineTension:0
                        },
                    ]
                },
                options: {
                    responsive: true,

                }
            });


            //Breakdown
            $('#successfulWithdrawals').text(response.successful_withdrawals)
            $('#failedWithdrawals').text(response.failed_withdrawals)
            $('#pendingWithdrawals').text(response.pending_withdrawals)
            $('#successfulTransfers').text(response.successful_transfers)
            $('#failedTransfers').text(response.failed_transfers)
            $('#pendingTransfers').text(response.pending_transfers)
        }
    );

    //Monthly Commissions DashBoard
    $.post(
        'monthly_commissions_dashboard',
        {},
        function(response, status){
            $('#monthCommission').text(response.month_commission)
            $('#lastMonthCommission').text(response.last_month_commission)

            //line chart: Monthly Commission
            var ctxL = document.getElementById("lineChart").getContext('2d');
            var myLineChart = new Chart(ctxL, {
                type: 'line',
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July"],
                    datasets: [
                        {
                            label: "Commissions Trend",
                            data: response.chart_data,
                            backgroundColor: [
                            'rgba(255, 255, 255, .2)',
                            ],
                            borderColor: [
                            'rgba(0, 0, 0, .7)',
                            ],
                            borderWidth: 2,
                            lineTension:0
                        },
                    ]
                },
                options: {
                    responsive: true,

                }
            });

        }
    );

    //Daily Commissions DashBoard
    $.post(
        'daily_commissions_dashboard',
        {},
        function(response, status){
            $('#todayCommission').text(response.today_commission)
            $('#yesterdayCommission').text(response.yesterday_commission)

            //line chart: Monthly Commission
            var tCC = document.getElementById("todayCommissionChart").getContext('2d');
            var todayCommissionChart = new Chart(tCC, {
                type: 'bar',
                data: {
                labels: ["Withdrawal", "Transfer", "Bills"],
                datasets: [{
                label: 'Commissions earned',
                data: response.bar_chart_data,
                backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
                }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                            beginAtZero: true
                            }
                }]
                    }
                }
            });

            var dCLC = document.getElementById("dailyCommissionLineChart").getContext('2d');
            var dailyCommissionLineChart = new Chart(dCLC, {
                type: 'line',
                data: {
                    labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
                             "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
                    datasets: [
                        {
                            label: "Withdrawal",
                            data: response.line_chart_data.withdrawals,
                            backgroundColor: [
                            'rgba(255, 255, 255, .2)',
                            ],
                            borderColor: [
                            'rgba(127, 191, 63, .7)',
                            ],
                            borderWidth: 2,
                            lineTension:0
                        },
                        {
                            label: "Transfer",
                            data: response.line_chart_data.transfers,
                            backgroundColor: [
                            'rgba(255, 255, 255, .2)',
                            ],
                            borderColor: [
                            'rgba(250, 10, 10, .7)',
                            ],
                            borderWidth: 2,
                            lineTension:0
                        },
                    ]
                },
                options: {
                    responsive: true,

                }
            });


        }
    );

    //MMO Balance DashBoard
    $.post(
        'mmo_balance_dashboard',
        {},
        function(response, status){
            console.log(response);
            $('#chamsBalance').text(response.chams_balance)
            $('#chamsTime').text(response.balance_time)
            $('#chamsStatus').text(response.status)

        }
    );

    $('#getChamsBalance').on('click', function(e) {
        e.preventDefault();
        $.post(
            'mmo_balance_dashboard',
            {},
            function(response, status){
                console.log(response);
                $('#chamsBalance').text(response.chams_balance)
                $('#chamsTime').text(response.balance_time)
                $('#chamsStatus').text(response.status)
            }
    );

    });

});
