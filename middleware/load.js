const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('Generated JWT_SECRET:', secret);