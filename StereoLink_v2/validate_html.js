const fs = require('fs');
const path = require('path');
let failed = false;
for (const name of ['index.html', 'player.html']) {
  const file = path.join(__dirname, name);
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  if (!scripts.length) {
    console.error(`${name}: no inline script found`);
    failed = true;
    continue;
  }
  try {
    scripts.forEach((script, index) => new Function(script));
    const requirements = name === 'index.html'
      ? ['createMediaStreamDestination', 'channelCount = 2', 'replaceTrack', 'sdpTransform: enforceStereoOpus', '0.peerjs.com']
      : ['sdpTransform:enforceStereoOpus', '0.peerjs.com', 'Click to Watch &amp; Listen'];
   const missing = requirements.filter((requirement) => !html.includes(requirement));
   if (missing.length) throw new Error(`missing required markers: ${missing.join(', ')}`);
    console.log(`${name}: inline JavaScript parses and required implementation markers are present.`);
  } catch (error) {
    console.error(`${name}: ${error.message}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
