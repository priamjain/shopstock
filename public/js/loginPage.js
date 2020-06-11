var btns = $("#loginform a");
var signupBox = $("#osignup");
var loginBox = $("#ologin");
// console.log(btns);


$(function(){
		btns.click(function(){
			signupBox.addClass('d-none');
			loginBox.addClass('d-none');
			btns.removeClass('text-success bor-bot');
			if($(this).text()=="Login")
			{
				loginBox.removeClass('d-none');
			}
			else{
				signupBox.removeClass('d-none');
			}
			$(this).addClass('text-success bor-bot');
		});
	});

$(".pass").change(function() {
	if($("#conpass").val()!==$("#signuppass").val()){
		$("#conpass").addClass('box-wrong');
		$("#wrongpass").removeClass('d-none');

	}
	else{
		$("#wrongpass").addClass('d-none');
		$("#conpass").removeClass('box-wrong');
	}
	
});

// for(var i=0;i<btns.length;i++)
// {
// 	btns[i].addEventListener("click",function(){
// 			signupBox.classList.toggle("d-none");
// 			loginBox.classList.toggle("d-none");
			
// 	});
// };