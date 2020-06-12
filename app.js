require('dotenv').config()
const Koa = require('koa');
const json = require('koa-json')
const Koarouter = require('koa-router')
const cors = require('koa-cors')
const webhook = require("webhook-discord")
const name = process.env.WEBHOOK_NAME

const Hook = new webhook.Webhook(process.env.DISCORD_WEBHOOK_URL)


const app = new Koa()
const router = new Koarouter();

const Web3 = require('web3');

const web3 = new Web3(process.env.INFURA_URL)

const abi = process.env.CONTRACT_ABI;
const address = process.env.CONTRACT_ADDRESS;
const myCon =  new web3.eth.Contract(JSON.parse(abi),address)

// var subscription = web3.eth.subscribe('logs', {
//     address: address,
    
// }, function(error, result){
//     if (!error)
//         console.log(result);
// });
//console.log(myCon.events)

// var dist_Set = myCon.events.receiver_Set({},{fromBlock:0});
// console.log(dist_Set)

// dist_Set.watch(function(err,result){
//     if(!error){
//         console.log(result)
//     }
    
// })


myCon.events
  .allEvents({
    // filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
    fromBlock: 6652179,
  })
  .on("data", function (event) {
    if (event.event === "distributer_Set") {
      console.log("New Distributer:", event.returnValues[0]);
      Hook.success(name, `A new Distributer Set:${event.returnValues[0]}`);
    } // same results as the optional callback above
    if (event.event === "receiver_Set") {
      console.log("New Receiver Set:", event.returnValues[0]);
      Hook.success(name, `A new Receiver Set:${event.returnValues[0]}`);
    }
    if (event.event === "load_Sent") {
      console.log(
        "New Load Sent:",
        "\nLoad Number:",
        event.returnValues[0],
        "\nUnits:",
        event.returnValues[1],
        "\nFrom:",
        event.returnValues[2],
        "\nTo:",
        event.returnValues[3],
        "\nReceiver:",
        event.returnValues[4]
      );
      Hook.success(
        name,
        `A New Load Sent:
        \nLoad Number:${event.returnValues[0]}
        \nUnits:${event.returnValues[1]}
        \nFrom:${event.returnValues[2]}
        \nTo:${event.returnValues[3]}
        \nReceiver:${event.returnValues[4]}`
      );
    }
    if(event.event==='load_Received'){
        console.log('Load Received:',event.returnValues[0])
        Hook.success(name,`Load Received:${event.returnValues[0]}`)
    }
  })
  .on("changed", function (event) {
    // remove event from local database
  })
  .on("error", console.error);


app.use(cors())
app.use(json())





app.use(router.routes()).use(router.allowedMethods())


app.use(async ctx=>ctx.body = {msg:myCon});


app.listen(3000,()=>{console.log('server started')})

