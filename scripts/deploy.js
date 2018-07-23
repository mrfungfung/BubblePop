const VERSION = require('../src/assets/version.json');
const zipdir = require('zip-dir');
const fs = require('fs');
const path = require('path');
// const curl = new (require( 'curl-request' ))();

console.log(VERSION)
let dest_file_name =  'dist_v' + VERSION.GameMajorVersion + "_" + VERSION.GameMinorVersion + ".zip"
var outdir = './build';

if (!fs.existsSync(outdir)){
    fs.mkdirSync(outdir);
}

const final_path = path.join(outdir,dest_file_name);

zipdir('./dist', { saveTo: final_path }, function (err, buffer) {
  // `buffer` is the buffer of the zipped file

//   curl.setBody({
//     'access_token':'EAAYsfZAxiFmMBAJbaMQZBhdawKXGkxovCWhvcYalwlXxYGUZAKH1kLl8Dmjaha5yz9IWCjfN4KbF8YdDjZCM2Ld7FCWlKhJG5J20EQFZByKnf2ktiqED39iJjFAJRzoXeLEg3DGbgXAdXHMJR8eZBavFBldWoezEohSjMygci1MAZDZD',
//     'type':'BUNDLE',
//     'asset':'@'+final_path,
//     'comment':'Graph API upload'
//   })
//   .post('https://graph-video.facebook.com/398255647318336/assets')
//   .then(({statusCode, body, headers}) => {
//       console.log('success')
//       console.log(statusCode, body, headers)
//   })
//   .catch((e) => {
//       console.log(e);
//   });
});

// curl -X POST https://graph-video.facebook.com/398255647318336/assets -F 'access_token=EAAYsfZAxiFmMBAJbaMQZBhdawKXGkxovCWhvcYalwlXxYGUZAKH1kLl8Dmjaha5yz9IWCjfN4KbF8YdDjZCM2Ld7FCWlKhJG5J20EQFZByKnf2ktiqED39iJjFAJRzoXeLEg3DGbgXAdXHMJR8eZBavFBldWoezEohSjMygci1MAZDZD' -F 'type=BUNDLE' -F 'asset=@./build/dist_v0_1.zip' -F 'comment=Graph API upload'