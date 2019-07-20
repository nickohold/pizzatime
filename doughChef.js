let counter = 9000;
const {eventEmitter}=require('./pizze2.0')
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
        let {STATUS,eventEmitter,logToFile} = require('./stationsClass');
        
        logToFile('Chef #:' +this.id+' from station '+this.station+' starting to work on pizza '+pizza.id+'.');
        console.log('Chef #:' +this.id+' from station '+this.station+' starting to work on pizza '+pizza.id+'.');
        this.status=STATUS.BUSY;
        pizza.status=this.status;
        // console.log(eventEmitter);

        // var eventEmitter=eventEmitter;
        let startCooking = (pizza)=>{
            setTimeout(async () => {
                // pizza.onEmit = this.nextStation;
                this.status=STATUS.AVAILABLE;
                logToFile('Chef '+this.id+' finished '+this.station+' for order: ' + pizza.id+'. Moving back to head chef.');
                console.log('Chef '+this.id+' finished '+this.station+' for order: ' + pizza.id+'. Moving back to head chef.');
                pizza.toStation=this.nextStation;
                await eventEmitter.emit('CHEF FREE',this.id,this.station); //chef is free
                eventEmitter.emit(this.emit,true); //chef finished
                // eventEmitter.emit(pizza.onEmit,pizza); //pizza is moving to next station
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
    //     let time = this.pizza.toppings.length;
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



        // if(tempPizza.length>0){
        //     for (let toppings=0; toppings<pizza.length;){
        //         tempPizza.slice(0,1);
        //         toppings+=2;
        //         this.cook(tempPizza,resolve);
        //         logMsg= ('Chef '+this.id+' finished adding the following toppings:\n    1) '+tempPizza[0]);
        //         if (tempPizza[1].length>0){
        //             logMsg+='\n    2) '+tempPizza[1]+'.';
        //         }
        //     }
        // }else{
        //     logMsg = ('Chef '+this.id+' reports pizza '+pizza.id+' has no toppings. Moving on to Oven');
        //     resolve(pizza); //shouldn't be resolve 
        // }
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
        // let time = this.pizza.toppings.length;
        return super.cook(this.pizza,this.time);
    }

}



module.exports = {chefs,doughChef,toppingsChef,oven,servers}