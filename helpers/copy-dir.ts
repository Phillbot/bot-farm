const fs = require('fs');
const path = require('path');

const sourceFolderPath = path.join(
  __dirname,
  '../src/telegram/nbu-rate-bot/locales',
);
const destinationFolderPath = path.join(
  __dirname,
  '../dist/telegram/nbu-rate-bot/locales',
);

fs.cp(sourceFolderPath, destinationFolderPath, { recursive: true }, (error) => {
  if (error) {
    console.log(error.message);
    throw error;
  }

  console.log('The source folder copied successfully to the destination');
});
