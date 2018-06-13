"use strict";

var owner='n1YH9ZfzMyvwnqnDSJVzgfX7jLaur5268qi';

var CoinItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.voter = obj.voter;
        this.poll = new BigNumber(obj.poll);
    } else {
        this.key = "";
        this.voter = "";
        this.value = "";
        this.poll = 0;
    }
};



CoinItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var UserItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.account = obj.account;
        this.project = obj.project;
        this.name = obj.name;
        this.description = obj.description;
        this.balance = new BigNumber(obj.balance);
    } else {
      this.account = "";
      this.project = "";
      this.name = "";
      this.description = "";
      this.balance = 0;
    }
};



UserItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var HotDollar = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new CoinItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "users", {
        parse: function(text) {
            return new UserItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    // LocalContractStorage.defineMapProperty(this, "UserList");
    LocalContractStorage.defineMapProperty(this, "UserMap");
    LocalContractStorage.defineProperty(this, "UserSize");

    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "voters");
    LocalContractStorage.defineProperty(this, "height");
};

HotDollar.prototype = {
    init: function() {
        // todo

        this.size = 0;
        this.UserSize = 0;
        this.height = 100; // time to wait for next vote

        // var key = "NAS"
        // CoinItem = new CoinItem();
        // CoinItem.voter = Blockchain.transaction.from;
        // CoinItem.key = key;
        // CoinItem.value = "Nebulas";
        // CoinItem.poll = 0;
        //
        // this.repo.put(key, CoinItem);
        // this.arrayMap.put(0, key);
        // this.size += 1;
    },

    // get: function (key) {
    //     return this.repo.get(key);
    // },

    len: function() {
        return this.size;
    },

    userlen: function() {
        return this.UserSize;
    },

    getAll: function() {

        var tokens = [];
        for (var i = 0; i < this.size; i++) {

            var key = this.arrayMap.get(i);

            tokens.push(this.repo.get(key));
        }

        return tokens;
    },

    getAllUsers: function() {

        var tokens = [];
        for (var i = 0; i < this.UserSize; i++) {

            var key = this.UserMap.get(i);

            tokens.push(this.users.get(key));
        }

        return tokens;
    },

    save: function(key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64) {
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        // var CoinItem = this.repo.get(key);
        // if (CoinItem){
        // 		throw new Error("value has been occupied");
        // }
        //

        var index = this.size;

        CoinItem = new CoinItem();
        CoinItem.voter = Blockchain.transaction.from;;
        CoinItem.key = key;
        CoinItem.value = value;
        CoinItem.poll = 0;

        this.repo.put(key, CoinItem);
        this.arrayMap.put(index, key);

        this.size += 1;


    },

    register: function(account, project, name, description) { // myItem is a string in JSON format

        var userItem = new UserItem();
        userItem.account = Blockchain.transaction.from;

        var input_account = account.trim();
        if (input_account === "") {
            throw new Error("empty account");
        }

        if (account != Blockchain.transaction.from) {
            throw new Error("Only owner can update the address");
        }


        // 判断是否是再次
        var user = this.users.get(Blockchain.transaction.from);
        if (user) {
            // user = JSON.parse(user);
            // user['name'] = name;
            // this.users.set(from, JSON.stringify(user))

             // userItem = new UserItem(JSON.stringify(user));
             // userItem.name = name;
             // this.users.set(from, userItem);

             userItem.project = project;
             userItem.name = name;
             userItem.description = description;

             this.users.put(userItem.account, userItem);

        } else {
            userItem.project = project;
            userItem.name = name;
            userItem.description = description;

            this.users.put(userItem.account, userItem);
            this.UserMap.put(this.UserSize, userItem.account);
            this.UserSize += 1;
        }


    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

    getUser: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.users.get(key);
    },

    vote: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }

        var bk_height = new BigNumber(Blockchain.block.height);

        if (this.voters.get(Blockchain.transaction.from)) {

            if (bk_height.lt(new BigNumber(this.voters.get(Blockchain.transaction.from)))) {
                throw new Error("Can not vote before expiryHeight.");
            }
        }

        CoinItem = this.repo.get(key);

        CoinItem.poll++;

        this.repo.put(key, CoinItem);

        // mark the voters

        var expiryHeight = bk_height.plus(this.height);

        this.voters.put(Blockchain.transaction.from, expiryHeight);
    }

};
module.exports = HotDollar;
