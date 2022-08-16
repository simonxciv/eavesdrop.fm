// basic helper to check for error responses
const statusCheck = (response: Response) => {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
};

export default statusCheck;
