export const API_BASE = function() {
  if(window.location.hostname === "localhost") {
    return "http://localhost:5000/api/";
  } else {
    return "/api/"
  }
}