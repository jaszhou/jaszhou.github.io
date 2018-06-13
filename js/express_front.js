var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var myneb = new Neb();

myneb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
// myneb.setRequest(new HttpRequest("https://testnet.nebulas.io"));

var account, tx, txhash, totalnum;
var arrs = [];
var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var callbackUrl = NebPay.config.mainnetUrl;   //如果合约在主网,则使用这个

// MainNet
var dappAddress = "n1purfKkMQrxza39tVJP22poyb97mMcsZNx";

// TestNet
// var dappAddress = "n1ofecsSErLz9Cy7s9gqkLAZq4qdmhLvVXo";



    document.addEventListener("DOMContentLoaded", function() {
        $("#search_value").attr("disabled",true)
        $("#search").attr("disabled",true)

        console.log("web page loaded...")
        setTimeout(checkNebpay,100);

        // myneb.api.latestIrreversibleBlock().then(function(blockData) {
        // //code
        // console.log(JSON.stringify(blockData));
        //
        //     $("#height").text("current height: "+blockData.height );
        //
        // });

        setTimeout(getACC,100);
        // setTimeout(loadTable,100);



    });

    function checkNebpay() {
        console.log("check nebpay")
        try{
            var NebPay = require("nebpay");

            $("#search_value").attr("disabled",false)
            $("#search").attr("disabled",false)

        }catch(e){
            //alert ("Extension wallet is not installed, please install it first.")
            $("#noExtension").removeClass("hide")
        }
    }

    function getACC() {
        console.log("check acount")
        console.log("********* get account *****************")
           window.postMessage({
               "target": "contentscript",
               "data":{
               },
               "method": "getAccount",
           }, "*");
    }


    $("#save").click(function() {
            var to = dappAddress;
            var value = "0";
            var callFunction = "register"
            //var callArgs = "[\"" + $("#search_value").val() + "\",\"" + $("#add_value").val() + "\"]"
            // var arg1 = $("#search_value").val(),
            //     arg2 = $("#add_value").val();
            // var callArgs = JSON.stringify([arg1, arg2]);

           if($.trim($('#name').val()) == ''){
              alert('Name can not be left blank');
              return false;
           }

            console.log("********* call smart contract \"sendTransaction\" *****************")
            var account = $("#_id").val();
            var project = $("#project_id").val();

            var name = $("#name").val();
            var description = $("#description").val();


            var callArgs = JSON.stringify([account,project,name,description]);

            // var args = "[\""+account+"\""+","+"\""+hashcode+"\""+","+ "\"" + address + "\""+","+"\""+name+"\""+","+"\""+description+"\""+","+"\""+founder+"\""+","+"\""+msg+"\""+"]";
            // var args = str;

            // console.log("str "+str);
            console.log("args "+callArgs);


            serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
                listener: cbPush,       //设置listener, 处理交易返回信息
                callback: callbackUrl
            });

            console.log("serialNumber "+serialNumber);

            intervalQuery = setInterval(function () {
                funcIntervalQuery();
            }, 10000);
        });
        var intervalQuery
        function funcIntervalQuery() {
            var options = {
                callback: callbackUrl
            }
            nebPay.queryPayInfo(serialNumber,options)   //search transaction result from server (result upload to server by app)
                .then(function (resp) {
                    console.log("tx result: " + resp)   //resp is a JSON string
                    var respObject = JSON.parse(resp)
                    if(respObject.code === 0){
                        clearInterval(intervalQuery);
                        // alert(`set ${$("#search_value").val()} succeed!`);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        function cbPush(resp) {
            console.log("response of push: " + JSON.stringify(resp))
            var respString = JSON.stringify(resp);
            if(respString.search("rejected by user") !== -1){
                clearInterval(intervalQuery)
                alert(respString)
            }else if(respString.search("txhash") !== -1){
                //alert("wait for tx result: " + resp.txhash)

                $("#result").text("Update successfully");
            }
        }


function getLen() {

// get len
console.log("********* call smart contract by \"call\" *****************")
var func = "len"
//var args = "[\"" + $("#search_value").val() + "\"]"

window.postMessage({
    "target": "contentscript",
    "data":{
        "to" : dappAddress,
        "value" : "0",
        "contract" : {
            "function" : func,
            "args" :null
        }
    },
    "method": "neb_call"
}, "*");

}



function init() {
        i = 0;

        for(var i=0;i<arrs.length;i++){

          $.create(arrs[i]);
        }


}

function initUser() {
        i = 0;

        for(var i=0;i<arrs.length;i++){

          if(arrs[i]!=null){
            $.createUser(arrs[i]);
          }
      }


}

function getAllUsers(){
myneb.api.call({
    from: dappAddress,
    to: dappAddress,
    value: 0,
    contract: {
        function: "getAllUsers",
        args: null
    },
    gasPrice: 1000000,
    gasLimit: 2000000,
}).then(function(tx) {

    // if (tx.execute_err.length > 0) {
    //             throw new Error(tx.execute_err);
    // }

    arrs = JSON.parse(tx.result);

    console.log("all users: "+JSON.stringify(tx.result));
    console.log("len:"+arrs.length);

    if(arrs.length>0){

      // update project user number
      totalnum = arrs.length;

    initUser();
    }

});

}

// load user theTable

getAllUsers();



// load project table
myneb.api.call({
    from: dappAddress,
    to: dappAddress,
    value: 0,
    contract: {
        function: "getAll",
        args: null
    },
    gasPrice: 1000000,
    gasLimit: 2000000,
}).then(function(tx) {

    // if (tx.execute_err.length > 0) {
    //             throw new Error(tx.execute_err);
    // }

    arrs = JSON.parse(tx.result);

    console.log(arrs);
    console.log("len:"+arrs.length);

    init();
});


function find(code){

  // load project table

  var args = "[\"" + code + "\"]"

  myneb.api.call({
      from: dappAddress,
      to: dappAddress,
      value: 0,
      contract: {
          function: "get",
          args: args
      },
      gasPrice: 1000000,
      gasLimit: 2000000,
  }).then(function(tx) {

    var result = tx.result
     console.log("return of rpc call: " + JSON.stringify(result))

    if (result === 'null'){
        $(".add_banner").addClass("hide");
        $(".result_success").addClass("hide");
        $("#result_faile_add").text($("#search_value").val())
        $(".result_faile").removeClass("hide");
    } else{
        try{
            result = JSON.parse(result);
        }catch (err){

        }

        if (!!result.key){
            $(".add_banner").addClass("hide");
            $(".result_faile").addClass("hide");
            $("#search_banner").text($("#search_value").val())
            $("#search_result").text(result.value)
            $(".result_success").removeClass("hide");
        } else {
            $(".add_banner").addClass("hide");
            $(".result_faile").addClass("hide");
            $("#search_banner").text($("#search_value").val())
            $("#search_result").text(result)
            $(".result_success").removeClass("hide");
        }

    }


  });

}


// function find(code) {
// console.log("********* call smart contract by \"call\" *****************")
// var func = "get"
// var args = "[\"" + code + "\"]"
//
// window.postMessage({
//   "target": "contentscript",
//   "data":{
//       "to" : dappAddress,
//       "value" : "0",
//       "contract" : {
//           "function" : func,
//           "args" : args
//       }
//   },
//   "method": "neb_call"
// }, "*");
//
// }
//$(table).find('tbody').append( "<tr><td>aaaa</td></tr>" );


function getUsers(){
// get user list
myneb.api.call({
    from: dappAddress,
    to: dappAddress,
    value: 0,
    contract: {
        function: "getAllUsers",
        args: null
    },
    gasPrice: 1000000,
    gasLimit: 2000000,
}).then(function(tx) {

  console.log(tx.result);

    arrs = JSON.parse(tx.result);

    console.log("user list: "+ arrs);
    console.log("len:"+arrs.length);

    init();
});
}

function init() {
        i = 0;

//        arrs = dedup(arrs);

        for(var i=0;i<arrs.length;i++){
          $.create(arrs[i]);


        }

}

function expand(proj){

    // $("#div1").fadeToggle("slow");

    $("#div1").toggleClass("hide");
    $("#_id").val(account);
    $("#project_id").val(proj);

    // alert(proj);

}

    // 搜索功能
$("#search").click(function(){
    // $("#search_value").val() 搜索框内的值

    // console.log("********* call smart contract by \"call\" *****************")
    // var func = "get"
    // var args = "[\"" + $("#search_value").val() + "\"]"
    //
    // window.postMessage({
    //     "target": "contentscript",
    //     "data":{
    //         "to" : dappAddress,
    //         "value" : "0",
    //         "contract" : {
    //             "function" : func,
    //             "args" : args
    //         }
    //     },
    //     "method": "neb_call"
    // }, "*");

    find($("#search_value").val());

})

//{"function":"vote","args":"[\"NAS\"]"}
function vote(code) {
  console.log("********* call smart contract by \"call\" *****************")
  var func = "vote"
  // var args = "[\"" + $("#code").text() + "\"]"
//      var args = "[\"" + "NAS" + "\"]"
var args = "[\"" + code + "\"]"
// var args = code

console.log("vote function: "+ args);

  window.postMessage({
      "target": "contentscript",
      "data":{
          "to" : dappAddress,
          "value" : "0",
          "contract" : {
              "function" : func,
              "args" : args
          }
      },
      "method": "neb_call"
  }, "*");


}

function vote2(code) {
  console.log("********* call smart contract by \"call\"  vote2 *****************")
  var args = "[\"" + code + "\"]"

  window.postMessage({
      "target": "contentscript",
      "data": {
          "to": dappAddress,
          "value": "0",
          "contract": {
              "function": "vote",
              "args": args
          }
      },
      "method": "neb_sendTransaction"
  }, "*");


}


// 添加信息功能
$("#add").click(function() {
    $(".result_faile").addClass("hide");
    $(".add_banner").removeClass("hide");

    $("#add_value").val("")
})

$("#push").click(function() {
    console.log("********* call smart contract \"sendTransaction\" *****************")
    var func = "save"
    var args = "[\"" + $("#search_value").val() + "\",\"" + $("#add_value").val() + "\"]"

    window.postMessage({
        "target": "contentscript",
        "data":{
            "to" : dappAddress,
            "value" : "0",
            "contract" : {
                "function" : func,
                "args" : args
            }
        },
        "method": "neb_sendTransaction"
    }, "*");
})

// listen message from contentscript
// window.addEventListener('message', function(e) {
//     // e.detail contains the transferred data
//     console.log("recived by page:" + e + ", e.data:"+ JSON.stringify(e.data));
//     var resultString = JSON.stringify(e.data);
//
//     if (resultString.search("account") !== -1){
//         //document.getElementById("accountAddress").innerHTML= "Account address: " + e.data.data.account;
//
//         // account=JSON.stringify(e.data.data.account);
//         account=e.data.data.account;
//
//         $("#_id").val(account);
//
//
//     }
//
//
//   });

// listen message from contentscript
window.addEventListener('message', function(e) {
    // e.detail contains the transferred data
    console.log("recived by page:" + e + ", e.data:"+ JSON.stringify(e.data));

        var resultString = JSON.stringify(e.data);

        if (resultString.search("account") !== -1){
            //document.getElementById("accountAddress").innerHTML= "Account address: " + e.data.data.account;

            // account=JSON.stringify(e.data.data.account);
            account=e.data.data.account;

            $("#_id").val(account);


        }



});

$.extend({
    create: function(data) {

      console.log("creating project table "+ data);
        var e = $("<div class=\"row\"><div>" + data.key + "</div><div class=right>——" + data.value + "</div></div>");

        $(theTable).find('tbody').append( "<tr><td id='code'>"+data.key+"</td><td>"+data.value+"</td><td>"+totalnum+"</td><td><button id=vote onclick=\"expand('"+data.key+"')\">参加项目</button></td></tr>" );
        // $(theTable).find('tbody').append( "<tr><td id='code'>"+data.key+"</td><td>"+data.value+"</td><td>"+data.poll+"</td><td><button id=vote>参加项目</button></td></tr>" );

        return e;
    },
    createUser: function(data) {
        var e = $("<div class=\"row\"><div>" + data.account + "</div><div class=right>——" + data.project + "</div></div>");

        $(userTable).find('tbody').append( "<tr><td id='code'>"+data.account+"</td><td>"+data.project+"</td><td>"+data.name+"</td><td>"+data.description+"</td></tr>" );
        // $(theTable).find('tbody').append( "<tr><td id='code'>"+data.key+"</td><td>"+data.value+"</td><td>"+data.poll+"</td><td><button id=vote>参加项目</button></td></tr>" );

        return e;
    },
    destroy: function(e) {
        e.css({
            'opacity': '0'
        }).matrix({ '4': 500 });
        setTimeout(function() {
            e.remove();
        }, 1000);
    }
});
$.fn.extend({
    matrix: function(params) {
        this.each(function() {
            var str = $(this).css('transform');
            if (!str) return;
            str = str.substring(7);
            str = str.substring(0, str.length - 1);
            var arr = str.split(', ');
            for (var i = 0; i < 6; i++) {
                arr[i] = arr[i] - 0;
            }
            if (params) {
                for (var key in params) {
                    switch (typeof params[key]) {
                        case 'number':
                            arr[key] = params[key];
                            break;
                        case 'string':
                            arr[key] = eval(arr[key] + params[key]);
                            break;
                    }
                }
                str = arr.join(',');
                str = 'matrix(' + str + ')';
                $(this).css('transform', str);
            }
        });
        return this;
    }
});
