import axios from "axios";

var API_BASE = function() {
  if(window.location.hostname === "localhost") {
    return "http://localhost:5000/";
  } else {
    return "/"
  }
}

export const checkUserExists = async (user) => {
  var res = await axios.get(API_BASE() + "user", {params: {username: user}})
    .then(resp => {
      // user was found
      return {
        status: "okay",
        username: resp.data.username,
        id: resp.data.id
      }
    }).catch(err => {
      if(err.response.status === 404) {
        console.log("error, user not found");
        // user was not found
        return {
          status: "error",
          reason: "User could not be found"
        }
      }
    });
  console.log(res);
  return res;
}