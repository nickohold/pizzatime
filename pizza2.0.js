const fs = require('fs');
const {manager,STATUS,eventEmitter,logToFile} = require('./stationsClass');
const activeManager = new manager();
const pizzaClass = require('./pizzaClass');
const pizzaOrders = [
    new pizzaClass.PIZZA(['cheese','bacon']),
    new pizzaClass.PIZZA(['pepperoni','goat cheese','Pineapple']),
    new pizzaClass.PIZZA([]),
    new pizzaClass.PIZZA(['Pepperoni', 'tomatoes', 'mushrooms','onion']),
    new pizzaClass.PIZZA(['BBQ sauce', 'grilled chicken','cheddar cheese']),
];

function start (orders){
    let result;
    try{
        for(let pizza of orders){
            logToFile('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            console.log('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            let thisOrder = new Promise((resolve)=>{
                activeManager.queue.push(pizza);
                pizza.resolve=resolve;
                nextStation(pizza);
            });
            result = thisOrder;
        }
    }catch(e){
        console.log("Error is: "+e);
    }
}

function isChefFree (chefsInStation){
    let found = false;
    for (let i=0; i<chefsInStation.length && found==false ;i++){
        if (chefsInStation[i].status==STATUS.AVAILABLE){
            found=true;
            chefsInStation[i].status=STATUS.BUSY;
            return chefsInStation[i];
        }
    }
    return found;
}

function nextStation(pizza){
    let chefFound = isChefFree(activeManager.stations[pizza.toStation].chefs);
    if (!chefFound){
        putInQueue(activeManager.stations[pizza.toStation].queue, pizza);
        logToFile('No free '+pizza.toStation+'. Pizza #'+pizza.id+' was put in '+pizza.toStation+' queue.');
        console.log('No free '+pizza.toStation+'. pizza #'+pizza.id+' was put in '+pizza.toStation+' queue.');
    }else{
        logToFile('Pizza #'+pizza.id+' moving to '+pizza.toStation+ ' station.');
        console.log('Pizza #'+pizza.id+' moving to '+pizza.toStation+ ' station.');
        chefFound.pizza=pizza;
        chefFound.cook();
    }
}

function putInQueue (queue,pizza){
    queue.push(pizza);
}
function checkStationQueue(station){
    return activeManager.stations[station].queue.length>0;
}

(async()=>{
    await fs.truncate('./orders.log',0,function(){
        console.log('orders.log reset.\n')
        let result = start(pizzaOrders);

    });
    await logToFile(result);
})();

eventEmitter.on('CHEF FREE',(id,station)=>{
    let thisChef;
    let thisPizza;
    for (let chef of activeManager.stations[station].chefs){
        if (chef.id==id){
            thisChef = chef;
        }
    }
    thisPizza=thisChef.pizza;
    if (checkStationQueue(station)){
        logToFile('Pizza #'+thisPizza.id+' pulled from '+thisPizza.toStation+ ' queue and going to that station.');
        console.log('Pizza #'+thisPizza.id+' pulled from '+thisPizza.toStation+ ' queue and going to that station.');
        thisChef.pizza=activeManager.stations[thisChef.station].queue.splice(0,1)[0];
        thisChef.cook();
    }
    if(thisPizza.toStation==STATUS.DONE){
        //code for DONE
    }else{
        nextStation(thisPizza);
    }
});

module.exports={eventEmitter,logToFile}