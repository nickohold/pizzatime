/*
This is going to be my attempt to build a pizza

What I need to do:
1) main orders receiver (I'll do it via an HTTP request) - DONE
2) analyze the order, break it down to steps, send it out. - DONE
3) monitor each step, available chefs, time for each chef, at each station - Have way.
4) log everything
f
*/

const http = require('http');
const fs = require('fs');
const chefs = require ('./doughChef');
const eventEmitter = chefs.eventEmitter;
const pizzaClass = require ('./pizzaClass');
const STATUS=chefs.STATUS;
const queue = {
    pizza:[],
    dough:[],
    toppings:[],
    oven:[],
    servers:[]
};

let staff = chefs.staff;

(function preparation (){
    staff.doughChefs.push(new chefs.doughChef('dough'));
    staff.doughChefs.push(new chefs.doughChef('dough'));
    staff.toppingsChefs.push(new chefs.toppingsChef('toppings'));
    staff.toppingsChefs.push(new chefs.toppingsChef('toppings'));
    staff.toppingsChefs.push(new chefs.toppingsChef('toppings'));
    staff.oven.push(new chefs.oven('oven','fred'));

    Object.entries(staff).forEach(([key, station]) => {
        for (let i=0;i<station.length;i++){
            console.log('Chef '+station[i].id+' assigned to '+station[i].station+' station.');
        }
    })
})();

http.createServer ((req,res) =>{
    if (req.url.includes('favicon')){
        res.writeHead(400, 'No favicon.ico allowed');
        res.end();
    }else if (req.url.includes('toppings')){
        newOrder(req);
        res.writeHead(200, 'order received')
        res.end();
    } else {
        res.writeHead(400, 'what is this requests?');
        res.end();
    }
}).listen(8081);

function urlBreakDown (url,baseUrl) {
    let mySearchParams = new URL(url,baseUrl).searchParams;
    let toppings = new URLSearchParams(mySearchParams).getAll('toppings');
    return toppings;    
}

function newOrder (orderUrl){
    let toppings = urlBreakDown(orderUrl.url, ('http://'+orderUrl.headers.host));
    let pizza = new pizzaClass.PIZZA(toppings,staff.doughChefs);
    queue.pizza.push(pizza);
    console.log('Pizza order #'+pizza.id+' received.\nPizza toppings are: '+pizza.toppings);
    headChef(pizza);
}

//this function should manage the orders, chefs, transition between stations.
async function headChef(pizza){
    if (queue.pizza.length >0){
        try {
            let thisChef = await assignChef(pizza);
        } catch (error) {
            console.log('No free chefs. Pizza awaits in queue. Place in queue: '+ queue.pizza.indexOf(error)+1);
            console.log('Remaining pizzas in queue: '+queue.pizza.length);
            if (error.id==queue.pizza[0].id){
                console.log('the first error.id==queue.pizza[0]: '+error.id+'\n'+queue.pizza[0].id);
                eventEmitter.on(pizza.chefsQueue[0].emit, (chef)=>{
                    
                    headChef(queue.pizza[0]);
                });
            }else
            console.log('error.id==queue.pizza[0]: '+error.id+'\n'+queue.pizza[0].id);
        }
    }else {
        console.log('Head Chef reports: No more pizzas in '/*+queue.pizza.+*/+'. No other action needed'); 
    }
}

function assignChef  (pizza){  
        let chef = null;
        let found = false;
        for (let i=0;i< pizza.chefsQueue.length && found==false;i++){
            if (pizza.chefsQueue[i].status==STATUS.AVAILABLE){
                found=true;
                chef=pizza.chefsQueue[i];
                queue.pizza.splice(queue.pizza.indexOf(pizza),1);
                
                return new Promise((resolve)=>{
                    console.log('Chef #:' +chef.id+' starting to work on pizza '+pizza.id+'.');
                    return pizza.chefsQueue[i].cook(pizza,chef,resolve);
                });
                break;
            }
        }
        if (!found){
            throw pizza;
        }
}