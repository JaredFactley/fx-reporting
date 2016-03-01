reportList = [
	"Raw Trade Details",
	"Top Counterparts",
	"Top Currencies",
	"Top Funds",
	"Top Locations",
	"Top Traders"
];

// Method that checks which report was chosen and passes the data set to the function to generate the report
function generateReport(report, data) {
	$("#result-table").empty();
	$("#result-graph").empty();
	if (report == "Raw Trade Details") {
		var html = rawTrades(data);
		$("#result-table").html(html);
		return;
	}
	else if (report == "Top Counterparts") {
		var criteria = "INST";
	}
	else if (report == "Top Currencies") {
		var criteria = "BUYCCY";
	}
	else if (report == "Top Funds") {
		var criteria = "FUND";
	}
	else if (report == "Top Locations") {
		var criteria = "LOC";
	}
	else if (report == "Top Traders") {
		var criteria = "TRADER";
	}
	var html = topX(data, criteria);
	$("#result-table").html(html);
};

// Method that calculates the total USD trade vol per criteria passed in
function topX(data, criteria) {
	var counter = new Object();
	for (var row in data) {
		var splitUser = data[row].USER.split(".");
		data[row].LOC = splitUser[0];
		data[row].INST = splitUser[1];
		data[row].TRADER = splitUser[2];
		if (typeof counter[data[row][criteria]] === 'undefined') {
			counter[data[row][criteria]] = 0;
		}
		counter[data[row][criteria]] = +counter[data[row][criteria]] + (100 * +data[row].BUYAMT);
	}
	for (var item in counter) {
		counter[item] = counter[item]/100;
	}
	var html = createTable(counter, criteria);
	addGraph(counter);
	return html;
};

// Method that creates html for a table based on the object passed in
function createTable(data, heading1, heading2) {
	var html = '';
	heading1 = heading1 || "Criteria";
	heading2 = heading2 || "Total USD Trade Vol";
	html += '<table class="table table-hover">'
	html += '<tr>\r\n';
	html += '<th>' + heading1 + '</th><th>' + heading2 + '</th>';
	html += '</tr>\r\n';
	for(var item in data) {
		html += '<tr>';
		html += '<td>' + item + '</td><td>' + data[item] + '</td>';
		html += '</tr>';
	}
	html += '</table>'
	return html;
};

// Method that generates the raw trade data table and passes the formatted HTML back to the DOM
function rawTrades(data) {
	var html = '';

	if(typeof(data[0]) === 'undefined') {
	      return null;
    }


    if(data[0].constructor === String) {
    	html += '<table class="table table-hover">'
    	html += '<tr>\r\n';
      	for(var item in data) {
        	html += '<td>' + data[item] + '</td>\r\n';
      	}
      	html += '</tr>\r\n';
      	html += '</table>'
    }

    if(data[0].constructor === Array) {
    	html += '<table class="table table-hover">'
    	for(var row in data) {
        	html += '<tr>\r\n';
        	for(var item in data[row]) {
          		html += '<td>' + data[row][item] + '</td>\r\n';
        	}
        	html += '</tr>\r\n';
      	}
      	html += '</table>'
    }

    if(data[0].constructor === Object) {
    	html += '<table class="table table-hover">'
    	html += '<tr>\r\n';
		for(var heading in data[0]) {
			html += '<th>' + heading + '</th>\r\n';
		}
		html += '<tr>\r\n';
      	for(var row in data) {
        	html += '<tr>\r\n';
        	for(var item in data[row]) {
          		html += '<td>' + data[row][item] + '</td>\r\n';
        	}
        	html += '</tr>\r\n';
      	}
    }
    
    return html;
};

function cpSwapBenefit(data) {
	var cpData = new Object();
	for (var row in data) {
		var tempSettDiff = 0;
		//split the user, inst and location from the BANKINST
		var splitUser = data[row].BANKINST.split(".");
		data[row].LOC = splitUser[1];
		data[row].INST = splitUser[0];
		data[row].TRADER = splitUser[2];
		if(data[row].SESSIONTYPE !== 'CP MARKET'){
			//skip the row if not a competitive session
			continue;
		}
		if(data[row].ORDERTYPE !== 'SWAP'){
			//skip the row if not a competitive session
			continue;
		}
		var cpSessId = data[row].CPSESSIONID;
		//check if cp session has been created yet, if not > create
		if (typeof cpData[cpSessId] === 'undefined') {
			cpData[cpSessId] = new Object();
			cpData[cpSessId].id = cpSessId;
			//cpData[cpSessId].worst = 0;
			cpData[cpSessId].best = 0;
			cpData[cpSessId].win = 0;
			cpData[cpSessId].usdrate = 1;
			cpData[cpSessId].ccy = "";
			cpData[cpSessId].benefit = 0;
			cpData[cpSessId].leg2dir = "";
			cpData[cpSessId].winbank = "";
		}
		//look for row with swapid
		if (data[row].SWAPID != " "){
			//iterate through data looking for swapid matching orderid
			for (var checkRow in data){
				//found match, far leg is sell
				if (data[row].SWAPID == data[checkRow].ORDERID && data[row].DIRECTION == "SELL"){
					//swap value equals far leg minus near
					tempSettDiff = data[row].SETTLEAMT * 100 - data[checkRow].SETTLEAMT * 100;
				}
				//found match, far leg is buy
				else if(data[row].SWAPID == data[checkRow].ORDERID && data[row].DIRECTION == "BUY"){
					//swap value equals near leg minus far
					tempSettDiff = data[checkRow].SETTLEAMT * 100 - data[row].SETTLEAMT * 100;
				}
			}
			//skip if unpriced
			if (data[row].SPOTRATE != 0){
				//set swap value as worst offer if worse than previous
				if (typeof cpData[cpSessId].worst === 'undefined' || tempSettDiff < cpData[cpSessId].worst){
					cpData[cpSessId].worst = tempSettDiff;
				}
				//set swap value as best offer if bester than previous
				if (tempSettDiff > cpData[cpSessId].best){
					cpData[cpSessId].best = tempSettDiff;
				}
				//set swap value as winning offer if winner Y
				if (data[row].IS_WINNER_FLAG == "Y"){
					cpData[cpSessId].win = tempSettDiff;
					cpData[cpSessId].winbank = data[row].INST;
				}
				cpData[cpSessId].ccy = data[row].SETTLECCY;
				cpData[cpSessId].usdrate = data[row].SETTLEAMT / data[row].TRADE_VOL_USD
			}
		}
	};
	var count = 0;
	var cpBenefit = new Object();
	var elseCount = 0;
	for (var session in cpData){
		if (cpData[session].worst !== 0 && cpData[session].win !== 0){
			cpData[session].benefit = cpData[session].win - cpData[session].worst;
			var tempCurr = cpData[session].ccy;
			if (typeof cpBenefit[tempCurr] === 'undefined'){
				cpBenefit[tempCurr] = 0;
			}
			var tempBank = cpData[session].winbank;
			if (typeof cpBenefit[tempBank] === 'undefined'){
				cpBenefit[tempBank] = 0;
			}
			var tempBenefit = cpData[session].benefit / 100
			cpBenefit[tempCurr] += tempBenefit;
			cpBenefit[tempBank] += tempBenefit;
			count += 1;
		}
		else {
		console.log(cpData[session].id);
		elseCount += 1;
		}
	};
	console.log(cpData);
	console.log(cpBenefit)
	console.log(count);
	console.log(elseCount);
	for (var x in cpBenefit){
		console.log(x + ": " + cpBenefit[x]);
	}
};