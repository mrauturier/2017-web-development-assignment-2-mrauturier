function decode() {
	var code = document.getElementById("inputCode").value;
	var date;
	var ref;

	if (code.length!=54)
	{
		console.log(code.length);
		document.getElementById("inputCode").value = "error with the code, please enter a new one";
	}
	else {

		//IBAN
		document.getElementById("iban").innerHTML = code.slice(1,3) + " " + code.slice(3,7) + " " + code.slice(7,11) 
													+ " " + code.slice(11,15) + " " + code.slice(15,17);

		//Amount
		document.getElementById("amount").innerHTML = parseInt(code.slice(17,23)) + "." + code.slice(23,25) + " €";

		//Reference
		if (code[0] == 5){
			ref = "RF" + code.slice(25,27) + parseInt(code.slice(27,48))
		}else if (code[0] == 4){
			ref = parseInt(code.slice(25,48));
		}

		document.getElementById("ref").innerHTML = ref;

		//Date
		if (code.slice(52,54) == '00' || code.slice(50,52) =='00'|| code.slice(48,50) == '00'){ //if not date or partial date
			date = "None";
		}else{
			date = code.slice(52,54) + "." + code.slice(50,52) + ".20" + code.slice(48,50);
		}
		document.getElementById("date").innerHTML = date;

		JsBarcode("#barcode", code, {
			displayValue: false
		});
	}
}

function changeGrey() {
	var inputVal = document.getElementById("inputCode");
	inputVal.style.backgroundColor = "lightgrey";
}

function changeWhite() {
	var inputVal = document.getElementById("inputCode");
	inputVal.style.backgroundColor = "";
}