//////////////////////////////////////////BUDGET CONTROLLER MODULE 1
var budgetController = (function () {
  
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage =  function (totalIncome)  {
        if (totalIncome > 0 ) {
           this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else {
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    
    var data = {
       allItems: {
           exp: [],
           inc: []
       },
        totals: {
        exp: 0,
        inc: 0
        },
        
        budget: 0,
        percentage: -1 //set to -1 to indicate at the beginning the % doesnt exist
    };
    return {
        addItem: function (type, des, val) { //pub method so other mods can add items 
            var newItem, ID;
            
            //ID [1 2 4 6 8], next ID = (8 + 1) = 9 
            //Create new ID. First select the correct object (inc or exp), then use length -1 to get the last item. Then id  + 1 so the new item has the latest id. If array is empty, make ID = 0
            if (data.allItems[type].length >0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1
            } else {
                ID = 0;
            }
            
            
            //Create new object based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if ( type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //pushes result of addItem funct into correct array in the data object
            data.allItems[type].push(newItem); 
            
            //return new object so other mods can access 
            return newItem;
        },
        
        
        deleteItem: function (type, id) {
            var ids, index;
            
            //to delete we need to know the unique ID# of the inc or exp in question. 
            
            
            //create an array with all current ID's of inc or exp. the map method returns a new array.
            ids = data.allItems[type].map(function(current){
                
                // ex: return 2; would return a new array with same length as allitems[type] but all elements are 2
                //returns a new array where all elements are ID#s of inc objects (or exp, whichever is current)
                return current.id;
            }); 
            //gets the index # of the specific inc or exp object's ID#
            index= ids.indexOf(id);    
            
            
            if(index !== -1) { //delete item id if exists
                //Splice deletes item splice(index#, and how many to delete)
                data.allItems[type].splice(index, 1);
            }
            
    },
        
        calculateBudget: function () {
            //calculate total inc and expenses    
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calc total budg: inc-exp
            data.budget = data.totals.inc - data.totals.exp;
            
            //calc % of income spent
            
            if (data.totals.inc > 0 ) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else {
                data.percentage = -1;
            }
           
        },
        
        
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        
        calculatePercentages: function () {
            
            //loop through current object of exp array to calculate %
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentage: function () {
            //use map on exp array to store calculated percentages 
            var allPerc = data.allItems.exp.map( function (cur) {
                return cur.getPercentage();
            });
            //returns a new array with a % for each element in the exp array
            return allPerc;
            
        },
        
        testing: function (){
            console.log(data);
        }
    };
    
})();





/////////////////////////////////////// UI CONTROLLER MODULE 2
var UIController = (function () {
    
    var DOMstrings = { // holding the css class names to avoid bugs w changing css names later
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentagesLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber= function (num, type) {
            var numSplit, int, dec;
            //+ or - before #
            //two decimal places after number
            //comma seperating thousands
                
            
            num = Math.abs(num); //get absolute value
            num = num.toFixed(2); //add 2 decimal places
                
            numSplit = num.split ('.'); //split number between number and decimal part in a string
                
            int = numSplit[0];
            if(int.length > 3) {
                    
            int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3); 
            }
                
            dec = numSplit[1]; 
            return (type ==='exp' ? '-' : '+') + int + '.' + dec;
            };
    
    return { 
        getInput: function () { //1. Read input data
            return {
                 type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
                 description: document.querySelector(DOMstrings.inputDescription).value, 
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                 //parse float makes an input a # that can accept decimals. w/o this the input is a string not a #- cant do calcs on a string
            };
        },
        
        addListItem: function (obj, type) { //obj is the new obj returned by newItem in global controller step 2
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                  element = DOMstrings.expensesContainer;
                
                  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                
               
            }
            //replace placeholder with actual text  
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            

            //inset html into DOM. select inc or exp container (w/ element), add newhtml to be a last child of the inc/exp container class in html.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            },
            
        
            deleteListItem: function (selectorID) {
                
                //select the entire html chunk that needs to go (inc-1 for ex)
                var el = document.getElementById(selectorID)
                
                
                el.parentNode.removeChild(el);
            
                
            },
        
        
        
        
            //Clear input after value and desc entered. 
            clearFields : function () {
                var fields, fieldsArr;
                
                //fields = desc and value fields, as a LIST, which cant be looped thru :( 
                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); 
                
                //convert the list to an array using slice and call mehods (have to use call since fields is not an array)
                fieldsArr = Array.prototype.slice.call(fields);
                
                //foreach loop to clear out both fields at the same time. 
                fieldsArr.forEach(function (current, index, array) {
                    current.value = ""; //current = array being processed (desc + value) and sets it to empty. 
                })
                
                //set focus back on desc box after clear. desc = index #0 in fieldsArr
                fieldsArr[0].focus();
            },
            
        
            displayBudget : function(obj) {
                document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
                document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
                document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
                document.querySelector(DOMstrings.percentagesLabel).textContent = obj.percentage;
                
                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentagesLabel).textContent = obj.percentage+ '%';
                } else {
                     document.querySelector(DOMstrings.percentagesLabel).textContent= '---';
                }
            },
        
        
            displayPercentages: function (percentages) {
                
                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
                
                var nodeListForEach = function (list, callback) {
                    for (var i=0; i < list.length; i++) {
                        callback(list[i], i);
                    }
                };
                
                nodeListForEach(fields, function(current, index){
                    if( percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '---';
                    }
                });
                
               }, 
                
                displayMonth: function () {
                    var now, year, month, months
                    
                    now = new Date();
                    months = ['Jan', 'Feb', 'Mar', 'Apr' , 'May', 'June', 'July', 'Sept', 'Oct', 'Nov', 'Dec'];
                    month = now.getMonth();
                    year = now.getFullYear();
                    document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
                
                },
            
        
             getDOMstrings: function () { 
             return DOMstrings;
                }
    };
    
    
})();





/////////////////////////////////////GLOBAL APP CONTROLLER MODULE 3
var Controller = (function (budgetCtrl, UICntrl) {
    
    var setupEventListeners = function () {
          var DOM = UICntrl.getDOMstrings(); //so mod 3 can access the domstrings var from mod 2
        
          document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
          document.addEventListener('keypress', function (event) {
              if (event.keyCode === 13 || event.which === 13) { //
              ctrlAddItem();
            }
        });
            
            //when someone clicks on the container containing the delete button, run the deleteitem funct. have to select the container since 1. item not on page at start, and there are many child elements (items) that need this button. 
           document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };
    
     var updateBudget = function () {
        //1. Calculate budget 
         budgetCtrl.calculateBudget();
         
        //2. Return the budget 
        var budget = budgetCtrl.getBudget();
         
        //3. Show new budget to UI
         UICntrl.displayBudget(budget); 
     };
    
    var updatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();
        
        //read %s from budget conroller
        var percentages = budgetCtrl.getPercentage();
        
        
        //Update UI with new %s
        UICntrl.displayPercentages(percentages);
    }
    
    
    
     var ctrlAddItem = function () {
         var input, newItem;
         
       //1. Get the input data
        input = UICntrl.getInput();
        console.log(input);
      
       if (input.description != "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget cnrtlr. It accepts the parameters as returned by getInput funct 
             newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      
            //3. Add the item to the UI
            UICntrl.addListItem(newItem, input.type);
         
         
            //4. Clear the input fields
            UICntrl.clearFields();
         
            //Calculate and Update Budget
            updateBudget();
           
           
           //Calc and update percentages
           updatePercentages();
           
       }      
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, type, ID;
        
        //DOM traversing. we go up 1 parent each time to go from the icon to the whole container to get the ID of the entry thats being clicked to delete. ID works here bc the html has an ID defined
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) { //since its the only thing with an id in html 
            splitID = itemID.split('-');//returns an array with ex: ['inc', '1']
            type = splitID[0];//ex would be 'inc'
            ID = parseInt(splitID[1]); //ex would be '1'    
            
            //1.delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. delete item from UI
            UICntrl.deleteListItem(itemID);
            
            //3. Update and show new budget
            updateBudget();
            
            //4 Calc and show percentages
            updatePercentages();
        }
        
    };

    return {
        init: function () {
            console.log('the app has started');
            UICntrl.displayMonth();
            UICntrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            setupEventListeners();
        }
    }
    
      
    
})(budgetController, UIController);

Controller.init();