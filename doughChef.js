let counter = 9000;
const capitalized = (string)=>{
    return string.charAt(0).toUpperCase() + string.slice(1)
};
// const {eventEmitter}=require('./pizza2.0')
class chefs{
    constructor(station,id){
        this.station = station;
        this.id=chefs.chefID();
        this.nextStation='dough';
    }
    static chefID (){
        return ++counter;
    }

    cook (pizza,time){
        let {STATUS,eventEmitter,logToFile} = require('./managerClass');
        logToFile(capitalized(this.station)+' chef #' +this.id+' from station '+this.station+' starting to work on pizza #'+pizza.id+'.');
        console.log(capitalized(this.station)+' chef #' +this.id+' from station '+this.station+' starting to work on pizza #'+pizza.id+'.');
        this.status=STATUS.BUSY;
        pizza.status=this.status;
        let startCooking = (pizza)=>{
            setTimeout(async () => {
                this.status=STATUS.AVAILABLE;
                pizza.status=this.status;
                logToFile(capitalized(this.station)+' chef '+this.id+' finished '+this.station+' for pizza #' + pizza.id+'. Moving to next station.');
                console.log(capitalized(this.station)+' chef '+this.id+' finished '+this.station+' for pizza #' + pizza.id+'. Moving to next station.');
                pizza.toStation=this.nextStation;
                await eventEmitter.emit('CHEF FREE',this.id,this.station); //chef is free
                return true;
            }, time*1000);
        };
        return startCooking(pizza);
    }    
}

// const  {ChefFinish,...what} = 'doughChefFinish'
class doughChef extends chefs{
    constructor (status,id){
        super(id);
        this.status = status;
        this.time = 7;
        this.emit = 'doughChefFinish'+this.id;
        this.station='dough';
        this.pizza;
        this.nextStation = 'toppings';
    }
    
    cook (){
        return super.cook(this.pizza,this.time);
    }
}

class toppingsChef extends chefs{
    constructor (status,id){
        super(id);
        this.status = status;
        this.time=4;
        this.emit='toppingsChefFinish'+this.id;
        this.station = 'toppings';
        this.nextStation = 'oven';
        this.toppingsPerChef=2;
        this.pizza;
    }    
    cook (){
        let time = this.pizza.toppings.length>0 ? Math.ceil(this.pizza.toppings.length/2)*this.time : 0;
        return super.cook(this.pizza,time);       
    }
}

class oven extends chefs{
    constructor (name,id,status){
        super(id);
        this.name=name;
        this.status = status;
        this.station = 'oven';
        this.emit='ovenFinish'+this.id;
        this.time=10;
        this.nextStation = 'servers';
        this.pizza;
    }
    cook (){
        return super.cook(this.pizza,this.time);
    }
}

class servers extends chefs{
    constructor(status,id){
    super(id);
    this.time=5;
    this.emit = 'serverFinish'+this.id;
    this.status=status;
    this.station='servers';
    this.nextStation = 'DONE';
    this.pizza;
    }

    cook (){
        return super.cook(this.pizza,this.time);
    }
}


module.exports = {chefs,doughChef,toppingsChef,oven,servers}