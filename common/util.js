exports.getCurrentDateTime = () => {

	var date = new Date().getTime();
	// console.log(new Date(date).toUTCString());
	return new Date(date).toUTCString();
}

