import axios from "axios";
const instance = axios.create({
  baseURL: "http://18.224.59.40:5000",
  timeout: 5000,

  withCredentials: true,
});

export default instance;
