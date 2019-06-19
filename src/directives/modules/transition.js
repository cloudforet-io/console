/**********************************************************************************************
 *
 * @name TRANSITION DIRECTIVE
 *
 * @description It can give sophisticated transition especially with 'trnasform: translate()'.
 *              It calculates translate value, so it's useful when the elements already have
 *              translate value.
 *
 *              ## How to use
 *                 > Eg. v-transition:move="{
 *                         pos: [{ x: 484, y: 6774.947}, {x: 875, y: 6761.947 }],
 *                         term: [1100]
 *                       }"
 *
 *              1. Add directive name. Two types:
 *                 - transition: apply to one element
 *                 - transitionList: apply to childrent elements who have keys
 *
 *              2. Add directive arg. Args:
 *                 - fadeInUp
 *                 - fadeIn
 *                 - fadeInMove
 *                 - fadeOutMove
 *                 - move
 *
 *              3. Add directive value as an option object with normal object type. Object properties:
 *                 - start: A trigger for starting transition.
 *                          It can have 'true' or 'false' and the default value is 'false'.
 *                 - default: Used for initiating position. Used with transitions that have movement.
 *                            It can have normal object type with one property 'pos'.
 *                            'pos' can have normal object type with property 'x' and 'y'.
 *                            'x' and 'y' can have number type.
 *                            > Eg. default: { pos: { x: 640, y:6842.194 }}
 *                            No default value(object).
 *                 - duration: Transition duration time(ms) with number type.
 *                             Default value is 1000.
 *                 - delay: Transition delay time(ms) with number type.
 *                          Default value is 0.
 *                 - term: Transition interval time(ms). Used only with transitionList.
 *                         It can have number type.
 *                         Default value is 0.
 *                 - move: Used only with transitions that have movement.
 *                         It can have normal object with property 'pos' and 'term'.
 *                         'pos' can have an array that has normal objects with property 'x' and 'y'.
 *                         'x' and 'y' can have number type.
 *                         > Eg. pos: [{ x: 640, y:6842.194 }, { x: 800, y:6842.194 } }
 *                         'term' can have an array that has numbers.
 *                         Each item of 'term' array is transition interval time(ms) matched with each object in 'pos' array.
 *                         > Eg. term: [300, 1400, 1800, 1000]
 *                         Number of items of 'term' and 'pos' should be the same.
 *                         > Eg. move: {
 *                                 pos: [
 *                                   {x: 309, y: 7150},
 *                                   {x: 497, y: 7150},
 *                                   {x: 687, y: 7150},
 *                                   {x: 876, y: 7150},
 *                                   {x: 1065, y: 7150}
 *                                 ],
 *                                 term: [300, 1400, 1800, 1000]
 *                               }
 *                         No default value(object).
 *
 *              4. Start transition
 *                 : Set 'start' property of the option object to 'true'.
 *                   Vue cannot detect property addition, so need to use Vue.set(object, key, value) method.
 *                   Eg. this.$set(this.someObject, 'start', true)
 *
 **********************************************************************************************/

/*****************************************************
 *                       PRIVATES                     *
 ******************************************************/

/**
 * @param {*} child
 * @param {string} x
 * @param {string} y
 */
function modifyTransform (el, x, y) {
  let oldTrnasform = el.style.transform

  // no translate in old transform style
  if (!oldTrnasform.includes('translate')) {
    el.style.transform += ` translate(${x}, ${y})`
    return
  }

  let split = ''
  let oldX = '0'
  let oldY = '100px'

  if (oldTrnasform.includes('translateX')) { oldX = oldTrnasform.split('translateX(')[1].split(')')[0] } else if (oldTrnasform.includes('translateY')) { oldY = oldTrnasform.split('translateY(')[1].split(')')[0] } else if (oldTrnasform.includes('translate(')) {
    split = oldTrnasform.split('translate(')[1].split(')')[0].split(',')
    oldX = split[0]
    oldY = split[1].replace(' ', '')
  }

  x = parseFloat(oldX) == 0 ? x : parseFloat(x) == 0 ? oldX : `calc(${oldX} + ${x})`
  y = parseFloat(oldY) == 0 ? y : parseFloat(y) == 0 ? oldY : `calc(${oldY} + ${y})`

  let prev, next

  split = oldTrnasform.split('translate')
  prev = split[0]
  next = split[1].split(')')[1]

  el.style.transform = `${prev}translate(${x}, ${y})${next}`
}

function getOptions (context, expression) {
  if (!expression.includes('.')) return context[expression]

  let splits = expression.split('.')

  for (let split of splits) {
    if (split) context = context[split]
  }

  return context
}

/**
 * functions called when binded
 */
