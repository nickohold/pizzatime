const events = require('events');
const eventEmitter = new events.EventEmitter();
let counter = 9000;
const STATUS={
    NEWORDER:'NewOrder',
    DOUGH: 'dough',
    CHEF:'chef',
    TOPPINGS:'toppings',
    OVEN:'over',
    SERVER:'server',
    BUSY: 'BUSY',
    AVAILABLE: 'AVAILABLE',
}

const staff = {
    doughChefs: [],
    toppingsChefs:[],
    oven:[],
    servers:[]
};

let doughChefsArr =[];


class chefs{
    constructor(station,id){
        this.station = station;
        this.id=chefs.chefID();
    }
    static chefID (){
        return ++counter;
    }

    static cook (pizza,chef,resolve){

        chef.status=STATUS.BUSY;
        pizza.status=STATUS.DOUGH;
        let startCooking = (pizza,chef,resolve)=>{
            setTimeout(function () {
            chef.status=STATUS.AVAILABLE;
            console.log('Chef '+chef.id+' finished '+chef.station+' for order: ' + pizza.id+'. Moving back to head chef.');
            eventEmitter.emit(chef.emit,chef);
            pizza.chefsQueue=staff.toppingsChefs;
            resolve (pizza);
            }.bind(this), chef.time*1000);
        };
        return (startCooking(pizza,chef,resolve));
    }
}

class doughChef extends chefs{
    constructor (station,id){
        super(station,id);
        this.status = STATUS.AVAILABLE;
        this.time=7;
        this.emit='doughChefFree';
    }
    
    cook (pizza, chef,resolve){
        chefs.cook(pizza, chef,resolve);
    }
}

class toppingsChef extends chefs{
    constructor (station,id){
        super(station,id);
        this.status = STATUS.AVAILABLE;
        this.time=4;
        this.emit='toppingsChefFree';
    }    
    cook (pizza, chef,resolve){
        super.cook(pizza, chef,resolve);
    }
}

class oven extends chefs{
    constructor(station,name,id){
        super(station,id);
        this.name=name;
        this.status = STATUS.AVAILABLE;
    }
}
module.exports = {doughChef,toppingsChef,oven,eventEmitter,STATUS,staff}