# CSS `@scope` polyfill

Jonathan Neal wrote a neat @scope polyfill for [this CodePen](https://codepen.io/jonneal/pen/xxpqdpJ). The problem is it only applies to the explicit `@scope (start) to (end)` form, and relies on a strange custom syntax – not really a polyfill in the strictest sense then. Everything else I could find was implementing the outdated `scoped` attribute specification.

My main concern is implicit start scopes via `<style>` position, and I want it to work on spec-compliant code (like a real polyfill!) so that's what this aims to be, using Jonathans same principle strategies: building positional identity selectors of the form `:where(:nth-child(x) > :nth-child(y) etc...)` to apply scoped rules, and `MutationObserver` to respond to changes in the DOM and update the selectors accordingly.
