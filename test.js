"use strict";

var crypto = require("crypto");

var account="n1PfySvoUyNfWg6xKDohK96TCWbSxQXLdwB";

const hash = crypto.createHash('sha256');

hash.update(account);

console.log(hash.digest('hex'));


