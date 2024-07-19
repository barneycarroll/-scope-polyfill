// @ts-check

/**
 * Return a unique selector for a specific element.
 * @arg {Element} element
 */
function getPositionalSelector(element){
	let selector = ''

	let parent

	while (parent = /** @type {Element} */ element.parentElement) {
    /** @type {Number} */
    const index = Array.prototype.indexOf.call(parent.children, element)

		selector = ` > :nth-child(${ index + 1 })${ selector }`

		element = parent
	}

	return `:root${ selector }`
}

/** @type {WeakMap.<CSSRule, CSSRule>} */
const supportMap = new WeakMap()

function polyfillScope(){
	for (const sheet of document.styleSheets)
		for (let index = 0; index < sheet.cssRules.length; ++index) {
			const supportsRule = sheet.cssRules[index]

			if (!(supportsRule instanceof CSSSupportsRule))
        continue

      /** @type {RegExpMatchArray | null} */
      const match = supportsRule.conditionText.match(/^\(polyfill @scope \((.+) to\((.+)\)\)\)$/)

      if (!match || supportMap.has(supportsRule))
        continue

      const [ , from, to ] = match

      const mediaRule = /** @type {CSSMediaRule} */ (sheet.cssRules[sheet.insertRule(
        `@media ${
          `@scope ${ from } to(${ to })`.replace(/[^\w]/g, '\\$&')
        },all${
          supportsRule.cssText.slice('@supports '.length + supportsRule.conditionText.length)
        }`,

        index++
      )])

      supportMap.set(supportsRule, mediaRule)
      supportMap.set(mediaRule, supportsRule)

      /** @type {Element[]} */
      const fromElements = Array.from(document.querySelectorAll(from))

      for (const styleRule of mediaRule.cssRules) {
        if (!(styleRule instanceof CSSStyleRule))
          return

        const narrElements = fromElements.flatMap(
          from =>
            /** @type {Element[]} */
            Array.from(
              from.querySelectorAll(`:is(${ styleRule.selectorText }):not(:scope :is(${ to }) *)`)
            )
        )

        styleRule.selectorText += `:where(${ narrElements.map(getPositionalSelector) })`
      }
		}
}

new MutationObserver(polyfillScope).observe(document.documentElement, {childList: true, subtree: true})

polyfillScope()
