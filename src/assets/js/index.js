// import { gsap } from 'gsap';

const { doc } = require('prettier');

// import { ScrollToPlugin } from 'gsap/ScrollToPlugin.js';
// gsap.registerPlugin(ScrollToPlugin);

// global.gsap = gsap;

// gsap.defaults({
// 	overwrite: 'auto',
// });

class ProjectApp {
	constructor() {
		this.env = require('./utils/env').default;
		this.utils = require('./utils/utils').default;
		this.classes = {
			// Signal: require('./classes/Signal').default,
		};
		this.components = {};
		this.helpers = {};
		this.modules = {};
		document.addEventListener('DOMContentLoaded', () => {
			document.documentElement.classList.remove('_loading');
		});
	}
}

global.ProjectApp = new ProjectApp();

if (module.hot) {
	module.hot.accept();
}

const Basket = (function () {
	const self = {};

	self.selectors = {
		product: {
			item: '.product',
			plus_button: '[data-product-count-plus]',
			minus_button: '[data-product-count-minus]',
			count: '[data-product-count]',
			price: '[data-product-price]',
			remove: '[data-product-remove]',
		},
		sum: {
			product: '[data-basket-product-sum]',
			tax: '[data-basket-tax]',
			shipping: '[data-basket-shipping]',
			total: '[data-basket-total-sum]',
		},
		basket: {
			total_count: '[data-basket-product-count]',
		},
	};

	self.sum = {
		product: 0,
		tax: 0,
		shipping: 0,
		total: 0,
	};

	self.basket = {
		count: 0,
	};

	/**
	 *  Расчет стоимости позициий товара
	 */
	function calculateProductPrice() {
		const products = document.querySelectorAll(self.selectors.product.item);

		products.forEach(product => {
			const count = parseInt(product.querySelector(self.selectors.product.count).value, 10);
			const price = parseInt(product.dataset.productPriceItem, 10);
			const sum = count * price;

			self.sum.product += sum;

			self.basket.count += count;

			product.querySelector(self.selectors.product.price).querySelector('span').innerHTML = sum;
		});
	}

	/**
	 * Расчет общей стоимости корзины
	 */
	function calculateSumPrice() {
		self.sum.tax = parseInt(
			document.querySelector(self.selectors.sum.tax).querySelector('span').innerHTML,
			10
		);
		self.sum.shipping = parseInt(
			document.querySelector(self.selectors.sum.shipping).querySelector('span').innerHTML,
			10
		);

		self.sum.total = self.sum.product + self.sum.tax + self.sum.shipping;

		document.querySelector(self.selectors.sum.product).querySelector('span').innerHTML =
			self.sum.product;
		document.querySelector(self.selectors.sum.total).querySelector('span').innerHTML =
			self.sum.total;
	}

	/**
	 * Расчет стоимость товаров и корзины
	 */
	function calculate() {
		self.sum.product = 0;
		self.sum.tax = 0;
		self.sum.shipping = 0;
		self.sum.total = 0;
		self.basket.count = 0;

		calculateProductPrice();

		calculateSumPrice();

		document.querySelector(self.selectors.basket.total_count).innerHTML = self.basket.count;
	}

	/**
	 * Устанавливаем кол-во товара в продукте
	 */
	function setProductCount(button, count) {
		const count_input = button.closest('.product').querySelector(self.selectors.product.count);

		if (parseInt(count_input.value, 10) + count < 1) {
			return;
		}

		count_input.value = parseInt(count_input.value, 10) + count;

		calculate();
	}

	/**
	 * Событие нажатия на минус
	 */
	function eventMinusCountProduct(event) {
		setProductCount(event.target, -1);
	}

	/**
	 * Событие нажатия на плюс
	 */
	function eventPlusCountProduct(event) {
		setProductCount(event.target, 1);
	}

	/**
	 * Удаление продукта из корзины
	 */
	function eventProductRemove(event) {
		event.target.closest('.product').remove();

		if (document.querySelectorAll('.product').length === 0) {
			document.querySelector(self.selectors.sum.tax).querySelector('span').innerHTML = '0';
			document.querySelector(self.selectors.sum.shipping).querySelector('span').innerHTML = '0';

			let message = document.querySelector('.basket__wrap');
			message.insertAdjacentText('afterbegin', 'cart is empty');
		}

		calculate();
	}

	/**
	 * Инициализация событий
	 */
	function initEvents() {
		document.querySelectorAll(self.selectors.product.minus_button).forEach(minus_button => {
			minus_button.addEventListener('click', event => {
				eventMinusCountProduct(event);
			});
		});

		document.querySelectorAll(self.selectors.product.plus_button).forEach(plus_button => {
			plus_button.addEventListener('click', event => {
				eventPlusCountProduct(event);
			});
		});

		document.querySelectorAll(self.selectors.product.remove).forEach(remove_button => {
			remove_button.addEventListener('click', event => {
				eventProductRemove(event);
			});
		});
	}

	function hot() {
		if (module.hot) {
			module.hot.dispose(() => {
				document.querySelectorAll(self.selectors.product.minus_button).forEach(minus_button => {
					minus_button.removeEventListener('click', event => {
						eventMinusCountProduct(event);
					});
				});

				document.querySelectorAll(self.selectors.product.plus_button).forEach(plus_button => {
					plus_button.removeEventListener('click', event => {
						eventPlusCountProduct(event);
					});
				});
				document.querySelectorAll(self.selectors.product.remove).forEach(remove_button => {
					remove_button.removeEventListener('click', event => {
						eventProductRemove(event);
					});
				});
			});
		}
	}

	/**
	 * Инициализация
	 */
	self.init = function () {
		calculate();

		initEvents();

		hot();
	};

	return self;
})();

document.addEventListener('DOMContentLoaded', () => {
	Basket.init();
});

if (module.hot) {
	module.hot.dispose(() => {
		document.body.removeEventListener('DOMContentLoaded', Basket.init());
	});
}
