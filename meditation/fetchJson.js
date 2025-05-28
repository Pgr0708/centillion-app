const fs = require("fs");
const path = require("path");

const fetchDataFromJson = (req, res, next) => {
  const filePath = path.join(__dirname, "jsonFile.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read JSON file" });
    }

    try {
      const json = JSON.parse(data);
      req.jsonData = json;
      next(); 
    } catch (parseErr) {
      res.status(500).json({ message: "Failed to parse JSON data" });
    }
  });
};

module.exports = { fetchDataFromJson };
