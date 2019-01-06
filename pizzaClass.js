var pizzaCounter =0;

class PIZZA {
    constructor(toppings,queue){
        this.id = PIZZA.pizzaIdSetter();
        this.toppings = toppings;
        this.status = 'NewOrder'
        this.chefsQueue=queue;
    }

    static pizzaIdSetter(){
        if (pizzaCounter===0) {
            pizzaCounter = 10001;
            return pizzaCounter;
        } else {
            return ++pizzaCounter;
        } 
    }
}
module.exports ={PIZZA}