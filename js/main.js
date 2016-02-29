$(document).ready(function() {

    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', upload, false);
});

// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
    }
    return isCompatible;
};


// Method that reads and processes the selected file
function upload(evt) {
    if (!browserSupportFileUpload()) {
        alert('The File APIs are not fully supported in this browser!');
    } 
    else {
        var data = null;
        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            data = $.csv.toObjects(csvData);
            if (data && data.length > 0) {
              alert('Imported -' + data.length + '- trades successfully!');
              cpSwapBenefit(data);
            } else {
                alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
};

// Method that adds a dropdown for selecting a report type and populates the list of options
function generateReportOptions(data) {
    // declare variable for dropdown and append to page
    var reportsList = $('<select/>').attr("id", "reportSelect").val("Choose a report");
    $("#interface").append(reportsList);
    // iterate through list of reports adding each as an option to the dropdown
    $.each(reportList, function(index, value) {
        $("#reportSelect").append($("<option/>").val(value).text(value));
    });
    // append 'generate' button to page
    var genButton= $('<input type="button" value="Generate" id="generate"/>');
    $("#interface").append(genButton);
    var refreshButton = $('<input onclick="history.go(0)" value="Refresh" type="button">');
    $("#interface").append(refreshButton);
    $("#generate").on("click", function() {
        var selectedReport = $("#reportSelect").find(":selected").text();
        generateReport(selectedReport, data);
    });
};