let init = {

  fadeInUp: function (el) {
    el.style.opacity = 0
    if (el.style.transform) modifyTransform(el, '0', '100px')
    else el.style.transform = 'translate(0, 100px)'
  },

  fadeIn: function (el) {
    el.style.opacity = 0
  },

  fadeInMove: function (el, options) {
    el.style.opacity = 0
    /**
     * TODO:
     * SVG case separate
     */
    if (options) {
      el.setAttribute('transform', `translate(${options.default.pos.x} ${options.default.pos.y})`)
    }
  },

  fadeOutMove: function (el, options) {
    el.style.opacity = 1
    /**
     * TODO:
     * SVG case separate
     */
    if (options) el.setAttribute('transform', `translate(${options.default.pos.x} ${options.default.pos.y})`)
  },

  move: function (el, options) {
    el.style.opacity = 1
    /**
     * TODO:
     * SVG case separate
     */
    if (options) el.setAttribute('transform', `translate(${options.default.pos.x} ${options.default.pos.y})`)
  }

}

/**
 * functions called when component updated
 */
let transitions = {

  fadeInUp: function (el, options) {
    let duration = options.duration != undefined ? (options.duration / 1000) : 1
    let delay = options.delay != undefined ? (options.delay / 1000) : 0

    el.style.opacity = 1
    modifyTransform(el, '0', '-100px')
    el.style.transition = `all ${duration}s ease-in ${delay}s`
  },

  fadeIn: function (el, options) {
    let duration = options.duration != undefined ? (options.duration / 1000) : 1
    let delay = options.delay != undefined ? (options.delay / 1000) : 0
    let timeout = 0

    setTimeout(() => {
      el.style.opacity = 1
      el.style.transition = `opacity ${duration}s ease-in ${delay}s`
    }, timeout + delay)
  },

  fadeInMove: function (el, options) {
    let duration = options.duration != undefined ? options.duration : 1000
    let delay = options.delay != undefined ? options.delay : 0
    let term = options.move.term != undefined ? options.move.term : 0
    let timeout = 0
    let computedDuration = duration
    /**
     * TODO:
     * compute duration by moving distance
     */

    for (let i = 0; i < options.move.pos.length; i++) {
      let pos = options.move.pos[i]

      setTimeout(() => {
        /**
         * TODO:
         * SVG case separate
         */
        el.setAttribute('transform', `translate(${pos.x} ${pos.y})`)
        el.style.opacity = 1
        el.style.transition = `all ${duration / 1000}s ease-in-out`
      }, timeout + delay)

      if (typeof options.move.term === 'number') timeout += term
      else timeout += term[i]

      timeout += duration
    }
  },

  fadeOutMove: function (el, options) {
    let duration = options.duration != undefined ? options.duration : 1000
    let delay = options.delay != undefined ? options.delay : 0
    let term = options.move.term != undefined ? options.move.term : 0
    let timeout = 0
    let computedDuration = duration
    /**
     * TODO:
     * compute duration by moving distance
     */

    for (let i = 0; i < options.move.pos.length; i++) {
      let pos = options.move.pos[i]

      setTimeout(() => {
        /**
         * TODO:
         * SVG case separate
         */
        el.setAttribute('transform', `translate(${pos.x} ${pos.y})`)
        el.style.opacity = 0
        el.style.transition = `all ${duration / 1000}s ease-in-out`
      }, timeout + delay)

      if (typeof options.move.term === 'number') timeout += term
      else timeout += term[i]

      timeout += duration
    }
  },

  move: function (el, options) {
    let duration = options.duration != undefined ? options.duration : 1000
    let delay = options.delay != undefined ? options.delay : 0
    let term = options.move.term != undefined ? options.move.term : 0
    let timeout = 0
    let computedDuration = duration
    /**
     * TODO:
     * compute duration by moving distance
     */

    for (let i = 0; i < options.move.pos.length; i++) {
      let pos = options.move.pos[i]

      setTimeout(() => {
        /**
         * TODO:
         * SVG case separate
         */
        el.setAttribute('transform', `translate(${pos.x} ${pos.y})`)
        el.style.transition = `all ${duration / 1000}s ease-in-out`
      }, timeout + delay)

      if (typeof options.move.term === 'number') timeout += term
      else timeout += term[i]

      timeout += duration
    }
  }

}

/*****************************************************
*                       EXPORTS                      *
******************************************************/

export default {

  bind: function (el, binding, vnode) {
    if (!el) return

    if (binding.name === 'transitionList') {
      for (let child of vnode.children) {
        if (child.key == undefined) continue

        init[binding.arg](child.elm)
      }
    } else init[binding.arg](el)
  },

  componentUpdated: function (el, binding, vnode) {
    let options = getOptions(vnode.context, binding.expression)

    if (!options.start) return

    options.start = false

    // init when it is not first time to show effect
    if (options.count != undefined) {
      if (binding.name === 'transitionList') {
        for (let child of vnode.children) {
          if (child.key == undefined) continue

          init[binding.arg](child.elm, options)
        }
      } else init[binding.arg](el, options)
    }

    // do transition
    if (binding.name === 'transitionList') {
      let term = options.term != undefined ? options.term : 0
      let timeout = 0

      for (let child of vnode.children) {
        if (child.key == undefined) continue

        setTimeout(() => {
          transitions[binding.arg](child.elm, options)
        }, timeout)

        timeout += term
      }
    } else transitions[binding.arg](el, options)

    options.count++
  }
}
