/** Return a unique selector for a specific element. */
const getUniqueSelector = (/** @type {Element} */ element) => {
	/** Unique selector for this element */
	let selector = ''

	/** @type {Element} */
	let parent

	while (parent = element.parentElement) {
		/** @type {number} Nth-child order of the element. */
		const nthChild = Array.prototype.indexOf.call(parent.children, element) + 1

		selector = ` > :nth-child(${nthChild})${selector}`

		element = parent
	}

	return ':root' + selector
}

let supportMap = new WeakMap()

let polyfillScope = (document) => {
	for (let sheet of document.styleSheets) {
		for (let index = 0; index < sheet.cssRules.length; ++index) {
			let rule = sheet.cssRules[index]
			if (rule.type === 12) {
				let { conditionText } = rule
				let match = conditionText.match(/^\(polyfill @scope \((.+) to\((.+)\)\)\)$/)
				if (match) {
					if (supportMap.has(rule)) continue
					let [ , from, to ] = match
					let mediaRule = sheet.cssRules[sheet.insertRule(`@media ${`@scope ${from} to(${to})`.replace(/[^\w]/g, '\\$&')},all` + rule.cssText.slice('@supports '.length + rule.conditionText.length), index++)]
					supportMap.set(rule, mediaRule)
					supportMap.set(mediaRule, rule)
					let fromElements = Array.from(document.querySelectorAll(from))
					for (let innerRule of mediaRule.cssRules) {
						if (innerRule.type === 1) {
							let narrElements = fromElements.map(
								from => Array.from(
									from.querySelectorAll(':is(' + innerRule.selectorText + '):not(:scope :is(' + to + ') *)')
								)
							).flat()
							let selectors = narrElements.map(
								element => getUniqueSelector(element)
							)
							innerRule.selectorText += ':where(' + selectors + ')'
						}
					}
				}
			}
		}
	}
}

let observer = new MutationObserver(() => polyfillScope(document));
observer.observe(document.documentElement, { childList: true, subtree: true });
polyfillScope(document);
