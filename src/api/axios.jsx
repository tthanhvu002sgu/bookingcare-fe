import axios from "axios";

export default axios.create({
    baseURL: 'http://localhost:8083'
});

// export const getAuthToken = () => {
//   return window.localStorage.getItem("jwtToken")
// };

// export const setAuthToken = (token) => {
//   window.localStorage.setItem("jwtToken", token)
// };

// export const request = (method, url, data) => {
//   let headers = {};
//   if(getAuthToken() != null && getAuthToken() != null){
//     headers = {"Authorization": `Bearer ${getAuthToken()}`};
//   }

//   return axios.request({
//     method: method,
//     headers: headers,
//     url: url,
//     data: data
//   })
// }