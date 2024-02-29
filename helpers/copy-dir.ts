const fs = require('fs');
const path = require('path');

const sourceFolderPath = path.join(__dirname, '../src/telegram/common/locales');
const destinationFolderPath = path.join(__dirname, '../dist/telegram/common/locales');

fs.cp(sourceFolderPath, destinationFolderPath, { recursive: true }, (error) => {
  if (error) {
    console.log(error.message);
    throw error;
  }
});
