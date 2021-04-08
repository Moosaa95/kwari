$(document).ready(function(){
    //Merchants Balance DashBoard
    $.get(
        '/agent/get_balance',
        {},
        function(response, status){
            const balance = commaSeparator(response.balance.toString())
            $('#accountBalance').text(balance)
        }
    );

    /**Merchants Balance DashBoard
    $.post(
        'merchant_balance_dashboard',
        {},
        function(response, status){
            console.log(response);
            $('#merchantsBalanceTag').text(response.merchants_balance)
            $('#totalWalletBalance').attr('aria-valuenow',response.merchants_percentage)
            $('#totalMMOBalance').attr('aria-valuenow',response.mmo_percentage)
            $('#totalWalletBalance').text(response.merchants_percentage +'%')
            $('#totalMMOBalance').text(response.mmo_percentage +'%' )
            $.each(response.merchants,function(index,item){
                console.log(item.merchant)
                $('#panel1002').prepend(
                    '<p class="note note-success">' + item.merchant + ': Balance :<span style="font-weight: bold">&#8358;'+ item.balance + '</span></p>'
                );
            });

        }
    )**/

    function getSummary(data, txn, date){
        const day = moment(date);
        const strDay = day.format('YYYY-MM-DD')
        const previous_day = day.subtract(1,"days")
        const newArray = $.map(data, function(obj) {
            if(obj.created_at__date === strDay ){
                return obj
            }
        });

        const summary = newArray.reduce(function (acc, obj) {
            if(obj.service__code==='tran01' && obj.status==='successful'){
                acc.transfer.successful = obj;
            }else if(obj.service__code==='tran01' && obj.status==='failed'){
                acc.transfer.failed = obj;
            }else if(obj.service__code==='tran01' && obj.status==='pending'){
                acc.transfer.pendng = obj;
            }else if(obj.service__code==='with01' && obj.status==='successful'){
                acc.withdrawal.successful = obj;
            }else if(obj.service__code==='with01' && obj.status==='failed'){
                acc.withdrawal.failed = obj;
            }else{
                if(obj.status==='failed'){
                    acc.bills.failed.number += obj.number;
                }
                if(obj.status==='successful'){
                    acc.bills.successful.number += obj.number;
                }
                if(obj.status==='pending'){
                    acc.bills.pending.number += obj.number;
                }
            }
            return acc
        }, {transfer: {successful:{number: 0,value: 0}, failed: {number: 0,value: 0}, pendng: {number: 0,value: 0} },
            withdrawal: {successful:{number: 0,value: 0}, failed: {number: 0,value: 0}, pendng: {number: 0,value: 0} },
            bills: {successful:{number: 0}, failed: {number: 0}, pendng: {number: 0} },
        })
        return summary
    }

    //Transaction DashBoard
    $.get(
        '/agent/get_transactions_summary',
        {},
        function(response, status){
            console.log(response.data);
            const todaysTransferSummary = getSummary(response.data,'tran01',moment().format('YYYY-MM-DD'));
            const todaysWithdrawalSummary = getSummary(response.data,'with01',moment().format('YYYY-MM-DD'));
            const todaysBillsSummary = getSummary(response.data,'aedc01',moment().format('YYYY-MM-DD'));

            $('#successfulWithTxn').text(todaysWithdrawalSummary.withdrawal.successful.number)
            $('#failedWithTxn').text(todaysWithdrawalSummary.withdrawal.failed.number)
            $('#withTxnValue').text(todaysWithdrawalSummary.withdrawal.successful.value)
            $('#failedWithTxnValue').text(todaysWithdrawalSummary.withdrawal.failed.value)

            $('#successfulTransTxn').text(todaysTransferSummary.transfer.successful.number)
            $('#failedTransTxn').text(todaysTransferSummary.transfer.failed.number)
            $('#transTxnValue').text(todaysTransferSummary.transfer.successful.value)
            $('#failedTransTxnValue').text(todaysTransferSummary.transfer.failed.value)

            $('#billsTxnValue').text(todaysBillsSummary.bills.successful.value)
            $('#failedBillsTxnValue').text(todaysBillsSummary.bills.failed.value)
            // $('#yesterdaySuccessfulTransaction').text(response.yesterday_successful_transaction)
            // $('#yesterdayFailedTransaction').text(response.yesterday_failed_transaction)


            //Transaction Trend Card
            const withTxnCanvas = document.getElementById("withTxnChart").getContext('2d');
            const withTxnChart = new Chart(withTxnCanvas, {
                type: 'line',
                data: {
                    labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
                        "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
                    datasets: [
                        {
                            label: "Withdrawal",
                            data: ["11", "22","22", "22", "33", "11","10", "10"],
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

            var transferLineDaily = document.getElementById("transTxnChart").getContext('2d');
            var transferLineChartDaily = new Chart(transferLineDaily, {
                type: 'line',
                data: {
                    labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
                        "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
                    datasets: [
                        {
                            label: "Transfers",
                            data: ["11", "22","22", "22", "33", "11","10", "10"],
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

    // //Monthly Commissions DashBoard
    // $.post(
    //     'monthly_commissions_dashboard',
    //     {},
    //     function(response, status){
    //         $('#monthCommission').text(response.month_commission)
    //         $('#lastMonthCommission').text(response.last_month_commission)
    //
    //         //line chart: Monthly Commission
    //         var ctxL = document.getElementById("lineChart").getContext('2d');
    //         var myLineChart = new Chart(ctxL, {
    //             type: 'line',
    //             data: {
    //                 labels: ["January", "February", "March", "April", "May", "June", "July"],
    //                 datasets: [
    //                     {
    //                         label: "Commissions Trend",
    //                         data: response.chart_data,
    //                         backgroundColor: [
    //                             'rgba(255, 255, 255, .2)',
    //                         ],
    //                         borderColor: [
    //                             'rgba(0, 0, 0, .7)',
    //                         ],
    //                         borderWidth: 2,
    //                         lineTension:0
    //                     },
    //                 ]
    //             },
    //             options: {
    //                 responsive: true,
    //
    //             }
    //         });
    //
    //     }
    // );
    //
    // //Daily Commissions DashBoard
    // $.post(
    //     'daily_commissions_dashboard',
    //     {},
    //     function(response, status){
    //         $('#todayCommission').text(response.today_commission)
    //         $('#yesterdayCommission').text(response.yesterday_commission)
    //
    //         //line chart: Monthly Commission
    //         var tCC = document.getElementById("todayCommissionChart").getContext('2d');
    //         var todayCommissionChart = new Chart(tCC, {
    //             type: 'bar',
    //             data: {
    //                 labels: ["Withdrawal", "Transfer", "Bills"],
    //                 datasets: [{
    //                     label: 'Commissions earned',
    //                     data: response.bar_chart_data,
    //                     backgroundColor: [
    //                         'rgba(54, 162, 235, 0.2)',
    //                         'rgba(75, 192, 192, 0.2)',
    //                         'rgba(153, 102, 255, 0.2)',
    //                     ],
    //                     borderColor: [
    //                         'rgba(54, 162, 235, 1)',
    //                         'rgba(75, 192, 192, 1)',
    //                         'rgba(153, 102, 255, 1)',
    //                     ],
    //                     borderWidth: 1
    //                 }]
    //             },
    //             options: {
    //                 scales: {
    //                     yAxes: [{
    //                         ticks: {
    //                             beginAtZero: true
    //                         }
    //                     }]
    //                 }
    //             }
    //         });
    //
    //         var dCLC = document.getElementById("dailyCommissionLineChart").getContext('2d');
    //         var dailyCommissionLineChart = new Chart(dCLC, {
    //             type: 'line',
    //             data: {
    //                 labels: ["01", "02","03", "04", "05", "06","07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
    //                     "17", "18", "19", "20","21", "22", "23", "24","25", "26", "27", "28","29", "30", "31"],
    //                 datasets: [
    //                     {
    //                         label: "Withdrawal",
    //                         data: response.line_chart_data.withdrawals,
    //                         backgroundColor: [
    //                             'rgba(255, 255, 255, .2)',
    //                         ],
    //                         borderColor: [
    //                             'rgba(127, 191, 63, .7)',
    //                         ],
    //                         borderWidth: 2,
    //                         lineTension:0
    //                     },
    //                     {
    //                         label: "Transfer",
    //                         data: response.line_chart_data.transfers,
    //                         backgroundColor: [
    //                             'rgba(255, 255, 255, .2)',
    //                         ],
    //                         borderColor: [
    //                             'rgba(250, 10, 10, .7)',
    //                         ],
    //                         borderWidth: 2,
    //                         lineTension:0
    //                     },
    //                 ]
    //             },
    //             options: {
    //                 responsive: true,
    //
    //             }
    //         });
    //
    //
    //     }
    // );
    //
    // //MMO Balance DashBoard
    // $.post(
    //     'mmo_balance_dashboard',
    //     {},
    //     function(response, status){
    //         console.log(response);
    //         $('#chamsBalance').text(response.chams_balance)
    //         $('#chamsTime').text(response.balance_time)
    //         $('#chamsStatus').text(response.status)
    //
    //     }
    // );
    //
    // $('#getChamsBalance').on('click', function(e) {
    //     e.preventDefault();
    //     $.post(
    //         'mmo_balance_dashboard',
    //         {},
    //         function(response, status){
    //             console.log(response);
    //             $('#chamsBalance').text(response.chams_balance)
    //             $('#chamsTime').text(response.balance_time)
    //             $('#chamsStatus').text(response.status)
    //         }
    //     );
    //
    // });

});
