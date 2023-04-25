// import now from 'right-now'
// let root = typeof window === 'undefined' ? global : window
interface QueElement {
  handle: number,
  callback: Function,
  cancelled: boolean  
}
let root =  window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  // , raf = root['request' + suffix]
  // , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]
  , raf = window.requestAnimationFrame
  , caf = window.cancelAnimationFrame

// for(var i = 0; !raf && i < vendors.length; i++) {
//   raf = window[vendors[i] + 'Request' + suffix]
//   caf = root[vendors[i] + 'Cancel' + suffix]
//       || root[vendors[i] + 'CancelRequest' + suffix]
// }

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , frameDuration = 1000 / 60;
  const queue:QueElement[] = [];

  raf = function(callback:Function) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle:number) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}
const now = function() {
//     const time = process.hrtime()
//     return time[0] * 1e3 + time[1] / 1e6
return +new Date

}

// const now = global.performance &&
//   global.performance.now ? function now() {
//     return performance.now()
//   } : Date.now || function now() {
//     return +new Date
//   }
// const rafExport = function(fn) {
//     // Wrap in a new function to prevent
//     // `cancel` potentially being assigned
//     // to the native rAF function
//     return raf.call(root, fn)
//   }
export default raf;
export {caf, now};
// module.exports.cancel = function() {
//   caf.apply(root, arguments)
// }
// module.exports.polyfill = function(object) {
//   if (!object) {
//     object = root;
//   }
//   object.requestAnimationFrame = raf
//   object.cancelAnimationFrame = caf
// }
