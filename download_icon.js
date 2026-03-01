import fs from 'fs';
import https from 'https';
import path from 'path';

const url = "https://cdn-icons-png.flaticon.com/512/3659/3659784.png";
const dest = path.join(process.cwd(), 'public', 'radio.png');

if (!fs.existsSync(path.dirname(dest))) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
}

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log("Download complete");
  });
}).on('error', function(err) {
  fs.unlink(dest);
  console.error("Error downloading image:", err.message);
});
