var pizzaCounter =0;
//FIX ME!! GODDAMN GIT
class PIZZA {
    constructor(toppings,station='dough'){
        this.id = PIZZA.pizzaIdSetter();
        this.toppings = toppings;
        this.status = 'new'
        this.toStation=station;
        this.resolve;
    }

    static pizzaIdSetter(){
        if (pizzaCounter===0) {
            pizzaCounter = 1;
            return pizzaCounter;
        } else {
            return ++pizzaCounter;
        } 
    }
}
module.exports ={PIZZA}