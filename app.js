// BUDGET CONTROLLER
const budgetController = () => {
	let expenseId = 1
	let incomeId = 1

	function Expense (description, value) {
		this.id = expenseId++
		this.description = description
		this.value = value
	}

	Expense.prototype.calculatePercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100)
		} else {
			this.percentage = -1
		}
	}

	Expense.prototype.getPercentage = function () {
		return this.percentage
	}

	function Income (description, value) {
		this.id = incomeId++
		this.description = description
		this.value = value
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
		addItem: (type, description, value) => {
			let newItem
			if (type === 'income') {
				data.allItems.incomes.push(newItem = new Income(description, value))
			} else {
				data.allItems.expenses.push(newItem = new Expense(description, value))
			}
			return newItem
		},
		calcTotal: type => {
			let sum = 0
			let dataType
			type === 'income' ? dataType = 'incomes' : dataType = 'expenses'
			data.allItems[dataType].forEach(item => sum += item.value)
			data.totals[dataType] = sum
			data.budget = (data.totals.incomes - data.totals.expenses)

			if (data.totals.incomes > 0) {
				data.percentage = Math.round((data.totals.expenses / data.totals.incomes) * 100)
			}
		},
		calcPercentage: () => data.allItems.expenses.forEach(item => item.calculatePercentage(data.totals.incomes)),
		getPercentage: () => data.allItems.expenses.map(item => item.getPercentage()),
		budgetData: () => {
			return {
				budget: data.budget,
				percentage: data.percentage,
				incomes: data.totals.incomes,
				expenses: data.totals.expenses
			}		
		},
		allItems: () => {
			return {
				incomes: data.allItems.incomes,
				expenses: data.allItems.expenses
			}
		},
		removeItem: function(itemId, type) {
			itemToDelete = data.allItems[type].findIndex(item => item.id === Number(itemId))
			data.allItems[type].splice(itemToDelete, 1)
			this.calcTotal('income')
			this.calcTotal('expense')
		}
	}
}


// UI CONTROLLER
const UIController = () => {
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
	}

	const formatNumber =  number => {
		let num = number.toFixed(2)
		let numSplit = num.split('.')
		let int = numSplit[0]
		const dec = numSplit[1]
		if (Math.abs(int).length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
		}
		return int + '.' + dec
	}

	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
			}
		},
		resetInput: () => {
			document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue).forEach(data => data.value = '')
			document.querySelector(DOMStrings.inputDescription).focus()
		},
		addListItem: (object, type) => {
			let html
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
				document.querySelector(DOMStrings.incomeContainer).insertAdjacentHTML('beforeend', html)
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
				document.querySelector(DOMStrings.expenseContainer).insertAdjacentHTML('beforeend', html)
			};
		},
		displayBudget: data => {
			document.querySelector(DOMStrings.budgetIncome).textContent = '+ ' + formatNumber(data.incomes)
			document.querySelector(DOMStrings.budgetExpenses).textContent = '- ' + formatNumber(data.expenses)
			document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(data.budget) + ' €'
			if (data.percentage > 0) {
				document.querySelector(DOMStrings.percentage).textContent = data.percentage + ' %'
			} else {
				document.querySelector(DOMStrings.percentage).textContent = '---'
			}
		},
		deleteListItem: item => {
			while (item.hasChildNodes()) {
			    item.removeChild(item.firstChild)
			}
			item.remove()
		},
		displayPercentage: percentages => {
			const nodes = [...document.querySelectorAll(DOMStrings.itemPercentage)]
			nodes.forEach(function(node, index) {
				if (percentages[index] > 0) {
					node.textContent = percentages[index] + '%'
				} else {
					node.textContent = '---'
				}
			})
		},
		displayMonth: () => {
			const now = new Date()
			const year = now.getFullYear()
			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			const month = now.getMonth()
			document.querySelector(DOMStrings.month).textContent = months[month] + ' ' + year
		},
		changedType: () => {
			document.querySelectorAll('.add__type, .add__description, .add__value').forEach(node => node.classList.toggle('red-focus'))
			document.querySelector(DOMStrings.button).classList.toggle('red')
		},
		getDOMStrings: () => DOMStrings
	}
}


// APP CONTROLLER
const controller = (budgetCtrl, UICtrl) => {
	const setupEventListenners = () => {
		const DOM = UICtrl.getDOMStrings()
		document.querySelector(DOM.button).addEventListener('click', ctrlAddItem)
		document.addEventListener('keypress', event => {
			if (event.keyCode === 13 || event.which === 13) ctrlAddItem()
		})
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
	}
	
	const updateBudget = () => {
		budgetCtrl.calcTotal(UICtrl.getInput().type)
		UICtrl.displayBudget(budgetCtrl.budgetData())
	}

	const updatePercentage = () => {
		budgetCtrl.calcPercentage()
		UICtrl.displayPercentage(budgetCtrl.getPercentage())
	}

	const ctrlAddItem = () => {
		let input, newItem
		input = UICtrl.getInput()
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value)
			UICtrl.addListItem(newItem, input.type)
			UICtrl.resetInput()
			updateBudget()
			updatePercentage()
		}
	}

	const ctrlDeleteItem = event => {
		let item, itemId, itemType
		item = event.target.parentNode.parentNode.parentNode.parentNode
		if (item.id) {
			itemType = item.id.match(/income/g) ? 'incomes' : 'expenses'
			itemType === 'incomes' ? itemId = item.id.slice(7) : itemId = item.id.slice(8)
			budgetCtrl.removeItem(itemId, itemType)
			UICtrl.deleteListItem(item)		
			UICtrl.displayBudget(budgetCtrl.budgetData())
			updatePercentage()
		}
	}

	return {
		init: () => {
			UICtrl.displayMonth()
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				incomes: 0,
				expenses: 0
			})
			setupEventListenners()
			document.querySelector('.add__description').focus()
		}
	}
}

// initialize the app
controller(budgetController(), UIController()).init()
