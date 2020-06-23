var daysbtn = $("#opendays button");
console.log()
var days = JSON.parse($("#days").val());
console.log(days);

for(let day in days){
	if(days[day]==true)
	{
		$(`#${day}`).toggleClass('btn-secondary btn-success');
	}
}

daysbtn.click(function(btn) {
	$(this).toggleClass("btn-secondary btn-success");
	if($(this).hasClass('btn-success')){
		days[$(this).text()] = true;
	}
	else{
		days[$(this).text()] = false;
	}
	$("#days").val(JSON.stringify(days));
});

