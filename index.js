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

	return `:root${ selector }`
}

const supportMap = new WeakMap()

function polyfillScope(){
	for (const sheet of document.styleSheets)
		for (let index = 0; index < sheet.cssRules.length; ++index) {
			const rule = sheet.cssRules[index]

			if (rule.type !== 12)
        continue

      const match = conditionText.match(/^\(polyfill @scope \((.+) to\((.+)\)\)\)$/)

      if (!match || supportMap.has(rule))
        continue

      const [ , from, to ] = match
      const mediaRule = sheet.cssRules[
        sheet.insertRule(
          `@media ${
            `@scope ${from} to(${to})`.replace(/[^\w]/g, '\\$&')
          },all${
            rule.cssText.slice('@supports '.length + rule.conditionText.length)
          }`,

          index++
        )
      ]

      supportMap.set(rule, mediaRule)
      supportMap.set(mediaRule, rule)

      const fromElements = Array.from(document.querySelectorAll(from))

      for (const innerRule of mediaRule.cssRules) {
        if (innerRule.type !== 1)
          return

        const narrElements = fromElements.flatMap(
          from => Array.from(
            from.querySelectorAll(`:is(${ innerRule.selectorText }):not(:scope :is(${ to }) *)`)
          )
        )

        innerRule.selectorText += `:where(${ narrElements.map(getUniqueSelector) })`
      }
		}
}

new MutationObserver(polyfillScope).observe(document.documentElement, { childList: true, subtree: true })

polyfillScope()
