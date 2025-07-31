import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api/v1", // 백엔드 주소
  withCredentials: false, // 필요시 쿠키 전송
});

export default instance;