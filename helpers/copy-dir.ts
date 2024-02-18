const fs = require('fs');
const path = require('path');

// 👇️ if you use CommonJS require() syntax
// const fs = require('fs');

const sourceFolderPath = path.join(
  __dirname,
  '../src/telegram/nbu-rate/locales',
);
const destinationFolderPath = path.join(
  __dirname,
  '../dist/telegram/nbu-rate/locales',
);

fs.cp(sourceFolderPath, destinationFolderPath, { recursive: true }, (error) => {
  if (error) {
    console.log(error.message);
    throw error;
  }

  console.log('The source folder copied successfully to the destination');
});
