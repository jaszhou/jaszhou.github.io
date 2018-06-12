'use strict'

var owner='n1YH9ZfzMyvwnqnDSJVzgfX7jLaur5268qi';


var DailyNAS = function() {
    //state
    LocalContractStorage.defineProperty(this, 'balance')
    LocalContractStorage.defineProperty(this, 'AdNumber')
    LocalContractStorage.defineProperty(this, 'UserNumber')
    LocalContractStorage.defineProperty(this, 'GetNumber')
    LocalContractStorage.defineMapProperty(this, 'UsersArrayMap')
    LocalContractStorage.defineMapProperty(this, 'UsersDataMap')
    LocalContractStorage.defineMapProperty(this, 'AdArrayMap')
    LocalContractStorage.defineMapProperty(this, 'AdDataMap')
    //config
    LocalContractStorage.defineProperty(this, 'MinNas')
    LocalContractStorage.defineProperty(this, 'MinAdNas')
}

DailyNAS.prototype = {
    init: function() {
        this.AdNumber = 0
        this.balance = new BigNumber(0)
        this.UserNumber = 0
        this.GetNumber = 0
        this.MinNas = 5e14
        this.MinAdNas = 1e16
    },

    setAd(data) {
        var from = Blockchain.transaction.from
        var sponsorship_nas = Blockchain.transaction.value
        if (new BigNumber(this.MinAdNas).gt(sponsorship_nas)) {
            throw new Error('too little')
        }
        var adData = JSON.parse(data)

        this.balance = sponsorship_nas.plus(this.balance)

        // 判断是否是再次充值
        var oldAd = this.getAd(from)
        if (oldAd) {
            oldAd = JSON.parse(oldAd)
            adData['balance'] = sponsorship_nas.plus(oldAd['balance'])
        } else {
            adData['balance'] = sponsorship_nas
            this.AdArrayMap.set(this.AdNumber, from)
            this.AdNumber += 1
        }

        this.AdDataMap.set(from, JSON.stringify(adData))

        return 'AD id:' + this.AdNumber + ' balance: ' + adData['balance']
    },
    getAd(address) {
        return this.AdDataMap.get(address)
    },
    getUser(address) {
        return this.UsersDataMap.get(address)
    },
    /**
     * 返回系统状态
     */
    getState() {
        var state = {
            balance: this.balance,
            GetNumber: this.GetNumber,
            UserNumber: this.UserNumber,
            AdNumber: this.AdNumber,
            MinNas: this.MinNas,
            MinAdNas: this.MinAdNas
        }
        return state
    },
    getAllAd(limit, offset) {
        limit = parseInt(limit)
        offset = parseInt(offset)
        var number = offset + limit
        if (number > this.AdNumber) {
            number = this.AdNumber
        }
        var result = []
        for (var i = offset; i < number; i++) {
            var key = this.AdArrayMap.get(i)
            var object = this.AdDataMap.get(key)
            var objectJSON = JSON.parse(object)
            objectJSON['address'] = key
            result[i] = JSON.stringify(objectJSON)
        }
        return result
    },
    getAllUser(limit, offset) {
        limit = parseInt(limit)
        offset = parseInt(offset)
        var number = offset + limit
        if (number > this.UserNumber) {
            number = this.UserNumber
        }
        var result = []
        for (var i = offset; i < number; i++) {
            var key = this.UsersArrayMap.get(i)
            var object = this.UsersDataMap.get(key)
            result[i] = object
        }
        return result
    },
    getNAS(adAdress) {
        var userAddress = Blockchain.transaction.from
        var Ad = this.getAd(adAdress)
        Ad = JSON.parse(Ad)
        if (!Ad || Ad.balance < this.MinNas) {
            throw new Error('no nas here')
        }
        var nas = this.getRandomNas()
        var now = new Date().getTime()
        var userHistory = this.UsersDataMap.get(userAddress)

        if (userHistory) {
            userHistory = JSON.parse(userHistory)
            // 时间判断 超过一天 计数清零
            if (now - userHistory.lastTime > 86400000) {
                userHistory.dailyCount = 0
                userHistory.lastTime = now
            }
            if (userHistory.dailyCount > 19) {
                throw new Error('please wait')
            }
        } else {
            userHistory = {
                lastTime: now,
                dailyCount: 0,
                email: '',
                enable: ''
            }
            this.UsersArrayMap.set(this.UserNumber, userAddress)
            this.UserNumber += 1
        }
        var res = this._toUser(userAddress, nas)
        if (res) {
            this.balance = new BigNumber(this.balance).sub(nas)
            Ad.balance = new BigNumber(Ad.balance).sub(nas)
            Ad.count += 1
            userHistory.dailyCount += 1
            this.GetNumber += 1

            this.AdDataMap.set(adAdress, JSON.stringify(Ad))
            this.UsersDataMap.set(userAddress, JSON.stringify(userHistory))
            return JSON.stringify(userHistory)
        }
    },
    getRandomNas(data1, data2) {
        return this.MinNas
    },
    _toUser: function(who, value) {
        var to = who
        var value_wei = value
        var result = Blockchain.transfer(to, value_wei)
        if (!result) {
            throw new Error('GetNas transfer failed. value:' + value_wei)
        }
        return true
    },

    setMinNas: function(value) {
        var user = Blockchain.transaction.from
        //判断是否是指定的账户地址
        if (user == 'n1YH9ZfzMyvwnqnDSJVzgfX7jLaur5268qi') {
            this.MinNas = value
        } else {
            throw new Error('no auth')
        }
        return this.MinNas
    },

    setMinAdNas: function(value) {
        var user = Blockchain.transaction.from
        //判断是否是指定的账户地址
        if (user == 'n1YH9ZfzMyvwnqnDSJVzgfX7jLaur5268qi') {
            this.MinAdNas = value
        } else {
            throw new Error('no auth')
        }
        return this.MinAdNas
    },
    setEmail(email) {
        var userAddress = Blockchain.transaction.from
        var userHistory = this.UsersDataMap.get(userAddress)

        if (userHistory) {
            userHistory = JSON.parse(userHistory)
            // 时间判断 超过一天 计数清零
            userHistory.email = email
        } else {
            userHistory = {
                lastTime: 0,
                dailyCount: 0,
                email: email,
                enable: ''
            }
            this.UsersArrayMap.set(this.UserNumber, userAddress)
            this.UserNumber += 1
        }
        this.UsersDataMap.set(userAddress, JSON.stringify(userHistory))
        return JSON.stringify(userHistory)
    },

    withDraw: function(amount) {
        amount = parseInt(amount)
        var user = Blockchain.transaction.from
        //判断是否是指定的账户地址
        if (user == 'n1YH9ZfzMyvwnqnDSJVzgfX7jLaur5268qi') {
            var withDrawResult = Blockchain.transfer(user, amount)
            if (withDrawResult == true) {
                return true
            } else {
                throw new Error('fail')
            }
        } else {
            throw new Error('no auth')
        }
    }
}

module.exports = DailyNAS
