$(document).ready(function() {
    const mfServiceHeaders = ['amount', 'terminalId', 'pan', 'RRN', 'transactionTime']
    const merchantId = $('#merchantId').text();
    let mfSelectedHeaders = {};
    let fundingData = []
    let fileData = []
    let fileHeaders = []
    const mfSetHeadersModal = $('#mfSetHeadersModal');
    const mfHeadersSetting = $('#mfHeadersSetting')

    $('#fundingFile').on('change',function(e){
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = function (e) {
            const data = new Uint8Array(reader.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheet];
            fileData = XLSX.utils.sheet_to_json(worksheet);
            fileHeaders = Object.keys(fileData[0]);
            //externalTxnData = {data: reportData, headers: reportHeaders}
            mfSetHeadersModal.modal('show');
        }
    });

    mfSetHeadersModal.on('show.bs.modal', function(e) {
        mfHeadersSetting.empty();
        mfSelectedHeaders = {}
        let fileHeadersArr = $.map( fileHeaders, function(elem) {
            return {id:elem, text: elem};
        });

        fileHeadersArr.unshift({id:'default', text:"-----Select column-----"});

        $.each(mfServiceHeaders, function( index, value ) {
            mfHeadersSetting.append(
                    `<div class="form-group">
                        <label for="${value}" class="form-control-label">${value}</label>
                        <div style="margin-bottom: 15px;" id="${value}Div">
                            <select name="${value}" class="mfHeaderInput mfHeadersSelect" id="${value}" style="width: 100%; height: 50px; line-height: 50px;">
                            </select>
                        </div>
                    </div>`
                );
        });

        $('.mfHeadersSelect').select2({
            data: fileHeadersArr
        });

        $('.mfHeaderInput').on('change',function(e){
            mfSelectedHeaders[$(this).prop('name')] = $(this).val();
        });
    });

    $('#mfSetFundingHeadersBtn').on('click', function(e) {
        //let filter = selectedHeaders;
        const dataChanger = inverseObject(mfSelectedHeaders);
        fundingData = changeData(fileData, dataChanger);
        mfSetHeadersModal.modal('hide');
    });

    $('#fundFromFileBtn').on('click', function(e) {
        e.preventDefault();
        const fi = $('#ptsp').val()
        console.log(fi)
        console.log('1111111111111111111111111111111111')
        console.log(fundingData)
        let newFundingData  = []
        if (fundingData.length > 0) {
            newFundingData = $.map(  fundingData, function(elem) {
                elem.amount = elem.amount * 100;
                elem['transactionType'] = 'Purchase';
                elem['bank'] = 'UBA';
                elem['stan'] = '';
                elem['productId'] = merchantId;
                elem['reversal'] = 'false';
                elem['statusCode'] = '00';
                elem['fi'] = fi;
                return elem
            });
            console.log('2222222222222222222')
            console.log(newFundingData)
            $.ajax({
                url: '/agent/manual_funding',
                method: "post",
                data:{"data": JSON.stringify(newFundingData)},
                success: function(response, status, xhr, $form) {
                    if (response.status){
                        console.log('super! we are doing great!')
                    } else {
                        console.log('ooch! This is bad!!')
                    }
                }
            });
        }
    });

});