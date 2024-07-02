//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
