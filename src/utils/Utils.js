export async function fetch_data(method, url, data, type) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		xhr.setRequestHeader('X-Maya-With', 'allow');
		xhr.setRequestHeader('Accept-Language', 'heb-IL');
		xhr.setRequestHeader('Content-Type', type);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
				// console.log(xhr.responseText);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText,
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText,
			});
		};
		xhr.send(data);
	});
}
