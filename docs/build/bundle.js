
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var clipboard = createCommonjsModule(function (module, exports) {
    /*!
     * clipboard.js v2.0.6
     * https://clipboardjs.com/
     * 
     * Licensed MIT © Zeno Rocha
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// define __esModule on exports
    /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/ 		}
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
    /******/
    /******/ 	// create a fake namespace object
    /******/ 	// mode & 1: value is a module id, require it
    /******/ 	// mode & 2: merge all properties of value into the ns
    /******/ 	// mode & 4: return value when already ns object
    /******/ 	// mode & 8|1: behave like require
    /******/ 	__webpack_require__.t = function(value, mode) {
    /******/ 		if(mode & 1) value = __webpack_require__(value);
    /******/ 		if(mode & 8) return value;
    /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    /******/ 		var ns = Object.create(null);
    /******/ 		__webpack_require__.r(ns);
    /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    /******/ 		return ns;
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 6);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports) {

    function select(element) {
        var selectedText;

        if (element.nodeName === 'SELECT') {
            element.focus();

            selectedText = element.value;
        }
        else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
            var isReadOnly = element.hasAttribute('readonly');

            if (!isReadOnly) {
                element.setAttribute('readonly', '');
            }

            element.select();
            element.setSelectionRange(0, element.value.length);

            if (!isReadOnly) {
                element.removeAttribute('readonly');
            }

            selectedText = element.value;
        }
        else {
            if (element.hasAttribute('contenteditable')) {
                element.focus();
            }

            var selection = window.getSelection();
            var range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            selectedText = selection.toString();
        }

        return selectedText;
    }

    module.exports = select;


    /***/ }),
    /* 1 */
    /***/ (function(module, exports) {

    function E () {
      // Keep this empty so it's easier to inherit from
      // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
    }

    E.prototype = {
      on: function (name, callback, ctx) {
        var e = this.e || (this.e = {});

        (e[name] || (e[name] = [])).push({
          fn: callback,
          ctx: ctx
        });

        return this;
      },

      once: function (name, callback, ctx) {
        var self = this;
        function listener () {
          self.off(name, listener);
          callback.apply(ctx, arguments);
        }
        listener._ = callback;
        return this.on(name, listener, ctx);
      },

      emit: function (name) {
        var data = [].slice.call(arguments, 1);
        var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
        var i = 0;
        var len = evtArr.length;

        for (i; i < len; i++) {
          evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
      },

      off: function (name, callback) {
        var e = this.e || (this.e = {});
        var evts = e[name];
        var liveEvents = [];

        if (evts && callback) {
          for (var i = 0, len = evts.length; i < len; i++) {
            if (evts[i].fn !== callback && evts[i].fn._ !== callback)
              liveEvents.push(evts[i]);
          }
        }

        // Remove event from queue to prevent memory leak
        // Suggested by https://github.com/lazd
        // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

        (liveEvents.length)
          ? e[name] = liveEvents
          : delete e[name];

        return this;
      }
    };

    module.exports = E;
    module.exports.TinyEmitter = E;


    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {

    var is = __webpack_require__(3);
    var delegate = __webpack_require__(4);

    /**
     * Validates all params and calls the right
     * listener function based on its target type.
     *
     * @param {String|HTMLElement|HTMLCollection|NodeList} target
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listen(target, type, callback) {
        if (!target && !type && !callback) {
            throw new Error('Missing required arguments');
        }

        if (!is.string(type)) {
            throw new TypeError('Second argument must be a String');
        }

        if (!is.fn(callback)) {
            throw new TypeError('Third argument must be a Function');
        }

        if (is.node(target)) {
            return listenNode(target, type, callback);
        }
        else if (is.nodeList(target)) {
            return listenNodeList(target, type, callback);
        }
        else if (is.string(target)) {
            return listenSelector(target, type, callback);
        }
        else {
            throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
        }
    }

    /**
     * Adds an event listener to a HTML element
     * and returns a remove listener function.
     *
     * @param {HTMLElement} node
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNode(node, type, callback) {
        node.addEventListener(type, callback);

        return {
            destroy: function() {
                node.removeEventListener(type, callback);
            }
        }
    }

    /**
     * Add an event listener to a list of HTML elements
     * and returns a remove listener function.
     *
     * @param {NodeList|HTMLCollection} nodeList
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNodeList(nodeList, type, callback) {
        Array.prototype.forEach.call(nodeList, function(node) {
            node.addEventListener(type, callback);
        });

        return {
            destroy: function() {
                Array.prototype.forEach.call(nodeList, function(node) {
                    node.removeEventListener(type, callback);
                });
            }
        }
    }

    /**
     * Add an event listener to a selector
     * and returns a remove listener function.
     *
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenSelector(selector, type, callback) {
        return delegate(document.body, selector, type, callback);
    }

    module.exports = listen;


    /***/ }),
    /* 3 */
    /***/ (function(module, exports) {

    /**
     * Check if argument is a HTML element.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.node = function(value) {
        return value !== undefined
            && value instanceof HTMLElement
            && value.nodeType === 1;
    };

    /**
     * Check if argument is a list of HTML elements.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.nodeList = function(value) {
        var type = Object.prototype.toString.call(value);

        return value !== undefined
            && (type === '[object NodeList]' || type === '[object HTMLCollection]')
            && ('length' in value)
            && (value.length === 0 || exports.node(value[0]));
    };

    /**
     * Check if argument is a string.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.string = function(value) {
        return typeof value === 'string'
            || value instanceof String;
    };

    /**
     * Check if argument is a function.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.fn = function(value) {
        var type = Object.prototype.toString.call(value);

        return type === '[object Function]';
    };


    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {

    var closest = __webpack_require__(5);

    /**
     * Delegates event to a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function _delegate(element, selector, type, callback, useCapture) {
        var listenerFn = listener.apply(this, arguments);

        element.addEventListener(type, listenerFn, useCapture);

        return {
            destroy: function() {
                element.removeEventListener(type, listenerFn, useCapture);
            }
        }
    }

    /**
     * Delegates event to a selector.
     *
     * @param {Element|String|Array} [elements]
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function delegate(elements, selector, type, callback, useCapture) {
        // Handle the regular Element usage
        if (typeof elements.addEventListener === 'function') {
            return _delegate.apply(null, arguments);
        }

        // Handle Element-less usage, it defaults to global delegation
        if (typeof type === 'function') {
            // Use `document` as the first parameter, then apply arguments
            // This is a short way to .unshift `arguments` without running into deoptimizations
            return _delegate.bind(null, document).apply(null, arguments);
        }

        // Handle Selector-based usage
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // Handle Array-like based usage
        return Array.prototype.map.call(elements, function (element) {
            return _delegate(element, selector, type, callback, useCapture);
        });
    }

    /**
     * Finds closest match and invokes callback.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Function}
     */
    function listener(element, selector, type, callback) {
        return function(e) {
            e.delegateTarget = closest(e.target, selector);

            if (e.delegateTarget) {
                callback.call(element, e);
            }
        }
    }

    module.exports = delegate;


    /***/ }),
    /* 5 */
    /***/ (function(module, exports) {

    var DOCUMENT_NODE_TYPE = 9;

    /**
     * A polyfill for Element.matches()
     */
    if (typeof Element !== 'undefined' && !Element.prototype.matches) {
        var proto = Element.prototype;

        proto.matches = proto.matchesSelector ||
                        proto.mozMatchesSelector ||
                        proto.msMatchesSelector ||
                        proto.oMatchesSelector ||
                        proto.webkitMatchesSelector;
    }

    /**
     * Finds the closest parent that matches a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @return {Function}
     */
    function closest (element, selector) {
        while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
            if (typeof element.matches === 'function' &&
                element.matches(selector)) {
              return element;
            }
            element = element.parentNode;
        }
    }

    module.exports = closest;


    /***/ }),
    /* 6 */
    /***/ (function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);

    // EXTERNAL MODULE: ./node_modules/select/src/select.js
    var src_select = __webpack_require__(0);
    var select_default = /*#__PURE__*/__webpack_require__.n(src_select);

    // CONCATENATED MODULE: ./src/clipboard-action.js
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



    /**
     * Inner class which performs selection from either `text` or `target`
     * properties and then executes copy or cut operations.
     */

    var clipboard_action_ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }

            /**
             * Decides which selection strategy is going to be applied based
             * on the existence of `text` and `target` properties.
             */

        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }

            /**
             * Creates a fake textarea element, sets its value from `text` property,
             * and makes a selection on it.
             */

        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = select_default()(this.fakeElem);
                this.copyText();
            }

            /**
             * Only removes the fake element after another click event, that way
             * a user can hit `Ctrl+C` to copy because selection still exists.
             */

        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }

            /**
             * Selects the content from element passed on `target` property.
             */

        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = select_default()(this.target);
                this.copyText();
            }

            /**
             * Executes the copy operation based on the current selection.
             */

        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }

            /**
             * Fires an event based on the copy operation result.
             * @param {Boolean} succeeded
             */

        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }

            /**
             * Moves focus away from `target` and back to the trigger, removes current selection.
             */

        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }
                document.activeElement.blur();
                window.getSelection().removeAllRanges();
            }

            /**
             * Sets the `action` to be performed which can be either 'copy' or 'cut'.
             * @param {String} action
             */

        }, {
            key: 'destroy',


            /**
             * Destroy lifecycle.
             */
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            }

            /**
             * Gets the `action` property.
             * @return {String}
             */
            ,
            get: function get() {
                return this._action;
            }

            /**
             * Sets the `target` property using an element
             * that will be have its content copied.
             * @param {Element} target
             */

        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            }

            /**
             * Gets the `target` property.
             * @return {String|HTMLElement}
             */
            ,
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    /* harmony default export */ var clipboard_action = (clipboard_action_ClipboardAction);
    // EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
    var tiny_emitter = __webpack_require__(1);
    var tiny_emitter_default = /*#__PURE__*/__webpack_require__.n(tiny_emitter);

    // EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
    var listen = __webpack_require__(2);
    var listen_default = /*#__PURE__*/__webpack_require__.n(listen);

    // CONCATENATED MODULE: ./src/clipboard.js
    var clipboard_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var clipboard_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function clipboard_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





    /**
     * Base class which takes one or more elements, adds event listeners to them,
     * and instantiates a new `ClipboardAction` on each click.
     */

    var clipboard_Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            clipboard_classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        clipboard_createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
            }

            /**
             * Adds a click event listener to the passed trigger.
             * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
             */

        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = listen_default()(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }

            /**
             * Defines a new `ClipboardAction` on each click event.
             * @param {Event} e
             */

        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new clipboard_action({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }

            /**
             * Default `action` lookup function.
             * @param {Element} trigger
             */

        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }

            /**
             * Default `target` lookup function.
             * @param {Element} trigger
             */

        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }

            /**
             * Returns the support of the given action, or all actions if no action is
             * given.
             * @param {String} [action]
             */

        }, {
            key: 'defaultText',


            /**
             * Default `text` lookup function.
             * @param {Element} trigger
             */
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }

            /**
             * Destroy lifecycle.
             */

        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(tiny_emitter_default.a);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */


    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    /* harmony default export */ var clipboard = __webpack_exports__["default"] = (clipboard_Clipboard);

    /***/ })
    /******/ ])["default"];
    });
    });

    var Clipboard = unwrapExports(clipboard);

    /* src/App.svelte generated by Svelte v3.24.0 */
    const file = "src/App.svelte";

    // (46:6) {#if token}
    function create_if_block_3(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let br;
    	let t2;
    	let input;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Step 2";
    			t1 = text("\n\t\t\t\t\t\t\t\tEnter your Plex username below to ensure shared users don't submit on your behalf:");
    			br = element("br");
    			t2 = space();
    			input = element("input");
    			add_location(h4, file, 47, 8, 1845);
    			add_location(br, file, 48, 90, 1951);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "e.g. simon");
    			add_location(input, file, 49, 8, 1964);
    			add_location(div, file, 46, 7, 1815);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, br);
    			append_dev(div, t2);
    			append_dev(div, input);
    			set_input_value(input, /*user*/ ctx[1]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 2 && input.value !== /*user*/ ctx[1]) {
    				set_input_value(input, /*user*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(46:6) {#if token}",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#if token && user}
    function create_if_block_1(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let button;
    	let i;
    	let t2;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*success*/ ctx[4] === true && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Step 3";
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			t2 = text(" Copy to clipboard\n\t\t\t\t\t\t\t\t");
    			if (if_block) if_block.c();
    			add_location(h4, file, 54, 8, 2116);
    			attr_dev(i, "class", "fas fa-clone");
    			add_location(i, file, 56, 9, 2227);
    			attr_dev(button, "class", "btn");
    			attr_dev(button, "data-clipboard-text", /*url*/ ctx[2]);
    			add_location(button, file, 55, 8, 2140);
    			add_location(div, file, 53, 7, 2086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, i);
    			append_dev(button, t2);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*url*/ 4) {
    				attr_dev(button, "data-clipboard-text", /*url*/ ctx[2]);
    			}

    			if (/*success*/ ctx[4] === true) {
    				if (if_block) {
    					if (dirty & /*success*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(53:6) {#if token && user}",
    		ctx
    	});

    	return block;
    }

    // (58:17) {#if success === true}
    function create_if_block_2(ctx) {
    	let span;
    	let i;
    	let t;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t = text(" copied!");
    			attr_dev(i, "class", "fad fa-check-circle icon");
    			add_location(i, file, 57, 86, 2360);
    			attr_dev(span, "class", "clipboardsuccess");
    			add_location(span, file, 57, 39, 2313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(span, t);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(58:17) {#if success === true}",
    		ctx
    	});

    	return block;
    }

    // (61:6) {#if token && user && copied}
    function create_if_block(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let a;
    	let t3;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Step 4";
    			t1 = text("\n\t\t\t\t\t\t\t\tAnd finally, paste your unique URL into a new ");
    			a = element("a");
    			a.textContent = "webhook here";
    			t3 = text(" using the \"Add Webhook\" button.");
    			add_location(h4, file, 62, 8, 2520);
    			attr_dev(a, "href", "https://app.plex.tv/desktop#!/settings/webhooks");
    			add_location(a, file, 63, 54, 2590);
    			add_location(div, file, 61, 7, 2490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, a);
    			append_dev(div, t3);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(61:6) {#if token && user && copied}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div9;
    	let div5;
    	let header;
    	let div0;
    	let h1;
    	let a0;
    	let t1;
    	let p0;
    	let t2;
    	let i0;
    	let t3;
    	let h3;
    	let t4;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let main;
    	let section0;
    	let div1;
    	let h20;
    	let t10;
    	let p1;
    	let t12;
    	let img;
    	let img_src_value;
    	let t13;
    	let section1;
    	let div4;
    	let h21;
    	let t15;
    	let p2;
    	let t16;
    	let a3;
    	let t18;
    	let a4;
    	let t20;
    	let a5;
    	let t22;
    	let t23;
    	let div3;
    	let div2;
    	let h40;
    	let t25;
    	let a6;
    	let t27;
    	let br;
    	let t28;
    	let input;
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let section2;
    	let h22;
    	let t34;
    	let h41;
    	let t36;
    	let p3;
    	let t37;
    	let a7;
    	let t39;
    	let t40;
    	let h42;
    	let t42;
    	let p4;
    	let t43;
    	let a8;
    	let t45;
    	let t46;
    	let h43;
    	let t48;
    	let p5;
    	let t50;
    	let h44;
    	let t52;
    	let p6;
    	let t54;
    	let ul;
    	let li0;
    	let t56;
    	let li1;
    	let t57;
    	let a9;
    	let t59;
    	let li2;
    	let t61;
    	let li3;
    	let t63;
    	let p7;
    	let t64;
    	let a10;
    	let t66;
    	let t67;
    	let h45;
    	let t69;
    	let p8;
    	let t70;
    	let strong;
    	let t72;
    	let t73;
    	let footer;
    	let div8;
    	let div6;
    	let i1;
    	let t74;
    	let a11;
    	let t76;
    	let div7;
    	let a12;
    	let i2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*token*/ ctx[0] && create_if_block_3(ctx);
    	let if_block1 = /*token*/ ctx[0] && /*user*/ ctx[1] && create_if_block_1(ctx);
    	let if_block2 = /*token*/ ctx[0] && /*user*/ ctx[1] && /*copied*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div5 = element("div");
    			header = element("header");
    			div0 = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			a0.textContent = "Eavesdrop.FM";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("ListenBrainz + Plex = ");
    			i0 = element("i");
    			t3 = space();
    			h3 = element("h3");
    			t4 = text("Submit your ");
    			a1 = element("a");
    			a1.textContent = "Plex";
    			t6 = text(" music listening activity to ");
    			a2 = element("a");
    			a2.textContent = "the ListenBrainz project";
    			t8 = space();
    			main = element("main");
    			section0 = element("section");
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "About Eavesdrop.FM";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "As a heavy user of Plex music, and a fan of what the MetaBrainz people are working towards, I built Eavesdrop.FM to simplify submitting listening data to ListenBrainz, the open last.fm alternative.";
    			t12 = space();
    			img = element("img");
    			t13 = space();
    			section1 = element("section");
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Get started";
    			t15 = space();
    			p2 = element("p");
    			t16 = text("Make sure you have a Plex Media Server with a ");
    			a3 = element("a");
    			a3.textContent = "Music library";
    			t18 = text(", an active ");
    			a4 = element("a");
    			a4.textContent = "Plex Pass";
    			t20 = text(", and a free ");
    			a5 = element("a");
    			a5.textContent = "MusicBrainz account";
    			t22 = text(".");
    			t23 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Step 1";
    			t25 = text("\n\t\t\t\t\t\t\tEnter your ");
    			a6 = element("a");
    			a6.textContent = "ListenBrainz User Token";
    			t27 = text(" in the field below (don't worry, we won't store it):");
    			br = element("br");
    			t28 = space();
    			input = element("input");
    			t29 = space();
    			if (if_block0) if_block0.c();
    			t30 = space();
    			if (if_block1) if_block1.c();
    			t31 = space();
    			if (if_block2) if_block2.c();
    			t32 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "FAQ";
    			t34 = space();
    			h41 = element("h4");
    			h41.textContent = "Why do I need a Plex Pass?";
    			t36 = space();
    			p3 = element("p");
    			t37 = text("Eavesdrop.FM leverages Plex ");
    			a7 = element("a");
    			a7.textContent = "webhooks";
    			t39 = text(" to submit listens. Webhooks are a premium Plex feature, available to Plex Pass holders.");
    			t40 = space();
    			h42 = element("h4");
    			h42.textContent = "How do I find my ListenBrainz token?";
    			t42 = space();
    			p4 = element("p");
    			t43 = text("Your ListenBrainz token is available from your ListenBrainz ");
    			a8 = element("a");
    			a8.textContent = "user profile";
    			t45 = text(" page, under the User Token heading.");
    			t46 = space();
    			h43 = element("h4");
    			h43.textContent = "Why aren't offline listens submitted?";
    			t48 = space();
    			p5 = element("p");
    			p5.textContent = "Due to the way Plex webhooks work, listens that occurr historically can not be submitted. If your device is not able to connect to your Plex Server at the time that you listen to a track, it won't be submitted.";
    			t50 = space();
    			h44 = element("h4");
    			h44.textContent = "My listens aren't being submitted! Halp!";
    			t52 = space();
    			p6 = element("p");
    			p6.textContent = "Check the following:";
    			t54 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Both the Plex username and ListenBrainz token you entered above are correct.";
    			t56 = space();
    			li1 = element("li");
    			t57 = text("The webhook is saved in your ");
    			a9 = element("a");
    			a9.textContent = "account settings.";
    			t59 = space();
    			li2 = element("li");
    			li2.textContent = "In your Plex Server's network settings (under Settings > Network), ensure the server is permitted to send webhooks.";
    			t61 = space();
    			li3 = element("li");
    			li3.textContent = "Your Plex server is able to reach the internet.";
    			t63 = space();
    			p7 = element("p");
    			t64 = text("If you've checked all of the above and still can't submit your listens, raise a Github issue ");
    			a10 = element("a");
    			a10.textContent = "here";
    			t66 = text(" with as much information as possible.");
    			t67 = space();
    			h45 = element("h4");
    			h45.textContent = "What about my privacy?";
    			t69 = space();
    			p8 = element("p");
    			t70 = text("We ");
    			strong = element("strong");
    			strong.textContent = "do not";
    			t72 = text(" store any of your personal information. Your listening history, Plex username, and ListenBrainz token are encrypted in transit, and not retained by us.");
    			t73 = space();
    			footer = element("footer");
    			div8 = element("div");
    			div6 = element("div");
    			i1 = element("i");
    			t74 = text(" Built by ");
    			a11 = element("a");
    			a11.textContent = "Simon Buckley";
    			t76 = space();
    			div7 = element("div");
    			a12 = element("a");
    			i2 = element("i");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 21, 5, 439);
    			add_location(h1, file, 20, 4, 429);
    			attr_dev(i0, "class", "fas fa-heart");
    			add_location(i0, file, 23, 29, 507);
    			add_location(p0, file, 23, 4, 482);
    			attr_dev(div0, "class", "grid");
    			add_location(div0, file, 19, 3, 406);
    			attr_dev(a1, "href", "https://plex.tv");
    			add_location(a1, file, 25, 19, 569);
    			attr_dev(a2, "href", "https://listenbrainz.org");
    			add_location(a2, file, 25, 82, 632);
    			add_location(h3, file, 25, 3, 553);
    			attr_dev(header, "class", "justified");
    			add_location(header, file, 18, 2, 376);
    			add_location(h20, file, 30, 5, 779);
    			add_location(p1, file, 31, 5, 812);
    			add_location(div1, file, 29, 4, 768);
    			if (img.src !== (img_src_value = "img/hero.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "hero");
    			attr_dev(img, "alt", "Stylised person listening to music");
    			add_location(img, file, 33, 4, 1032);
    			attr_dev(section0, "class", "about grid justified");
    			add_location(section0, file, 28, 3, 725);
    			add_location(h21, file, 37, 5, 1191);
    			attr_dev(a3, "href", "https://www.plex.tv/your-media/music/");
    			add_location(a3, file, 38, 54, 1266);
    			attr_dev(a4, "href", "https://www.plex.tv/plex-pass/");
    			add_location(a4, file, 38, 131, 1343);
    			attr_dev(a5, "href", "https://musicbrainz.org/register");
    			add_location(a5, file, 38, 198, 1410);
    			add_location(p2, file, 38, 5, 1217);
    			add_location(h40, file, 41, 7, 1512);
    			attr_dev(a6, "href", "https://listenbrainz.org/profile/");
    			add_location(a6, file, 42, 18, 1546);
    			add_location(br, file, 42, 142, 1670);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65");
    			add_location(input, file, 43, 7, 1682);
    			add_location(div2, file, 40, 6, 1499);
    			add_location(div3, file, 39, 5, 1487);
    			attr_dev(div4, "class", "justified");
    			add_location(div4, file, 36, 4, 1162);
    			attr_dev(section1, "class", "get-started");
    			add_location(section1, file, 35, 3, 1128);
    			add_location(h22, file, 70, 4, 2799);
    			add_location(h41, file, 72, 4, 2817);
    			attr_dev(a7, "href", "https://www.plex.tv/plex-labs/#section7");
    			add_location(a7, file, 73, 35, 2888);
    			add_location(p3, file, 73, 4, 2857);
    			add_location(h42, file, 75, 4, 3048);
    			attr_dev(a8, "href", "https://listenbrainz.org/profile/");
    			add_location(a8, file, 76, 67, 3161);
    			add_location(p4, file, 76, 4, 3098);
    			add_location(h43, file, 78, 4, 3267);
    			add_location(p5, file, 79, 4, 3318);
    			add_location(h44, file, 81, 4, 3541);
    			add_location(p6, file, 82, 4, 3595);
    			add_location(li0, file, 84, 5, 3637);
    			attr_dev(a9, "href", "https://app.plex.tv/desktop#!/settings/webhooks");
    			add_location(a9, file, 85, 38, 3761);
    			add_location(li1, file, 85, 5, 3728);
    			add_location(li2, file, 86, 5, 3851);
    			add_location(li3, file, 87, 5, 3984);
    			add_location(ul, file, 83, 4, 3627);
    			attr_dev(a10, "title", "Eavesdrop.FM on Github");
    			attr_dev(a10, "href", "https://github.com/simonxciv/eavesdrop.fm");
    			add_location(a10, file, 89, 100, 4151);
    			add_location(p7, file, 89, 4, 4055);
    			add_location(h45, file, 91, 4, 4290);
    			add_location(strong, file, 92, 10, 4332);
    			add_location(p8, file, 92, 4, 4326);
    			attr_dev(section2, "class", "faq justified");
    			add_location(section2, file, 69, 3, 2763);
    			add_location(main, file, 27, 2, 715);
    			attr_dev(div5, "class", "content");
    			add_location(div5, file, 17, 1, 352);
    			attr_dev(i1, "class", "fad fa-hammer");
    			add_location(i1, file, 99, 4, 4606);
    			attr_dev(a11, "href", "https://smnbkly.co");
    			add_location(a11, file, 99, 43, 4645);
    			add_location(div6, file, 98, 3, 4596);
    			attr_dev(i2, "class", "fab fa-github");
    			add_location(i2, file, 103, 5, 4819);
    			attr_dev(a12, "title", "Eavesdrop.FM on Github");
    			attr_dev(a12, "href", "https://github.com/simonxciv/eavesdrop.fm");
    			add_location(a12, file, 102, 4, 4730);
    			attr_dev(div7, "class", "github");
    			add_location(div7, file, 101, 3, 4705);
    			attr_dev(div8, "class", "grid");
    			add_location(div8, file, 97, 2, 4574);
    			attr_dev(footer, "class", "justified");
    			add_location(footer, file, 96, 1, 4545);
    			attr_dev(div9, "class", "container");
    			add_location(div9, file, 16, 0, 327);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div5);
    			append_dev(div5, header);
    			append_dev(header, div0);
    			append_dev(div0, h1);
    			append_dev(h1, a0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, i0);
    			append_dev(header, t3);
    			append_dev(header, h3);
    			append_dev(h3, t4);
    			append_dev(h3, a1);
    			append_dev(h3, t6);
    			append_dev(h3, a2);
    			append_dev(div5, t8);
    			append_dev(div5, main);
    			append_dev(main, section0);
    			append_dev(section0, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t10);
    			append_dev(div1, p1);
    			append_dev(section0, t12);
    			append_dev(section0, img);
    			append_dev(main, t13);
    			append_dev(main, section1);
    			append_dev(section1, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t15);
    			append_dev(div4, p2);
    			append_dev(p2, t16);
    			append_dev(p2, a3);
    			append_dev(p2, t18);
    			append_dev(p2, a4);
    			append_dev(p2, t20);
    			append_dev(p2, a5);
    			append_dev(p2, t22);
    			append_dev(div4, t23);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h40);
    			append_dev(div2, t25);
    			append_dev(div2, a6);
    			append_dev(div2, t27);
    			append_dev(div2, br);
    			append_dev(div2, t28);
    			append_dev(div2, input);
    			set_input_value(input, /*token*/ ctx[0]);
    			append_dev(div3, t29);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t30);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t31);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(main, t32);
    			append_dev(main, section2);
    			append_dev(section2, h22);
    			append_dev(section2, t34);
    			append_dev(section2, h41);
    			append_dev(section2, t36);
    			append_dev(section2, p3);
    			append_dev(p3, t37);
    			append_dev(p3, a7);
    			append_dev(p3, t39);
    			append_dev(section2, t40);
    			append_dev(section2, h42);
    			append_dev(section2, t42);
    			append_dev(section2, p4);
    			append_dev(p4, t43);
    			append_dev(p4, a8);
    			append_dev(p4, t45);
    			append_dev(section2, t46);
    			append_dev(section2, h43);
    			append_dev(section2, t48);
    			append_dev(section2, p5);
    			append_dev(section2, t50);
    			append_dev(section2, h44);
    			append_dev(section2, t52);
    			append_dev(section2, p6);
    			append_dev(section2, t54);
    			append_dev(section2, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t56);
    			append_dev(ul, li1);
    			append_dev(li1, t57);
    			append_dev(li1, a9);
    			append_dev(ul, t59);
    			append_dev(ul, li2);
    			append_dev(ul, t61);
    			append_dev(ul, li3);
    			append_dev(section2, t63);
    			append_dev(section2, p7);
    			append_dev(p7, t64);
    			append_dev(p7, a10);
    			append_dev(p7, t66);
    			append_dev(section2, t67);
    			append_dev(section2, h45);
    			append_dev(section2, t69);
    			append_dev(section2, p8);
    			append_dev(p8, t70);
    			append_dev(p8, strong);
    			append_dev(p8, t72);
    			append_dev(div9, t73);
    			append_dev(div9, footer);
    			append_dev(footer, div8);
    			append_dev(div8, div6);
    			append_dev(div6, i1);
    			append_dev(div6, t74);
    			append_dev(div6, a11);
    			append_dev(div8, t76);
    			append_dev(div8, div7);
    			append_dev(div7, a12);
    			append_dev(a12, i2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*token*/ 1 && input.value !== /*token*/ ctx[0]) {
    				set_input_value(input, /*token*/ ctx[0]);
    			}

    			if (/*token*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*token*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t30);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*token*/ ctx[0] && /*user*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*token, user*/ 3) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, t31);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*token*/ ctx[0] && /*user*/ ctx[1] && /*copied*/ ctx[3]) {
    				if (if_block2) {
    					if (dirty & /*token, user, copied*/ 11) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let token, user, url;
    	let copied = false;
    	let success = false;
    	let clipboard = new Clipboard(".btn");

    	clipboard.on("success", e => {
    		$$invalidate(4, success = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input_input_handler() {
    		token = this.value;
    		$$invalidate(0, token);
    	}

    	function input_input_handler_1() {
    		user = this.value;
    		$$invalidate(1, user);
    	}

    	const click_handler = () => $$invalidate(3, copied = true);

    	$$self.$capture_state = () => ({
    		fade,
    		Clipboard,
    		token,
    		user,
    		url,
    		copied,
    		success,
    		clipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ("token" in $$props) $$invalidate(0, token = $$props.token);
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    		if ("url" in $$props) $$invalidate(2, url = $$props.url);
    		if ("copied" in $$props) $$invalidate(3, copied = $$props.copied);
    		if ("success" in $$props) $$invalidate(4, success = $$props.success);
    		if ("clipboard" in $$props) clipboard = $$props.clipboard;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*token, user*/ 3) {
    			 $$invalidate(2, url = "https://eavesdrop.fm/?id=" + token + "&user=" + user);
    		}
    	};

    	return [
    		token,
    		user,
    		url,
    		copied,
    		success,
    		input_input_handler,
    		input_input_handler_1,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
