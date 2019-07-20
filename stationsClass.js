const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `${info.timestamp}: ${info.message}`)
    ),
    transports:[
    new winston.transports.File({filename: 'orders.log'}),
    new winston.transports.Console({level:'info'})
  ]
});
const logToConsole = logger.transports[0];
const logToFile = logger.info;
const chefs = require('./doughChef');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const STATUS={
    DOUGH: 'dough',
    TOPPINGS:'toppings',
    OVEN:'oven',
    SERVER:'servers',
    BUSY: 'BUSY',
    AVAILABLE: 'AVAILABLE',
    DONE:'DONE'
};

class manager{
    constructor(){
        this.stations=manager.setStations();
        this.queue=[];
    }

     static setStations(){
        return {
            dough:{ 
                chefs:[new chefs.doughChef(STATUS.AVAILABLE),new chefs.doughChef(STATUS.AVAILABLE)],
                queue:[]},
            toppings:{
                chefs:[new chefs.toppingsChef(STATUS.AVAILABLE),new chefs.toppingsChef(STATUS.AVAILABLE),new chefs.toppingsChef(STATUS.AVAILABLE)],
                queue:[]},
            oven:{
                chefs:[new chefs.oven('fred',0,STATUS.AVAILABLE)],
                queue:[]},
            servers:{
                chefs:[new chefs.servers(STATUS.AVAILABLE),new chefs.doughChef(STATUS.AVAILABLE)],
                queue:[]}
        }
    }

    assignPizza(chef){
        chef.pizza.toStation=chef.nextStation;
    }
}

module.exports={manager,STATUS,eventEmitter,logToFile};