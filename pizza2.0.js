const fs = require('fs');
const {manager,STATUS,eventEmitter,logToFile} = require('./stationsClass');
const activeManager = new manager();
const pizzaClass = require('./pizzaClass');
const pizzaOrders = [
    new pizzaClass.PIZZA(['cheese','bacon']),
    new pizzaClass.PIZZA(['pepperoni','goat cheese','Pineapple']),
    new pizzaClass.PIZZA([]),
    // new pizzaClass.PIZZA(['Pepperoni', 'tomatoes', 'mushrooms','onion']),
    // new pizzaClass.PIZZA(['BBQ sauce', 'grilled chicken','cheddar cheese']),
];

function start (orders){
    let result;
    // try{
        for(let pizza of orders){
            logToFile('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            console.log('Pizza ' + pizza.id + ' received at head chef. Starting process.');
            let thisOrder = new Promise((resolve,reject)=>{
                activeManager.queue.push(pizza);
                // while (!(pizza.onEmit=='done')){
                nextStation(pizza,resolve,reject);
                // console.log('just to verify');
                // }
            });
            result = thisOrder;
        }
        // eventEmitter.on('CHEF FREE',(id,station)=>{
        //     let thisChef; 
        //     for (let chef of activeManager.stations[station].chefs){
        //         if (chef.id==id){
        //             thisChef = chef;
        //         }
        //      }
            
            
            // console.log(activeManager.stations[pizza.toStation].queue[0]);
        // });
    // }catch(e){
    //     console.log("Error is: "+e);
    // }
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
        // console.log('loop '+i+') '+'found: '+found);
        // console.log("i: "+i);
    }
    return found;
}
// doughChefFinish
function nextStation(pizza,resolve,reject){
    let chefFound = isChefFree(activeManager.stations[pizza.toStation].chefs);
    if (!chefFound){
        putInQueue(activeManager.stations[pizza.toStation].queue, pizza);
        logToFile('pizza '+pizza.id+' was put in '+pizza.toStation+' queue.');
        console.log('pizza '+pizza.id+' was put in '+pizza.toStation+' queue.');
        // chefFound = await new Promise((res,rej)=>{
        //     eventEmitter.on('CHEF FREE',(id,station)=>{
        //         let thisChef; 
        //         for (let chef of activeManager.stations[station].chefs){
        //             if (chef.id==id){
        //                 thisChef = chef;
        //             }
        //         resolve(thisChef);
        //         }
        //     });
        // });
        // chefFound.pizza=pizza;
        // chefFound.cook();
        // console.log('queue now: \n'+activeManager.stations[pizza.toStation].queue[0]);
        // eventEmitter.once(activeManager.stations[pizza.toStation].chefs[0].station,(resolve)=>{
            // console.log("pizza "+pizza.id+" is being sent to "+pizza.toStation);
        //     // console.log(activeManager.stations[pizza.toStation].queue[0]);
        //     nextStation(activeManager.stations[pizza.toStation].queue.splice(0,1)[0],resolve,reject);
        // });
    }else{
        logToFile('pizza order: '+pizza.id+' moving to '+pizza.toStation+ ' station.');
        console.log('pizza order: '+pizza.id+' moving to '+pizza.toStation+ ' station.');
        // console.log("pizza.toStation: "+pizza.toStation+"\nchefFound: "+chefFound.nextStation);
        chefFound.pizza=pizza;
        chefFound.cook();
        // console.log("chefFound.emit: "+chefFound.emit);
        eventEmitter.once(chefFound.emit,(res)=>{
            activeManager.queue.push(chefFound.pizza);
            if (res){
                // eventEmitter.emit('CHEF FREE',this.id,this.station); //chef is free
                // chefFound.pizza.toStation = chefFound.nextStation;
                if(activeManager.queue[0].toStation==STATUS.DONE){
                    // return resolve('All Done!');
                }else{
                    // if(pizza.id==1);
                    // console.log('break');
                    nextStation(activeManager.queue.splice(0,1)[0],resolve,reject);
                }
                // if(checkStationQueue(chefFound)){
                //     if(chefFound.station=='servers'){
                //         console.log(activeManager.stations[chefFound.station].queue)
                //     }
                //     chefFound.pizza=activeManager.stations[chefFound.station].queue.splice(0,1)[0];
                //     logToFile("pizza "+chefFound.pizza.id+" is being sent to "+chefFound.pizza.toStation+" to chef "+chefFound.id);
                //     console.log("pizza "+chefFound.pizza.id+" is being sent to "+chefFound.pizza.toStation+" to chef "+chefFound.id);
                //     chefFound.cook();
                // }
            }else{
                logToFile('cook failed for some reason. chefFound.cook() returned as false');
                console.log('cook failed for some reason. chefFound.cook() returned as false');
                //this is some major bullshit, cause everything should be fine.
            }
        });
        eventEmitter.once('CHEF FREE',(id,station)=>{
            let thisChef; 
            for (let chef of activeManager.stations[station].chefs){
                if (chef.id==id){
                    thisChef = chef;
                }
            }
            if (checkStationQueue(station) && isChefFree (thisChef)){
                thisChef.pizza=activeManager.stations[thisChef.station].queue.splice(0,1)[0];
                thisChef.cook();
            }
        });
            
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
        start(pizzaOrders);
});
    
})();


module.exports={eventEmitter,logToFile}