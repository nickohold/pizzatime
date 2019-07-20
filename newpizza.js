const winston = require('winston');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const chefs = require ('./doughChef');
const eventEmitter = chefs.eventEmitter;
const pizzaClass = require ('./pizzaClass');
const STATUS = chefs.STATUS;

var QUEUE = {
    new:[],
    dough:[],
    toppings:[],
    oven:[],
    servers:[]
};

const pizzaOrders = [
    new pizzaClass.PIZZA(['cheese','bacon']),
    new pizzaClass.PIZZA(['pepperoni','goat cheese','Pineapple']),
    new pizzaClass.PIZZA([]),
    new pizzaClass.PIZZA(['Pepperoni', 'tomatoes', 'mushrooms','onion']),
    new pizzaClass.PIZZA(['BBQ sauce', 'grilled chicken','cheddar cheese']),
];
// console.log(pizzaOrders[0]);

// const STATUS={
//     NEWORDER:'pizza',
//     CHEF:'chef',
//     DOUGH: 'dough',
//     TOPPINGS:'toppings',
//     OVEN:'oven',
//     SERVER:'servers',
//     BUSY: 'BUSY',
//     AVAILABLE: 'AVAILABLE',
// };

const stationsQueue = {
    dough:[],
    toppings:[],
    oven:[],
    servers:[]
};
console.log(chefs);
console.log(pizzaOrders);
// (()=>{
//     stationsQueue.dough.push(new chefs.doughChef('dough'));
//     stationsQueue.dough.push(new chefs.doughChef('dough'));
//     stationsQueue.toppings.push(new chefs.toppingsChef('toppings'));
//     stationsQueue.toppings.push(new chefs.toppingsChef('toppings'));
//     stationsQueue.toppings.push(new chefs.toppingsChef('toppings'));
//     stationsQueue.oven.push(new chefs.oven('oven','fred'));

//     Object.entries(stationsQueue).forEach(([key, station]) => {
//         for (let i=0;i<station.length;i++){
//             console.log('Chef '+station[i].id+' assigned to '+station[i].station+' station.');
//         }
//     })
// })();



const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `${info.timestamp}: ${info.message}`)
    ),
    transports:[
    new winston.transports.File({filename: 'orders.log'})
  ]
});
const logToConsole = logger.transports[0];
const logToFile = logger.info;

async function headChef(orders){
    let log;
    let pizzaOrderNum = 0;
    
    try {
        for (let pizza of orders){
            logger.info('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            console.log('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            let thisOrder = new Promise((resolve)=>{
                QUEUE.new.push(pizza);
                // while (!(pizza.onEmit=='done')){
                    nextStation(pizza,resolve);
                    console.log('just to verify');
                // }
            });
            let result = await thisOrder;
            console.log('just to verify2');
        }
        
    }catch(error){
        console.log( 'error: '+error.stack);
        //no more pizza orders.
        //here will be code to handle no more pizza orders. 
        //if you want, at the end, add a timeout for new orders to be received.
    }

}

function printLog(log){
    
}

function isChefFree (chefsInStation){
    let found = false;
    for (let i=0; i<chefsInStation.length && found==false ;i++){
        if (chefsInStation[i].status==STATUS.AVAILABLE){
            found=true;
            chefsInStation[i].status=STATUS.BUSY;
            // pizzaOrders.splice(pizzaOrders.indexOf(pizza),1);
            return chefsInStation[i];
        }
        console.log(found);
        console.log(i);
        // const tdt = Object.entries(stationsQueue)[0];
    }
    return found;
}

function nextStation(pizza,resolve){
    logToFile('pizza order: '+pizza.id+' moving to '+pizza.toStation+ ' station.');
    putInQueue(QUEUE[pizza.toStation]);
    let chefFound = isChefFree(stationsQueue[pizza.toStation]);
    if (!chefFound){
        pizza.onEmit = pizza.toStation;
        // throw pizza;
        eventEmitter.on(pizza.onEmit,(station)=>{
            nextStation(QUEUE[station][0],QUEUE[station][0].toStation);
        });
    }else{
        chefFound.pizza=pizza;
        chefFound.cook(pizza,resolve).bind(this)();
        eventEmitter.on(pizza.onEmit,(station)=>{
            nextStation(QUEUE[station][0],QUEUE[station][0].toStation);
        });
        
        
    }
}

function putInQueue (queue){
    queue.push(QUEUE.new.splice(0,1));
}


(()=>{
    headChef(pizzaOrders);
})();


// module.exports= {eventEmitter,STATUS}
module.exports= {STATUS}




// async function headChef(pizzaOrders){pizzaOrders
//     logger.info('test');
//     let log;
//     let pizzaOrderNum = 0;
//     try {log = await ((resolve)=>{
//         for (let pizza of pizzaOrders){
//             QUEUE.new.push(pizza);
//             nextStation(pizza,CHEF.nextStation);
//             // logToFile('pizza order in: '+pizza);
//             // pizzaOrderNum++;
//             // // isChefFree(pizza,resolve);
//             // let chefFound = isChefFree(stationsQueue.dough);
//             // if (!chefFound){
//             //     throw pizza;
//             // }else{
//             //     chefFound.cook(pizza,resolve);
//             // }
//         }
//     })();
//     }catch(pizza){
//         console.log('No free chefs. Pizza awaits in queue. Place in queue: '+ (pizzaOrders.indexOf(pizza)+1));
//         console.log('Remaining pizzas in queue: '+(pizzaOrders.length-pizzaOrderNum));        // if (error.id==pizzaOrders[0].id){
//         eventEmitter.on(pizza.onEmit, (chef)=>{
//             pizzaOrderNum++;
//             let toStation = pizza.onEmit.split("").splice(0,pizza.onEmit.indexOf('C')).join('');
//             log = await ((resolve)=>{nextStation(chef.pizza,chef.nextStation)});
//             if (QUEUE[chef.station].length>0){
//                 nextStation(QUEUE[chef.station][0],chef.station);
//             }
//         });
//     printLog(log);
//     }
// }