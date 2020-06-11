var daysbtn = $("#opendays button");
var days = {
	SUN:false,
	MON:false,
	TUE:false,
	WED:false,
	THU:false,
	FRI:false,
	SAT:false
}

$("#days").val(JSON.stringify(days));
daysbtn.click(function(btn) {
	$(this).toggleClass("btn-secondary btn-success");
	if($(this).hasClass('btn-success')){
		days[$(this).text()] = true;
	};
	$("#days").val(JSON.stringify(days));
});

