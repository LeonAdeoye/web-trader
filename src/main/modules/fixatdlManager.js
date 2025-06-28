const fs = require('fs');
const path = require('path');

let xmlFiles = [];

const getAllFIXATDLContent = () => {
    return xmlFiles;
};

const readFIXATDLFiles = async () => {
    const strategiesFolder = path.join(__dirname, "../../strategies");
    try
    {
        const files = fs.readdirSync(strategiesFolder).filter(file => file.endsWith(".xml"));
        console.log(`Found ${files.length} ATDL XML files in the strategies folder: ${path.join(__dirname, "../../strategies")}`);

        files.forEach(file =>
        {
            const filePath = path.join(strategiesFolder, file);
            const xmlContent = fs.readFileSync(filePath, "utf8");
            xmlFiles.push(xmlContent);
        });

    }
    catch (err)
    {
        console.error("Error reading strategies folder:", err);
    }

    return xmlFiles
};

module.exports = {
    readFIXATDLFiles,
    getAllFIXATDLContent
}; 
