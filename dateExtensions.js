var MSPERDAY = 86400000;
Date.prototype.daysInMthArray =	[0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Date.prototype.monthsArray=["","January","February","March","April","May","June","July","August","September","October","November","December"];
Date.prototype.daysArray=["","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

//extensions to core Javascript objects
Date.prototype.roundMinutes = function(rm,rp,newdate){
	var m=this.getMinutes();
	var dtms=this.getTime();
	if ( rm && rp ){
		if (( 60 % rp ) == 0 )
			switch (rm){
				case "up":
					dtms = dtms + ( (m%rp)==0 ? 0: (rp-(m%rp)) * 60*1000  );
					break;
				case "down":
					dtms = dtms - ((m%rp)*60*1000);
					break;
				case "auto":
					if (  (rp-(m%rp))<(m%rp) )
						dtms = dtms + ( (m%rp)==0 ? 0: (rp-(m%rp)) * 60*1000  );
					else
						dtms = dtms - ((m%rp)*60*1000);
					break;
			}		
		if (newdate) return new Date(dtms);
		else this.setTime(dtms);
	}
}

Date.prototype.formatTime = function(fmt){ // format, unit to be rounded (h or m), method (up,down,auto), period (15, 20, etc.)
	var m=this.getMinutes();
	var h=this.getHours();	
	if ( h > 12 ){ h = (h-12); var hs = "PM"; }
	else if ( h==12) var hs="PM";		
	else{ h = h; var hs= "AM"; }
	(m==0)?m="00":'';
	(h==0)?h="12":'';
	switch (fmt){
		case "d":
			return h + ":" + m + " " + hs;
	}
}

Date.prototype.format = function(fmt){
	if (!fmt) { log('no fmt provided'); return null; }
	if (fmt=='utc') return this.getTime();
	if (fmt=='age') return this.age();	
	//log(fmt);
	var fmtArray = fmt.match( /F|m|M|d|l|Y|a|A|g|G|h|H|i|[^a-zA-Z]/ig );
	var str = new Array();
	//if ( this.getHours() == 0 && this.getMinutes() == 0) var hideTime
	var this_ = this;
	for(var i=0; i<fmtArray.length; i++){
		var c=fmtArray[i];
		switch (c) {
			case "F": //full month name
				str.push( this_.monthsArray[1+this_.getMonth()] );
				break;
			case "m": // Month number with zero prefix
				var mth = this_.getMonth()+1;
				if  (mth <10 ) mth = "0" + mth.toString();
				str.push(mth);
				break;
			case "M": // 3 letter month
				str.push( this_.monthsArray[1+this_.getMonth()].substr(0,3) );
				break;
			case "n": // Month number without zero prefix
				str.push(this_.getMonth()+1);
				break;
			case "d": // Day of month with zero prefix
				var d = this_.getDate();
				if (d<10)d="0"+d.toString();
				str.push(d);
				break;
			case "j": // Day of month without zero prefix
				str.push(this_.getDate());
				break;
			case "l": // Day of week name
				str.push( this_.daysArray[1+this_.getDay()] );
				break;
			case "Y": // Full Year
				str.push( this_.getFullYear() );
				break;
			case "Time":
				str.push( this_.formatTime("d") );
				break;
			case "g": //12hour format of hour without leading zero
				var h = this_.getHours();
				if ( h > 12 ) h = (h-12);
				if (h==0) h=12;
				str.push(h);
				break;
			case "G": //24 hour format of hour without leading zero
				str.push( this_.getHours() );
				break;
			case "h": //12 hour format of hour with leading zero
				var h = this_.getHours();
				//log('h is: ' + h);
				if (h>12) h = (h-12);
				if (h<10 && h!=0) h="0"+h.toString();
				//else h=12;
				str.push(h);
				break;
			case "H": //24 hour format of hour with leading zero
				var h = this_.getHours();
				if (h<10) h="0"+h.toString();
				str.push(h);
				break;
			case "i": //2 digit minutes
				var m = this_.getMinutes();
				if (m<10)m="0"+m.toString();
				str.push(m);
				break;
			case "a": //am or pm
				var a;
				( this_.getHours()>=12 )? a="pm":a="am";
				str.push(a);
				break;
			case "A": //AM or PM
				var a;
				( this_.getHours()>=12 )? a="PM": a="AM";
				str.push(a);
				break;
			default:
				str.push(c);
				break;
		}
	}
	return str.join("");
}

Date.prototype.age = function(){
	return Math.round( (  (new Date()).getTime() - this.getTime() ) * (1/365) * (1/MSPERDAY) ) ; 
}

Date.prototype.topOfHour= function(){
	return new Date(this.getTime() - ( 60*1000*this.getMinutes() + 1000*this.getSeconds() + this.getMilliseconds() ));
}

Date.prototype.topOfDay = function(){
	var d=(new Date(this.topOfHour()));
	return new Date(d.getTime()-(60*60*1000*d.getHours()));
}
Date.prototype.nextDay = function(){
	return new Date(this.topOfDay().getTime()+MSPERDAY);
}

Date.prototype.getNumOfDaysThisMonth = function(){
	var d = this.daysInMthArray[1+this.getMonth()];
	if (d==28 && ( this.getYear()%4 )==0 ) d==29;
	return d;
}

Date.prototype.getMonthStartEnd = function(){ //returns a date range with 1st and last day of month
	var stDt = new Date( this.getFullYear(), this.getMonth(), 1);
	var endDt = new Date( this.getFullYear(), this.getMonth(), this.getNumOfDaysThisMonth()); 
	return ( new DateRange( stDt, endDt) );
}

Date.prototype.getWeekStartEnd= function(){ //returns a date range with 1st and last day of month
	var stDt = new Date( this.getFullYear(), this.getMonth(), (this.getDate()-this.getDay()));
	var endDt = new Date( this.getFullYear(), this.getMonth(), (this.getDate()-this.getDay())+7);
	return ( new DateRange( stDt, endDt) );
}


Date.prototype.getSameDayNextMonth = function(){
	var dayOfMonth = this.getDate();
	var mth = this.getMonth();
	var yr = this.getFullYear();
	
	if (mth==11){ mth=0; yr++; }
	else mth++;
	
	if ( dayOfMonth > this.daysInMthArray[mth+1] ) dayOfMonth=this.daysInMthArray[mth+1];
	return new Date( yr, mth, dayOfMonth);
}


Date.prototype.addMinutes = function(min){
	return new Date(this.getTime() + (min * 60000));
}




/******************

DateRange

*******************/

function DateRange(startDt, endDt){
	if (startDt) this.startDt = startDt;
	else this.startDt = new Date();
	if (endDt) this.endDt = endDt;
	else this.endDt = new Date();
}

DateRange.prototype.getNumOfDaysInclusive = function (){
	return ((this.endDt.getTime() - this.startDt.getTime()) / MSPERDAY ) + 1 ;
}

DateRange.prototype.diff = function(){
	return (this.endDt.getTime() - this.startDt.getTime());
}

DateRange.prototype.getNumOfWeekdaysInclusive = function (){
	if ( arguments.length == 2){
		var numOfDaysInc = ((( arguments[1].getTime() - arguments[0].getTime() ) / MSPERDAY ) + 1);
		var startDay = arguments[0].getDay();
		var endDay = arguments[1].getDay();
		//alert(numOfDaysInc);
	}
	else{
		var startDay = this.startDt.getDay();
		var endDay = this.endDt.getDay();
		var numOfDaysInc = this.getNumOfDaysInclusive();
	}
	
	if (numOfDaysInc==7) return 5;
	if (numOfDaysInc==1){
		if ((startDay==0)||(startDay==6)) return 0;
		else return 1;
	}
	if ((numOfDaysInc<7) && (numOfDaysInc>1)){
		if (startDay<=endDay ){
			if (endDay!=6 && startDay!=0) return ( endDay - startDay + 1);
			if ( (endDay!=6 && startDay==0) || (endDay==6  && startDay!=0) ) return (endDay - startDay);
		}
		else{
			var invStartDay = ( 7 - startDay)*(-1);
			return ( (endDay - invStartDay) - 1); 
		}					
	}
	if (numOfDaysInc>7){
		var excessDays = (numOfDaysInc % 7);
		if (  Math.round( (numOfDaysInc/7 )) > (numOfDaysInc/7)) var numOfWeeks =  Math.round( (numOfDaysInc / 7) ) - 1;
		else var numOfWeeks = Math.round( (numOfDaysInc / 7));
		if (excessDays > 0){
			excessStart	= new Date( this.endDt.getTime() - ( excessDays * MSPERDAY) + MSPERDAY);
			excessWeekdays = this.getNumOfWeekdaysInclusive( excessStart, this.endDt);
		}
		else excessWeekdays=0;
		return (( numOfWeeks * 5 ) + excessWeekdays);
	}	
}

DateRange.prototype.getPositionFor = function ( dt ){ //returns the position of dt is relative to range
//assumes time of 00:00:00 - dates being used must not contain any other time than this
	if ( dt.getTime() > this.endDt ) return "a"; //after
	else if ( dt.getTime() < this.startDt ) return "b"; //before
	else return "w"; //within
}

DateRange.prototype.getOverlapFor = function ( dtRng ){ //takes a daterange object, returns a daterange of the overlapping period if any, else returns null
	var startPos = this.getPositionFor( dtRng.startDt );
	var endPos = this.getPositionFor( dtRng.endDt );
	
	if ( startPos == "a" && endPos == "a" ) return null;
	if ( startPos == "b" && endPos == "b" ) return null;
	if ( startPos == "w" && endPos == "w" ) return dtRng;
	if ( startPos == "b" && endPos == "a" ) return this;
	if ( startPos == "w" && endPos == "a" ) return new DateRange( dtRng.startDt, this.endDt );
	if ( startPos == "b" && endPos == "w" ) return new DateRange( this.startDt,  dtRng.endDt);

}


DateRange.prototype.overlapsWith = function ( dtRng ){ //takes a daterange object, returns a daterange of the overlapping period if any, else returns null
	return (  this.getOverlapFor( dtRng ) );
}

DateRange.prototype.getArrayOfNthDayOfMonths = function(dayOfMonth){
	var mArray = new Array();
	if ( !dayOfMonth ) dayOfMonth = this.startDt.getDate();
	
	if ( dayOfMonth > this.startDt.getNumOfDaysThisMonth() ) var dayOfFirstMonth = this.startDt.getNumOfDaysThisMonth();
	else var dayOfFirstMonth = dayOfMonth;
	
	if ( dayOfMonth > this.endDt.getNumOfDaysThisMonth() ) var dayOfLastMonth = this.endDt.getNumOfDaysThisMonth();
	else var dayOfLastMonth = dayOfMonth;
	
	var dt = new Date(this.startDt.getFullYear(), this.startDt.getMonth(), dayOfFirstMonth );
	var lastdt = new Date(this.endDt.getFullYear(), this.endDt.getMonth(), dayOfLastMonth );
		
	mArray.push( dt );
	while ( dt ){
		dt = dt.getSameDayNextMonth();
		if ( dt.getTime() < lastdt.getTime() ) mArray.push(dt);
		else dt=null;
	}
	mArray.push ( lastdt );
	return mArray;
}

Array.prototype.deleteAt = function (i){return this.splice(i, 1); }
Array.prototype.insertAt = function (i,el){ return this.splice(i,0,el); }
