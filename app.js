const budgetController = (function () {
	let expenseId = 1;
	function Expense (description, value) {
		this.id = expenseId++;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calculatePercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	let incomeId = 1;
	function Income (description, value) {
		this.id = incomeId++;
		this.description = description;
		this.value = value;
	};

	const data = {
		allItems: {
			expenses: [],
			incomes: []
		},
		totals: {
			expenses: 0,
			incomes: 0
		},
		budget: 0,
		percentage: -1
	}

	return {
		addItem: function(type, description, value) {
			let newItem;
			if (type === 'income') {
				data.allItems.incomes.push(newItem = new Income(description, value));
			} else {
				data.allItems.expenses.push(newItem = new Expense(description, value));
			}
			return newItem;
		},
		calcTotal: function(type) {
			let sum = 0;
			let dataType;
			type === 'income' ? dataType = 'incomes' : dataType = 'expenses';
			data.allItems[dataType].forEach(item => sum += item.value);
			data.totals[dataType] = sum;
			data.budget = (data.totals.incomes - data.totals.expenses);

			if (data.totals.incomes > 0) {
				data.percentage = Math.round((data.totals.expenses / data.totals.incomes) * 100);
			};
		},
		calcPercentage: function() {
			data.allItems.expenses.forEach(item => item.calculatePercentage(data.totals.incomes));
		},
		getPercentage: function() {
			const percentages = data.allItems.expenses.map(item => item.getPercentage());
			return percentages;
		},
		budgetData: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				incomes: data.totals.incomes,
				expenses: data.totals.expenses
			}		
		},
		allItems: function() {
			return {
				incomes: data.allItems.incomes,
				expenses: data.allItems.expenses
			}
		},
		removeItem: function(itemId, type) {
			itemToDelete = data.allItems[type].findIndex(item => item.id === Number(itemId));
			data.allItems[type].splice(itemToDelete, 1);

			this.calcTotal('income');
			this.calcTotal('expense');
		}
	}
})();

const UIController = (function() {
	const DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		button: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		deleteButton: '.item__delete--btn',
		budgetIncome: '.budget__income--value',
		budgetExpenses: '.budget__expenses--value',
		budgetValue: '.budget__value',
		percentage: '.budget__expenses--percentage',
		itemPercentage: '.item__percentage',
		container: '.container',
		month: '.budget__title--month',
	};
	function formatNumber (number) {
		let num = number.toFixed(2);
		let numSplit = num.split('.');
		let int = numSplit[0];
		const dec = numSplit[1];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		return int + '.' + dec;
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
			}
		},
		resetInput: function() {
			document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue).forEach(data => data.value = '');
			document.querySelector(DOMStrings.inputDescription).focus();
		},
		addListItem: function(object, type) {
			let html;
			if (type === 'income') {
				html = `<div class="item clearfix" id="income-${object.id}">
                            <div class="item__description">${object.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">+ ${formatNumber(object.value)}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
				document.querySelector(DOMStrings.incomeContainer).insertAdjacentHTML('beforeend', html);
			} else {
				html = `<div class="item clearfix" id="expense-${object.id}">
		                    <div class="item__description">${object.description}</div>
		                    <div class="right clearfix">
		                        <div class="item__value">- ${formatNumber(object.value)}</div>
		                        <div class="item__percentage">${object.percentage}%</div>
		                        <div class="item__delete">
		                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
		                        </div>
		                    </div>
		                </div>`
				document.querySelector(DOMStrings.expenseContainer).insertAdjacentHTML('beforeend', html);
			};
		},
		displayBudget: function (data) {
			document.querySelector(DOMStrings.budgetIncome).textContent = '+ ' + formatNumber(data.incomes);
			document.querySelector(DOMStrings.budgetExpenses).textContent = '- ' + formatNumber(data.expenses);
			document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(data.budget) + ' €';
			if (data.percentage > 0) {
				document.querySelector(DOMStrings.percentage).textContent = data.percentage + ' %';
			} else {
				document.querySelector(DOMStrings.percentage).textContent = '---';
			}
		},
		deleteListItem: function(item) {
			while (item.hasChildNodes()) {
			    item.removeChild(item.firstChild);
			}
			item.remove();
		},
		displayPercentage: function(percentages) {
			const nodes = document.querySelectorAll(DOMStrings.itemPercentage);
			nodes.forEach(function(node, index) {
				if (percentages[index] > 0) {
					node.textContent = percentages[index] + '%';
				} else {
					node.textContent = '---';
				}
			})
			// another possible method
			// const nodes = Array.prototype.slice.call(document.querySelectorAll('.item__percentage'));
			// for (let i = 0; i < nodes.length; i++) {
			// 	nodes[i].textContent = percentages[i] + '%';
			// };

			// yet another method for the same result
			// const nodeListForEach = function(list, callback) {
			// 	for (let i = 0; i < list.length; i++) {
			// 		callback(list[i], i);
			// 	}
			// };
			// nodeListForEach(nodes, function(item, index) {
			// 	if (percentages[index] > 0) {
			// 		item.textContent = percentages[index] + '%';
			// 	} else {
			// 		item.textContent = '---';
			// 	}
			// });
		},
		displayMonth: function() {
			const now = new Date();
			const year = now.getFullYear();
			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			const month = now.getMonth();
			document.querySelector(DOMStrings.month).textContent = months[month] + ' ' + year;
		},
		changedType: function(event) {
			document.querySelectorAll('.add__type, .add__description, .add__value').forEach(node => node.classList.toggle('red-focus'));
			document.querySelector(DOMStrings.button).classList.toggle('red');
		},
		getDOMStrings: function() {
			return DOMStrings;
		}
	}
})();

const controller = (function(budgetCtrl, UICtrl) {
	const setupEventListenners = function() {
		const DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			};
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	}
	
	const updateBudget = function() {
		input = UICtrl.getInput();
		budgetCtrl.calcTotal(input.type);
		budgetData = budgetCtrl.budgetData();
		UICtrl.displayBudget(budgetData);
	};

	const updatePercentage = function() {
		budgetCtrl.calcPercentage();
		UICtrl.displayPercentage(budgetCtrl.getPercentage());
	};

	const ctrlAddItem = function() {
		let input, newItem;
		input = UICtrl.getInput();
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.resetInput();
			updateBudget();
			updatePercentage();
		}
	};

	const ctrlDeleteItem = function(event) {
		let item, itemId, itemType, itemToDelete;
		item = event.target.parentNode.parentNode.parentNode.parentNode;
		if (item.id) {
			itemType = item.id.match(/income/g) ? 'incomes' : 'expenses';
			itemType === 'incomes' ? itemId = item.id.slice(7) : itemId = item.id.slice(8);
			budgetCtrl.removeItem(itemId, itemType);

			UICtrl.deleteListItem(item);
			
			UICtrl.displayBudget(budgetCtrl.budgetData());
			updatePercentage();
		}
	}

	return {
		init: function() {
			console.log('Application has started !');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				incomes: 0,
				expenses: 0
			});
			setupEventListenners();
			document.querySelector('.add__description').focus();
		}
	}

})(budgetController, UIController);

controller.init();