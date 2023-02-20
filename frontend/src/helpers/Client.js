import axios from "axios";
export default class Client {
	static instance;

	constructor() {
		if (Client.instance) {
			return Client.instance;
		}
		Client.instance = this;
	}

	createUrl({ url, method, body = {}, headers = {} }) {
		if (!this.token) {
			this.token = null;
		}
		const tokenHeader = {
			authorization: `Bearer ${this.token}`,
		};
		return axios({
			method: method,
			url: url,
			data: body,
			headers: { ...tokenHeader, ...headers },
		});
	}

	setToken(token) {
		this.token = token;
	}
}
