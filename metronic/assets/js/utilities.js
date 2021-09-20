function showErrorMsg(msg) {
   $('#warning').show();
   $('#warningMessage').text(msg);
}

function generateExcel(data, sheetName, fileName) {
   var wb = XLSX.utils.book_new(); // workbook created
   wb.SheetNames.push(sheetName);  // array of sheet names initialized with first sheet
   var ws = XLSX.utils.json_to_sheet(data); // work sheet created
   wb.Sheets[sheetName] = ws;
   var binaryWb = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'}); //binary workbook

   var buf = new ArrayBuffer(binaryWb.length); //convert s to arrayBuffer
   var view = new Uint8Array(buf);  //create uint8array as viewer
   for (var i=0; i<binaryWb.length; i++) view[i] = binaryWb.charCodeAt(i) & 0xFF; //convert to octet
   saveAs(new Blob([buf],{type:"application/octet-stream"}), fileName);
}

function readExcel(e, sheetNumber) {
    let reportData;
    let reportHeaders;
    const reader = new FileReader();

    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = function (e) {
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.SheetNames[sheetNumber];
        const worksheet = workbook.Sheets[sheet];
        reportData = XLSX.utils.sheet_to_json(worksheet);
        reportHeaders = Object.keys(reportData[0]);
        console.log(777777777777777777)
        console.log(reportData)
        //return {data: reportData, headers: reportHeaders};
    }
    console.log(reader.onload)
    // do {
    //     console.log(reportData.length)
    // }while (reportData.length === 0);

   console.log('55555555555555555555')
   console.log(reportData)
   return {data: reportData, headers: reportHeaders};
}

function returner(value,newValue) {
    console.log('1 am returning..........................');
    console.log(value)
    newValue = value
    return newValue
}

function readExcel1(e, sheetNumber,newVal, returner) {
    let reportData;
    let reportHeaders;
    const reader = new FileReader();

    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = function (e) {
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.SheetNames[sheetNumber];
        const worksheet = workbook.Sheets[sheet];
        reportData = XLSX.utils.sheet_to_json(worksheet);
        reportHeaders = Object.keys(reportData[0]);
        // console.log(777777777777777777)
        // console.log(reportData)
        returner({data: reportData, headers: reportHeaders}, newVal);
    }
}

function getColumnValues(data, key) {
    const valueList= data.reduce(function(acc, elem){
        acc.push(elem[key])
        return acc
    }, []);
    const uniqueValues = valueList.filter(function (elem, index, self){
        return self.indexOf(elem) === index;
    });

    return $.map( uniqueValues, function(elem) {
        return {id:elem, text: elem};
    });
}


function inverseObject(data) {
    let newData = data
    $.each(newData, function( key, value ) {
        data[value] = key
        delete data[key]
    });
    return newData
}


function formatData(data, failed, statusCol, isReversalCol, isReversal, dataChanger) {
    let filteredData = data.filter(function (elem, index, self) {
        if (elem[statusCol] !== failed) {
            return elem
        }
    });

    const newDataList = filteredData.reduce(function(acc, elem){
        $.each(elem, function( key, value ) {
            if (key in dataChanger) {
                elem[dataChanger[key]] = value
            }
            elem['is_reversal'] = !!(key === isReversalCol && isReversal.includes(value));
            delete elem[key]
        });
        acc.push(elem)
        return acc
    }, []);
    return newDataList;
}


function createReconciliationMap(data, amount, rrn, tid, is_reversal) {
    const hashTable = data.reduce(function(acc, elem){
        if (!elem[rrn]){
            console.log(elem)
            return acc
        } else{
            const key = elem[amount].toString() + elem[rrn].toString() + elem[tid].toString() + elem[is_reversal].toString()
            acc[key] = elem
            return acc
        }
    }, {});
    return hashTable;
}


function changeData(data, headers) {
    const newDataList = data.reduce(function(acc, elem){
        $.each(elem, function( key, value ) {
            if (key in headers) {
                elem[headers[key]] = value
            }
            delete elem[key]
        });
        acc.push(elem)
        return acc
    }, []);
    return newDataList;
}


function formatTransactionData(data, headers) {
    const newDataList = $.map(data, function(elem){
        const dataHeaders = Object.keys(elem)
        $.each(dataHeaders, function(index, value) {
            if (!(value in headers)) {
                delete elem[value];
            }
        });
        return elem;
    });
    return newDataList;
}


function filterTransactionData(data, headers) {
    const newDataList = data.reduce(function(acc, elem){
        $.each(headers, function( key, value ) {
            if (key in elem) {
                switch (key) {
                    case 'rrn':
                    case 'third_party_ref':
                    case 'account_number':
                    case 'card_number':
                        if (elem[key] !== null) {
                            elem[value] = elem[key];
                        }
                        delete elem[key];
                        break;
                    case 'amount':
                        elem['Debit'] = '';
                        elem['Credit'] = '';
                        if (elem.transaction_type === 'credit') {
                            elem['Credit'] = elem[key];
                        }
                        if (elem.transaction_type === 'debit') {
                            elem['Debit'] = elem[key];
                        }
                        delete elem[key];
                        delete elem.transaction_type
                        break;
                    case 'transaction_type':
                        delete elem[key];
                        break;
                    default:
                        elem[value] = elem[key];
                        delete elem[key];
                        break;
                }
                //elem[headers[key]] = value
            }else {
                delete elem[key]
            }
        });
        acc.push(elem)
        return acc
    }, []);
    return newDataList;
}


$(".addComma").on('keyup',function(){
    const m = commaSeparator($(this).val());
    $(this).val(m)
});

// $(document).on('keyup', ".addComma",function(){
//     const m = commaSeparator($(this).val());
//     $(this).val(m)
// });

$(".moneyFormat").on('load',function(){
    const m = commaSeparator($(this).val());
    $(this).val(m)
});


function populateForm(form, data) {
    $.each(data, function(key, value){
        $('[name='+key+']', form).val(value);
    });
}

function isNumber(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function commaSeparator(nStr) {
    let nStr1=nStr.replace(/,/g, "");
    const patt = new RegExp(/(\d+)(\d{3})/);
    while (patt.test(nStr1)) {
        nStr1=nStr1.replace(patt, '$1,$2');
    }
    return nStr1
}

function removeCommas(number) {
    return number.replace(/,/g, "");
}

function serializeForm(selector) {
    let formData = {};
    const formValues = $(selector).serializeArray();
    $.each(formValues, (i, { name, value }) => {
        if (value && value !== 'default') formData[name] = value;
    });
    return formData;
}

function showNotify(message, type){
    const icon = type === 'success' ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-warning-sign'

    $.notify(
        {
            // options
            icon: icon,
            title: '',
            message: message
        },
        {
            type: type
        }
    );
}

