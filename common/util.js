exports.getCurrentDateTime = () => {

	var date = new Date().getTime();
	date += (9 * 60 * 60 * 1000);
	// console.log(new Date(date).toUTCString());
	return new Date(date).toUTCString();
}

