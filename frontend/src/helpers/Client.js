import axios from "axios";

export default class Client {
    static instance;

    constructor() {
        if (Client.instance) {
            return Client.instance;
        }
        Client.instance = this;
    }

    createUrl({ url, method, body = {}, headers = {}, service }) {
        if (!this.token) {
            this.token = null;
        }

        const tokenHeader = {
            authorization: `Bearer ${this.token}`,
        };

        if (service === "auth") {
            url = `${process.env.AUTH_URL || "http://localhost:3000/"}${url}`;
        } else if (service === "allocate") {
            url = `${process.env.ALLOCATE_URL || "http://localhost:8000/"}${url}`;
        }

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
