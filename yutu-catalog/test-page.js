const http = require("http");
http.get("http://localhost:3010/c/6e230750-b707-4946-8a40-df642317f3f3", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("HERO:", data.includes("查看图册"));
    console.log("PRODUCT:", data.includes("2605-0022"));
    console.log("NOT-FOUND:", data.includes("图册不存在"));
  });
}).on("error", (e) => console.error(e.message));
