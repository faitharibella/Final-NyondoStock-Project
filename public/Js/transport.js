function calculateTransport() {
    var distance = document.getElementById('distance').value;
    var ratePerKm = 500;
    
    if (distance && distance > 0) {
        var cost = distance * ratePerKm;
        document.getElementById('totalCost').innerHTML = 'UGX ' + cost.toLocaleString();
    } else {
        document.getElementById('totalCost').innerHTML = 'UGX 0';
    }
}