var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var myneb = new Neb();

myneb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
//myneb.setRequest(new HttpRequest("https://testnet.nebulas.io"));

var account, tx, txhash;

// MainNet
var dappAddress = "n1dwbdKjU4817gMmsCnAQidj5sk7av92oTP";

// TestNet
// var dappAddress = "n1izjqZTZpVuBXEENAavrowaV1gdjCf2d9t";



    document.addEventListener("DOMContentLoaded", function() {
        $("#search_value").attr("disabled",true)
        $("#search").attr("disabled",true)

        console.log("web page loaded...")
        setTimeout(checkNebpay,100);

        myneb.api.latestIrreversibleBlock().then(function(blockData) {
        //code
        console.log(JSON.stringify(blockData));

            $("#height").text("current height: "+blockData.height );

        });



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

var arrs = [];

function init() {
        i = 0;

        for(var i=0;i<arrs.length;i++){

          $.create(arrs[i]);
        }

    $('.main').css('height', $('.container').height() - $('.top').height() + 'px');


}


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


function loadTable() {

console.log("********* call smart contract by \"call\" *****************")
var func = "getAll"
// var args = "[\"" + $("#search_value").val() + "\"]"
var args = "1"

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

function find(code) {
console.log("********* call smart contract by \"call\" *****************")
var func = "get"
var args = "[\"" + code + "\"]"

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
//$(table).find('tbody').append( "<tr><td>aaaa</td></tr>" );

    // 搜索功能
$("#search").click(function(){
    // $("#search_value").val() 搜索框内的值

    console.log("********* call smart contract by \"call\" *****************")
    var func = "get"
    var args = "[\"" + $("#search_value").val() + "\"]"

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
window.addEventListener('message', function(e) {
    // e.detail contains the transferred data
    console.log("recived by page:" + e + ", e.data:"+ JSON.stringify(e.data));
    if (!!e.data.data.account){
        //document.getElementById("accountAddress").innerHTML= "Account address: " + e.data.data.account;
    }
    if (!!e.data.data.receipt){
        //document.getElementById("txResult").innerHTML = "Transaction Receipt\n" +  JSON.stringify(e.data.data.receipt,null,'\t');
    }
    if (!!e.data.data.neb_call){
        var result = e.data.data.neb_call.result
         console.log("return of rpc call: " + JSON.stringify(result))

        if (result === 'null'){
            $(".add_banner").addClass("hide");
            $(".result_success").addClass("hide");

            $("#result_faile_add").text($("#search_value").val())

            $(".result_faile").removeClass("hide");
        } else{

            try{
                result = JSON.parse(e.data.data.neb_call.result)


            }catch (err){

            }

            if (!!result.key){
                $(".add_banner").addClass("hide");
                $(".result_faile").addClass("hide");

                $("#search_banner").text($("#search_value").val())
                $("#search_result").text(result.value)

                 // update poll
                //$("#(result.key)").text(result.poll)

                $('#id_' + result.key).text(result.poll);


                $("#search_result_author").text(result.author)

                $(".result_success").removeClass("hide");
            } else {
                $(".add_banner").addClass("hide");
                $(".result_faile").addClass("hide");

                $("#search_banner").text($("#search_value").val())
                $("#search_result").text(result)

                $("#search_result_author").text("")

                $(".result_success").removeClass("hide");
            }

        }

    }
});

$.extend({
    create: function(data) {
        var e = $("<div class=\"row\"><div>" + data.key + "</div><div class=right>——" + data.value + "</div></div>");

        $(theTable).find('tbody').append( "<tr><td id='code'>"+data.key+"</td><td>"+data.value+"</td><td>"+data.poll+"</td><td><button id=vote onclick=\"vote2('"+data.key+"')\">vote</button></td></tr>" );

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
