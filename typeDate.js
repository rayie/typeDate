/* TYPE DATE INSERT */

/**
 * @author raymond ie
 * Copyright (c) 2007 Raymond Ie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 **/

var MSPERDAY = 86400000;
var TypeDate = {
	Today:		function(){ return new Date(); },
	matchArray:	null,
	daysInMthArray:	[0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	daysArray:		["","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
	monthsArray:	["","January","February","March","April","May","June","July","August","September","October","November","December"],
	ttyExpHash:		{tod:"today",tom:"tomorrow",yest:"yesterday"},	
	pfixExpHash:	{nex:"next",las:"last",past:"last",first:"first",second:"second",third:"third",fourth:"fourth"},
	daysExpHash:	{sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday"},
	monthsExpHash:	{jan:"January",feb:"February",mar:"March",apr:"April",may:"May",jun:"June",jul:"July", aug:"August",sep:"September",oct:"October",nov:"November",dec:"December"},
	periodExpHash:	{week:"week",wk:"week",day:"day"}, //day must come last
	prepExpHash:	{from:"after",after:"after",before:"before",ago:"before"},
	holidayExpHash:	{xmas:"12-25",christmas:"12-25"},
	alertMsg:		null,
	monthsLU:		{"January":1,"February":2,"March":3,"April":4,"May":5,"June":6,"July":7,"August":8,"September":9,"October":10,"November":11,"December":12},
	daysLU:			{"Sunday":1,"Monday":2,"Tuesday":3,"Wednesday":4,"Thursday":5,"Friday":6,"Saturday":7}
}

TypeDate.findMatch = function ( str, hashObject, flags ) {
	var termFound=null;
	/*
	$H(hashObject).find( function(pair){
		var re = new RegExp(pair.key, flags);	
		if (TypeDate.matchArray=str.match(re)){
			termFound = pair.value;
			return true;
		}
	});
	*/
	$j.each( hashObject, function(k,v){
		var re = new RegExp(k, flags);
		if (termFound==null){
		if (TypeDate.matchArray=str.match(re)){
			termFound = v;
		}
		}
	});
	return termFound;
}

//return either 0 or 1 or false, to indicate which is the year, the first num or 2nd num
TypeDate.findYearInDayOrYear = function (a, b, fmt){ //in order of appearance in the user's string
	for (var i=0;i<2;i++){
		if (arguments[i].toString().length == 4)return i;		
		if (arguments[i] > 31)return i;
	}
	if (fmt.toString().substr(0,1) == "y") return 0;
	else return 1;
}

TypeDate.findMonthInDayOrMonth = function(a, b, fmt){ //in order of appearance in the user's string		
	if ( arguments[0] > 12 ) return 1;
	if ( arguments[1] > 12 ) return 0;
	fmt = fmt.replace(/y/, "");
	if (fmt.toString().substr(0,1) == "m") return 0;
	else return 1;
}

TypeDate.getDate = function ( dString ){
	var dateFound = null;
	var numFound=null;
	var dayOfMth=null;
	var yearFound=null;
	var mthFound=null;
	var dayFound=null;
	var mthNum=null;
	var ttyFound=null;
	var pfixFound=null;
	var firstNumFound=null;
	var secondNumFound=null;
	var yearCell=null;
	var monthCell=null;
	var periodInMS=0;
	var hourFound = 0;
	var minuteFound = 0;
	var isAM = true;
	var clearTime = true;
	var today = new Date();
	if ( arguments.length ==1) var opts = { time: false, fmt:'mdy'};
	else opts = arguments[1];
	
	if ( opts["time"] ) var todayInMS = today.getTime();
	else {
		today.setHours(0,0,0,0);
		var todayInMS = today.getTime();
	}
	
	if ( (opts["time"]) && (TypeDate.timeStr = dString.match(/\d{1,2}\s?[pa].?m?.?|\d{1,2}:\d{1,2}\s?[pa].?m?.?|\d{1,2}:\d{1,2}|\d{3,4}\s?[pa].?m?.?/i) ) ){
		dString = dString.slice( 0, dString.indexOf(TypeDate.timeStr[0]) ) + dString.slice( dString.indexOf(TypeDate.timeStr[0])+ TypeDate.timeStr[0].length, 20);
		var tArray=TypeDate.timeStr[0].match(/\d{1,2}(?=:)|\d{1,2}|[ap]\.?m?\.?/ig);
		if (( tArray[0].length==2 && tArray[1].length == 1 ) && ( !isNaN(tArray[0]) ) && ( !isNaN(tArray[1]) )) {
			tArray[1]= tArray[0].substr(1,1) + tArray[1];
			tArray[0]= tArray[0].substr(0,1);
		}
		if ( tArray[0].length==2 ){
			if ( tArray[0].substr(0,1) == "0" ) tArray[0] = tArray[0].substr(1,1);
		}
		
		if ( !isNaN( tArray[1] )  ) 
			if ( tArray[1].length==2 ){
				if ( tArray[1].substr(0,1) == "0" ) tArray[1] = tArray[1].substr(1,1);
		}
		if ( parseInt(tArray[1])<=60 ) minuteFound = parseInt(tArray[1]);
		else tArray[1].substr(0,1) == "p" ? isAM = false : isAM;
		
		if ( tArray.length > 2) tArray[2].substr(0,1) == "p" ? isAM = false : isAM;
		
		if ( parseInt(tArray[0]) >= 12 && parseInt(tArray[0]) < 24 ){ 
			hourFound = parseInt(tArray[0]);
		}
		else{ 
			isAM ? hourFound=parseInt(tArray[0]) : hourFound = ( parseInt(tArray[0]) + 12 );
		}

		if (hourFound==12 && isAM) hourFound=0;
		(hourFound > 23) ? hourFound=null:hourFound;		
		(hourFound && !minuteFound) ? minuteFound=0:minuteFound;
	}
	
	if ( TypeDate.prep = TypeDate.findMatch( dString, TypeDate.prepExpHash ,"i") ) {
		var prepStrMatch = TypeDate.matchArray[0];
		if  (TypeDate.periodFound = TypeDate.findMatch(dString, TypeDate.periodExpHash , "i") ) { 
			var periodStrMatch = TypeDate.matchArray[0];
			
		//get the number before the period
			periodMultiplierStr =  dString.slice( 0, dString.indexOf( periodStrMatch ) );
			var periodMultiplier = periodMultiplierStr.match(/\d{1,5}/);   
			if (!periodMultiplier) periodMultiplier=1; 
			else periodMultiplier = parseInt(periodMultiplier);
			
			posToBeginSlice = prepStrMatch.length + periodStrMatch.length + periodMultiplierStr.length;
			dString = dString.slice(posToBeginSlice);
					
			switch (TypeDate.periodFound) {
				case "day":
					periodInMS = periodMultiplier * ( MSPERDAY );
					break;
				case "week":
					periodInMS = periodMultiplier * ( 7 ) * ( MSPERDAY );
					break;
			}
			
			switch (TypeDate.prep){
				case "before":
					periodInMS = periodInMS * (-1);
			}
		}
	}// end of prep search
	
	if ( numFound=dString.match(/\d{1,4}/g) ){
		for (var i=0;i<numFound.length;i++){
			if (numFound[i].length == 4) yearCell=i;
			if (numFound[i].toString().substr(0,1) == "0" ) numFound[i] = parseInt( numFound[i].toString().substr(1,1) );
			else numFound[i] = parseInt( numFound[i] );
		}
		
		if (numFound.length==3){
			if (yearCell==null){
				if ( opts["fmt"].toString().substr(0,1) == "y") yearCell=0;
				else yearCell=(numFound.length-1);
			}
			yearFound = numFound[yearCell];
			var holdArray = numFound.slice(0,3);
			holdArray.splice(yearCell,1);
			monthCell=TypeDate.findMonthInDayOrMonth( holdArray[0], holdArray[1], opts["fmt"]);
			if (monthCell==0){
				mthNum = holdArray[0];
				dayOfMth = holdArray[1];
			}
			else{
				mthNum = holdArray[1];
				dayOfMth = holdArray[0];
			}
		}
		else mthFound = TypeDate.findMatch(dString, TypeDate.monthsExpHash, "ig" );
		
		if (mthFound){
			if ( numFound.length==2){
				if (yearCell==null) yearCell=TypeDate.findYearInDayOrYear( numFound[0], numFound[1], opts["fmt"]);	
		
				if (yearCell==0){
					yearFound = numFound[0];
					dayOfMth = numFound[1];
				}
				else{
					yearFound = numFound[1];
					dayOfMth = numFound[0];
				}
			}
			if ( numFound.length==1){
				yearFound = 2011;
				dayOfMth=numFound[0];
			}
			mthNum = TypeDate.monthsLU[mthFound];
			//mthNum = TypeDate.monthsArray.indexOf(mthFound);
			
		}
		else if ((numFound.length==2) && (!mthFound)){
			yearFound = 2011;
			monthCell=TypeDate.findMonthInDayOrMonth( numFound[0], numFound[1], opts["fmt"]);
			if (monthCell==0){
				mthNum = numFound[0];
				dayOfMth = numFound[1];
			}
			else{
				mthNum = numFound[1];
				dayOfMth = numFound[0];
			}
		}
		
		if ( yearFound != null){
			if (yearFound.toString().length == 3) yearFound=null;
			else{
				if (yearFound.toString().length!=4){
					if (yearFound<50) yearFound=yearFound+2000;
					else yearFound=yearFound+1900;
				}
				if ((yearFound % 4)==0) TypeDate.daysInMthArray[2]=29; 
			}
		}
		
		if (dayOfMth==1+TypeDate.daysInMthArray[mthNum]){
			dayOfMth = dayOfMth - 1;
			TypeDate.alertMsg="There are only " + TypeDate.daysInMthArray[mthNum] + " days in " + TypeDate.monthsArray[mthNum];
		}
	
		if (dayOfMth>1+TypeDate.daysInMthArray[mthNum]) dayOfMth = null;
	
		if ( (yearFound) && (mthNum) && (dayOfMth) ) dateFound = new Date(yearFound, mthNum-1, dayOfMth);	
	} //end of numbers match

	if (!dateFound){
		if (ttyFound = dString.match(/now/ig) ){
			dateFound = new Date();
			clearTime = false;
		}
		else{
			ttyFound = TypeDate.findMatch(dString, TypeDate.ttyExpHash , "ig");
			if (ttyFound) {
				switch (ttyFound) {
					case "today":
						dateFound = new Date(todayInMS);
						break;	
					case "tomorrow":
						dateFound = new Date(todayInMS + ( MSPERDAY ));
						break;
					case "yesterday":
						dateFound = new Date(todayInMS - ( MSPERDAY ));
						break;
				}
			}
		}
	}
	
	if ( !dateFound ){
		dayFound = TypeDate.findMatch(dString, TypeDate.daysExpHash ,"ig");
		if (dayFound) {
			var dayNum = TypeDate.daysLU[dayFound];
			var todayNum = TypeDate.Today().getDay() + 1;
			var daysToSubtract = todayNum - dayNum;
			dateFound = new Date( todayInMS - daysToSubtract *( MSPERDAY ));
			pfixFound = TypeDate.findMatch(dString, TypeDate.pfixExpHash , "ig");
			//alert(TypeDate.matchArray.length);
			if (pfixFound) {
				switch (pfixFound) {
					case "next":
						dateFound = new Date( (dateFound.getTime()) + (7 * TypeDate.matchArray.length * ( MSPERDAY ) ));
						break;	
					case "last":
						dateFound = new Date( (dateFound.getTime()) - (7 * TypeDate.matchArray.length * ( MSPERDAY ) ));
						break;
				}
			}
		}
	}
	
	if ((periodInMS!=0) && (dateFound)) dateFound = new Date( (dateFound.getTime()) + periodInMS);
	if (dateFound && clearTime) dateFound.setHours(hourFound, minuteFound,0,0);
	return dateFound;
}

TypeDate.set = function ( opts ){

	var el = $j(opts.observe); //the element to listen on
	var display=$j(opts.display); //the element to display in 
	var output=$j(opts.output); //form element field to place the date result

	var range=opts.range;
	var time=opts.time;
	var fmt=opts.fmt;
	var displayformat=opts.displayformat;
	var outputformat=opts.outputformat;
	var val=null;
	
	// var earliest=null;
	// var latest=null;
	// var cal=null;
	// var disamb=null;
	
	if ( !displayformat ){
		if (time) displayformat="l g:i a, F d, Y";
		else displayformat="l F d, Y";
	} 
	
	function srch(){
		var value=el.val();
		var clr = value.search(/clear|clr/i);
		if (clr != -1){
			el.val('');
			//$(opts["display"]).fadeOut();
			display.html(TypeDate.onNotFoundDisplay);
			el.data('isValid',false);	
			el.data('theDate',null);	
		}else{
			var splitOn = value.search(/ to | until | till | til /i);
			if (splitOn != -1 && range ){
				var startDate = TypeDate.getDate( value.substr(0, splitOn), {time:time, fmt:fmt} );
				var endDate = TypeDate.getDate( value.substr( (splitOn+4), (value.length - (splitOn+4) ) ), {time:time, fmt:fmt} );
				if ( startDate && endDate){
					var outstr = startDate.format(displayformat) + " to " + endDate.format(displayformat);
					var dr = new DateRange(startDate, endDate);
					
					if ( opts["countdays"] ) 
						outstr += "<br>" + dr.getNumOfDaysInclusive() + " days in your range.";
					if (opts["countwdays"])
						outstr +="<br>" + dr.getNumOfWeekdaysInclusive() + " weekdays in your range.";					
					display.text(outstr);
				}
				else display.text("");
			}
			else{
				var singleDate = TypeDate.getDate(value, {time:time, fmt:fmt} );

				if (singleDate){
					el.data('isValid',true);	
					el.data('theDate',singleDate);	
					display.text( singleDate.format(displayformat) );
					if ( output.length ) {
						output.val( singleDate.format(outputformat) );
						output.val( singleDate.format(outputformat) );
					}
					if (TypeDate.onFoundDate) TypeDate.onFoundDate();
				}
				else {
					$j(el).data('isValid',false);
					display.html(TypeDate.onNotFoundDisplay);
					if (output){ 
						//output.show();
						output.val('');
					}
					if (TypeDate.onNotFoundDate) TypeDate.onFoundDate();
				}
			}
		}
		if ($j.trim( el.val() ) != "") {
			display.hide();
			display.show();
		}
	}

	//turn on the listener	
	el.bind('keyup', srch);
}

TypeDate.onNotFoundDisplay = "Please enter a valid date";

TypeDate.enableTypeDate = function ( opts,  context ) {

	var displayformat = opts.displayformat;
	var outputformat = opts.outputformat;
	var time = opts.time;
	var range = opts.range;
	var fmt = opts.fmt;

	$j('.dateInput', context).each( function(k,v){
		var forName = $j(v).attr('forff');
		var display = $j('[forff=' + forName + '].dateDisplay', context);
		var output = $j('[ff=' + forName + ']', context);
		
		TypeDate.set({ 
			observe: $j(v), display: $j(display), output: $j(output), 
			time: false, range: false, displayformat: displayformat, 
			outputformat: outputformat, fmt: fmt
		});
		$j(v).trigger('keyup');
	});

}
	




TypeDate.enableTypeDateOld = function (className, outputFmt, displayFmt, displayClass, context){
	if (!outputFmt) outputFmt="m/d/Y";
	if (!displayFmt) displayFmt="F d, Y";
	if (displayClass) displayClass=" class='" + displayClass + "' "; else displayClass="";
	if (!context) var context='';
	$j(context + '.'+className).each( function(){
		if ($j('#'+this.id + "_input").length) return null;
		var htmlToInsert = "<input type='text' id='" + this.id + "_input'/> <span  class='"+ displayClass +"' id='" + this.id + "_display'></span>";
		$j(this).after(htmlToInsert).hide();	  
		if ($j(this).attr('displayFmt')) displayFmt=$j(this).attr('displayFmt');  
		TypeDate.set(
			"observe=" + context + "#" + this.id + "_input",
			"fmt=mdy",
			"display=" + context + "#" + this.id + "_display", 
			"output="+ context + "#" + this.id, 
			"outputformat="+outputFmt,
			"displayformat="+displayFmt, 
			"time"
		);
		if ( $j(this).val() ) $j(context + '#'+this.id + "_input").val($j(this).val()).trigger('keyup');
		//log('enabled ' + context + this.id + ' ' + $(this).val());  
	});
	
}

TypeDate.parseDates = function (className, displayFmt){ //takes date values and displays them as display Fmt
	if (!displayFmt) displayFmt="F d, Y";
	$j('.'+className).text( TypeDate.getDate( el.innerHTML ).format(displayFmt) );
}

TypeDate.onFoundDate = null;
TypeDate.onNotFoundDate = null;
TypeDate.validate = function(){
	//pass in csv of strings or an array of string, get back an array of those strings as dates (if valid), else null
	if (typeof arguments[0]=='string') return $j.map(arguments , function(str,i){ return TypeDate.getDate(str); })
	else return $j.map(arguments[0] , function(str,i){ return TypeDate.getDate(str); })
}

