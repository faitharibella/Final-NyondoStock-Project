// Date/time display
  function updateDateTime() {
    var now = new Date();
    var options = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    var dateTimeElem = document.getElementById("currentDateTime");
    if (dateTimeElem) {
      dateTimeElem.innerHTML = now.toLocaleDateString("en-US", options);
    }
    var dailyDateElem = document.getElementById("dailyDate");
    if (dailyDateElem) {
      var dailyOptions = { year: "numeric", month: "long", day: "numeric" };
      dailyDateElem.innerHTML = now.toLocaleDateString("en-US", dailyOptions);
    }
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Show/Hide Reports
  function showReport(type) {
    var sections = document.querySelectorAll(".report-section");
    for (var i = 0; i < sections.length; i++) {
      sections[i].style.display = "none";
    }
    var selectedReport = document.getElementById(type + "Report");
    if (selectedReport) {
      selectedReport.style.display = "block";
    }
  }

  // Back button - go to previous page
  var backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.onclick = function () {
      window.history.back();
    };
  }

  // Apply Date Filter
  var filterBtn = document.getElementById("applyFilterBtn");
  if (filterBtn) {
    filterBtn.onclick = function () {
      var fromDate = document.getElementById("fromDate").value;
      var toDate = document.getElementById("toDate").value;
      if (fromDate && toDate) {
        alert("Filtering reports from " + fromDate + " to " + toDate);
      } else {
        alert("Please select both from and to dates");
      }
    };
  }