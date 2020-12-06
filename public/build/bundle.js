
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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
            set_current_component(null);
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
            if (running_program || pending_program) {
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var svelte = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SvelteComponent: SvelteComponentDev,
        afterUpdate: afterUpdate,
        beforeUpdate: beforeUpdate,
        createEventDispatcher: createEventDispatcher,
        getContext: getContext,
        onDestroy: onDestroy,
        onMount: onMount,
        setContext: setContext,
        tick: tick
    });

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules/svelte-simple-modal/src/Modal.svelte generated by Svelte v3.29.7 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/svelte-simple-modal/src/Modal.svelte";

    // (234:0) {#if Component}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1(ctx);
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*Component*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-rnozr1");
    			attr_dev(div0, "style", /*cssContent*/ ctx[12]);
    			add_location(div0, file, 261, 8, 6292);
    			attr_dev(div1, "class", "window svelte-rnozr1");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[11]);
    			add_location(div1, file, 242, 6, 5660);
    			attr_dev(div2, "class", "window-wrap svelte-rnozr1");
    			add_location(div2, file, 241, 4, 5611);
    			attr_dev(div3, "class", "bg svelte-rnozr1");
    			attr_dev(div3, "style", /*cssBg*/ ctx[10]);
    			add_location(div3, file, 234, 2, 5445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[35](div1);
    			/*div2_binding*/ ctx[36](div2);
    			/*div3_binding*/ ctx[37](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[6])) /*onOpen*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[7])) /*onClose*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[8])) /*onOpened*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[9])) /*onClosed*/ ctx[9].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "click", /*handleOuterClick*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[0].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const switch_instance_changes = (dirty[0] & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 4096) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 2048) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 1024) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[15], /*state*/ ctx[0].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[14], /*state*/ ctx[0].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[15], /*state*/ ctx[0].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[14], /*state*/ ctx[0].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[35](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[36](null);
    			/*div3_binding*/ ctx[37](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(234:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (255:8) {#if state.closeButton}
    function create_if_block_1(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 1) show_if = !!/*isSvelteComponent*/ ctx[16](/*state*/ ctx[0].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(255:8) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (258:10) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-rnozr1");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[13]);
    			add_location(button, file, 258, 12, 6189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cssCloseButton*/ 8192) {
    				attr_dev(button, "style", /*cssCloseButton*/ ctx[13]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(258:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (256:10) {#if isSvelteComponent(state.closeButton)}
    function create_if_block_2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[0].closeButton;

    	function switch_props(ctx) {
    		return {
    			props: { onClose: /*close*/ ctx[17] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*state*/ ctx[0].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(256:10) {#if isSvelteComponent(state.closeButton)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[33], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[33], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	const baseSetContext = setContext;
    	const SvelteComponent = SvelteComponentDev;
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;

    	const defaultState = {
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");

    	// eslint-disable-next-line no-prototype-builtins
    	const isSvelteComponent = component => SvelteComponent && SvelteComponent.isPrototypeOf && SvelteComponent.isPrototypeOf(component);

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(1, Component = NewComponent);
    		$$invalidate(2, props = newProps);
    		$$invalidate(0, state = { ...defaultState, ...options });
    		$$invalidate(6, onOpen = callback.onOpen || toVoid);
    		$$invalidate(7, onClose = callback.onClose || toVoid);
    		$$invalidate(8, onOpened = callback.onOpened || toVoid);
    		$$invalidate(9, onClosed = callback.onClosed || toVoid);
    	};

    	const close = (callback = {}) => {
    		$$invalidate(7, onClose = callback.onClose || onClose);
    		$$invalidate(9, onClosed = callback.onClosed || onClosed);
    		$$invalidate(1, Component = null);
    		$$invalidate(2, props = null);
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === "Escape") {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === "Tab") {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterClick = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"styleCloseButton",
    		"setContext",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modalWindow = $$value;
    			$$invalidate(5, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrap = $$value;
    			$$invalidate(4, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(20, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(21, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(22, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(23, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(24, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(25, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(26, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(27, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(28, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(29, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(30, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(31, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(32, transitionWindowProps = $$props.transitionWindowProps);
    		if ("$$scope" in $$props) $$invalidate(33, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		svelte,
    		fade,
    		baseSetContext,
    		SvelteComponent,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		defaultState,
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		modalWindow,
    		camelCaseToDash,
    		toCssString,
    		isSvelteComponent,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeydown,
    		handleOuterClick,
    		cssBg,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(20, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(21, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(22, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(23, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(24, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(25, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(26, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(27, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(28, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(29, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(30, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(31, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(32, transitionWindowProps = $$props.transitionWindowProps);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ("modalWindow" in $$props) $$invalidate(5, modalWindow = $$props.modalWindow);
    		if ("onOpen" in $$props) $$invalidate(6, onOpen = $$props.onOpen);
    		if ("onClose" in $$props) $$invalidate(7, onClose = $$props.onClose);
    		if ("onOpened" in $$props) $$invalidate(8, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(9, onClosed = $$props.onClosed);
    		if ("cssBg" in $$props) $$invalidate(10, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(11, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(12, cssContent = $$props.cssContent);
    		if ("cssCloseButton" in $$props) $$invalidate(13, cssCloseButton = $$props.cssCloseButton);
    		if ("currentTransitionBg" in $$props) $$invalidate(14, currentTransitionBg = $$props.currentTransitionBg);
    		if ("currentTransitionWindow" in $$props) $$invalidate(15, currentTransitionWindow = $$props.currentTransitionWindow);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(10, cssBg = toCssString(state.styleBg));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(11, cssWindow = toCssString(state.styleWindow));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(12, cssContent = toCssString(state.styleContent));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(13, cssCloseButton = toCssString(state.styleCloseButton));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(14, currentTransitionBg = state.transitionBg);
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(15, currentTransitionWindow = state.transitionWindow);
    		}
    	};

    	return [
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		modalWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		cssBg,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		isSvelteComponent,
    		close,
    		handleKeydown,
    		handleOuterClick,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				key: 20,
    				closeButton: 21,
    				closeOnEsc: 22,
    				closeOnOuterClick: 23,
    				styleBg: 24,
    				styleWindow: 25,
    				styleContent: 26,
    				styleCloseButton: 27,
    				setContext: 28,
    				transitionBg: 29,
    				transitionBgProps: 30,
    				transitionWindow: 31,
    				transitionWindowProps: 32
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* public/assets/js.svg generated by Svelte v3.29.7 */

    function create_fragment$1(ctx) {
    	let svg;
    	let g0;
    	let polygon0;
    	let polygon1;
    	let polygon2;
    	let path0;
    	let path1;
    	let path2;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;

    	let svg_levels = [
    		{ version: "1.1" },
    		{ id: "Capa_1" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{
    			"xmlns:xlink": "http://www.w3.org/1999/xlink"
    		},
    		{ x: "0px" },
    		{ y: "0px" },
    		{ viewBox: "0 0 512 512" },
    		{
    			style: "enable-background:new 0 0 512 512;"
    		},
    		{ "xml:space": "preserve" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			polygon2 = svg_element("polygon");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					version: true,
    					id: true,
    					xmlns: true,
    					"xmlns:xlink": true,
    					x: true,
    					y: true,
    					viewBox: true,
    					style: true,
    					"xml:space": true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			g0 = claim_element(svg_nodes, "g", { transform: true }, 1);
    			var g0_nodes = children(g0);
    			polygon0 = claim_element(g0_nodes, "polygon", { style: true, points: true }, 1);
    			children(polygon0).forEach(detach);
    			polygon1 = claim_element(g0_nodes, "polygon", { style: true, points: true }, 1);
    			children(polygon1).forEach(detach);
    			polygon2 = claim_element(g0_nodes, "polygon", { style: true, points: true }, 1);
    			children(polygon2).forEach(detach);
    			path0 = claim_element(g0_nodes, "path", { d: true }, 1);
    			children(path0).forEach(detach);
    			path1 = claim_element(g0_nodes, "path", { d: true }, 1);
    			children(path1).forEach(detach);
    			path2 = claim_element(g0_nodes, "path", { d: true }, 1);
    			children(path2).forEach(detach);
    			g0_nodes.forEach(detach);
    			g1 = claim_element(svg_nodes, "g", {}, 1);
    			var g1_nodes = children(g1);
    			g1_nodes.forEach(detach);
    			g2 = claim_element(svg_nodes, "g", {}, 1);
    			var g2_nodes = children(g2);
    			g2_nodes.forEach(detach);
    			g3 = claim_element(svg_nodes, "g", {}, 1);
    			var g3_nodes = children(g3);
    			g3_nodes.forEach(detach);
    			g4 = claim_element(svg_nodes, "g", {}, 1);
    			var g4_nodes = children(g4);
    			g4_nodes.forEach(detach);
    			g5 = claim_element(svg_nodes, "g", {}, 1);
    			var g5_nodes = children(g5);
    			g5_nodes.forEach(detach);
    			g6 = claim_element(svg_nodes, "g", {}, 1);
    			var g6_nodes = children(g6);
    			g6_nodes.forEach(detach);
    			g7 = claim_element(svg_nodes, "g", {}, 1);
    			var g7_nodes = children(g7);
    			g7_nodes.forEach(detach);
    			g8 = claim_element(svg_nodes, "g", {}, 1);
    			var g8_nodes = children(g8);
    			g8_nodes.forEach(detach);
    			g9 = claim_element(svg_nodes, "g", {}, 1);
    			var g9_nodes = children(g9);
    			g9_nodes.forEach(detach);
    			g10 = claim_element(svg_nodes, "g", {}, 1);
    			var g10_nodes = children(g10);
    			g10_nodes.forEach(detach);
    			g11 = claim_element(svg_nodes, "g", {}, 1);
    			var g11_nodes = children(g11);
    			g11_nodes.forEach(detach);
    			g12 = claim_element(svg_nodes, "g", {}, 1);
    			var g12_nodes = children(g12);
    			g12_nodes.forEach(detach);
    			g13 = claim_element(svg_nodes, "g", {}, 1);
    			var g13_nodes = children(g13);
    			g13_nodes.forEach(detach);
    			g14 = claim_element(svg_nodes, "g", {}, 1);
    			var g14_nodes = children(g14);
    			g14_nodes.forEach(detach);
    			g15 = claim_element(svg_nodes, "g", {}, 1);
    			var g15_nodes = children(g15);
    			g15_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			set_style(polygon0, "fill", "#FFE100");
    			attr(polygon0, "points", "7.501,502.498 502.498,502.498 502.498,7.501 7.501,7.501 \t");
    			set_style(polygon1, "fill", "#FFA800");
    			attr(polygon1, "points", "476.895,502.498 502.498,502.498 502.498,7.501 476.895,7.501 \t");
    			set_style(polygon2, "fill", "#FFFFFF");
    			attr(polygon2, "points", "7.501,502.498 33.104,502.498 33.104,7.501 7.501,7.501 \t");
    			attr(path0, "d", "M502.499,511H7.501C2.806,511-1,507.194-1,502.499V7.501C-1,2.806,2.806-1,7.501-1h494.998C507.194-1,511,2.806,511,7.501\r\n\t\tv494.998C511,507.194,507.194,511,502.499,511z M16.002,493.998h477.996V16.002H16.002V493.998z");
    			attr(path1, "d", "M391.551,468.328c-42.334,0-76.777-34.442-76.777-76.777c0-4.695,3.807-8.501,8.501-8.501c4.695,0,8.501,3.806,8.501,8.501\r\n\t\tc0,32.959,26.815,59.775,59.775,59.775s59.775-26.815,59.775-59.775s-26.815-59.775-59.775-59.775\r\n\t\tc-42.334,0-76.777-34.442-76.777-76.777s34.442-76.776,76.777-76.776s76.777,34.442,76.777,76.777c0,4.695-3.806,8.501-8.501,8.501\r\n\t\tc-4.695,0-8.501-3.806-8.501-8.501c0-32.96-26.815-59.775-59.775-59.775S331.776,222.04,331.776,255\r\n\t\tc0,32.959,26.815,59.775,59.775,59.775c42.334,0,76.777,34.442,76.777,76.777S433.885,468.328,391.551,468.328z");
    			attr(path2, "d", "M212.328,468.328c-42.334,0-76.777-34.442-76.777-76.777c0-4.695,3.806-8.501,8.501-8.501s8.501,3.806,8.501,8.501\r\n\t\tc0,32.959,26.814,59.775,59.775,59.775s59.775-26.815,59.775-59.775V186.724c0-4.695,3.806-8.501,8.501-8.501\r\n\t\ts8.501,3.806,8.501,8.501v204.826C289.103,433.885,254.662,468.328,212.328,468.328z");
    			attr(g0, "transform", "translate(1 1)");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g0);
    			append(g0, polygon0);
    			append(g0, polygon1);
    			append(g0, polygon2);
    			append(g0, path0);
    			append(g0, path1);
    			append(g0, path2);
    			append(svg, g1);
    			append(svg, g2);
    			append(svg, g3);
    			append(svg, g4);
    			append(svg, g5);
    			append(svg, g6);
    			append(svg, g7);
    			append(svg, g8);
    			append(svg, g9);
    			append(svg, g10);
    			append(svg, g11);
    			append(svg, g12);
    			append(svg, g13);
    			append(svg, g14);
    			append(svg, g15);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ version: "1.1" },
    				{ id: "Capa_1" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{
    					"xmlns:xlink": "http://www.w3.org/1999/xlink"
    				},
    				{ x: "0px" },
    				{ y: "0px" },
    				{ viewBox: "0 0 512 512" },
    				{
    					style: "enable-background:new 0 0 512 512;"
    				},
    				{ "xml:space": "preserve" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Js extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* public/assets/cs.svg generated by Svelte v3.29.7 */

    function create_fragment$2(ctx) {
    	let svg;
    	let circle;
    	let path0;
    	let g0;
    	let path1;
    	let path2;
    	let g1;
    	let path3;
    	let path4;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;

    	let svg_levels = [
    		{ version: "1.1" },
    		{ id: "Layer_1" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{
    			"xmlns:xlink": "http://www.w3.org/1999/xlink"
    		},
    		{ x: "0px" },
    		{ y: "0px" },
    		{ viewBox: "0 0 512 512" },
    		{
    			style: "enable-background:new 0 0 512 512;"
    		},
    		{ "xml:space": "preserve" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			g0 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g1 = svg_element("g");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					version: true,
    					id: true,
    					xmlns: true,
    					"xmlns:xlink": true,
    					x: true,
    					y: true,
    					viewBox: true,
    					style: true,
    					"xml:space": true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			circle = claim_element(svg_nodes, "circle", { style: true, cx: true, cy: true, r: true }, 1);
    			children(circle).forEach(detach);
    			path0 = claim_element(svg_nodes, "path", { style: true, d: true }, 1);
    			children(path0).forEach(detach);
    			g0 = claim_element(svg_nodes, "g", {}, 1);
    			var g0_nodes = children(g0);
    			path1 = claim_element(g0_nodes, "path", { style: true, d: true }, 1);
    			children(path1).forEach(detach);
    			path2 = claim_element(g0_nodes, "path", { style: true, d: true }, 1);
    			children(path2).forEach(detach);
    			g0_nodes.forEach(detach);
    			g1 = claim_element(svg_nodes, "g", {}, 1);
    			var g1_nodes = children(g1);
    			path3 = claim_element(g1_nodes, "path", { style: true, d: true }, 1);
    			children(path3).forEach(detach);
    			path4 = claim_element(g1_nodes, "path", { style: true, d: true }, 1);
    			children(path4).forEach(detach);
    			g1_nodes.forEach(detach);
    			g2 = claim_element(svg_nodes, "g", {}, 1);
    			var g2_nodes = children(g2);
    			g2_nodes.forEach(detach);
    			g3 = claim_element(svg_nodes, "g", {}, 1);
    			var g3_nodes = children(g3);
    			g3_nodes.forEach(detach);
    			g4 = claim_element(svg_nodes, "g", {}, 1);
    			var g4_nodes = children(g4);
    			g4_nodes.forEach(detach);
    			g5 = claim_element(svg_nodes, "g", {}, 1);
    			var g5_nodes = children(g5);
    			g5_nodes.forEach(detach);
    			g6 = claim_element(svg_nodes, "g", {}, 1);
    			var g6_nodes = children(g6);
    			g6_nodes.forEach(detach);
    			g7 = claim_element(svg_nodes, "g", {}, 1);
    			var g7_nodes = children(g7);
    			g7_nodes.forEach(detach);
    			g8 = claim_element(svg_nodes, "g", {}, 1);
    			var g8_nodes = children(g8);
    			g8_nodes.forEach(detach);
    			g9 = claim_element(svg_nodes, "g", {}, 1);
    			var g9_nodes = children(g9);
    			g9_nodes.forEach(detach);
    			g10 = claim_element(svg_nodes, "g", {}, 1);
    			var g10_nodes = children(g10);
    			g10_nodes.forEach(detach);
    			g11 = claim_element(svg_nodes, "g", {}, 1);
    			var g11_nodes = children(g11);
    			g11_nodes.forEach(detach);
    			g12 = claim_element(svg_nodes, "g", {}, 1);
    			var g12_nodes = children(g12);
    			g12_nodes.forEach(detach);
    			g13 = claim_element(svg_nodes, "g", {}, 1);
    			var g13_nodes = children(g13);
    			g13_nodes.forEach(detach);
    			g14 = claim_element(svg_nodes, "g", {}, 1);
    			var g14_nodes = children(g14);
    			g14_nodes.forEach(detach);
    			g15 = claim_element(svg_nodes, "g", {}, 1);
    			var g15_nodes = children(g15);
    			g15_nodes.forEach(detach);
    			g16 = claim_element(svg_nodes, "g", {}, 1);
    			var g16_nodes = children(g16);
    			g16_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			set_style(circle, "fill", "#8C50D7");
    			attr(circle, "cx", "256");
    			attr(circle, "cy", "256");
    			attr(circle, "r", "256");
    			set_style(path0, "fill", "#733CB9");
    			attr(path0, "d", "M308.148,459.852c-141.384,0-256-114.616-256-256c0-57.393,18.889-110.372,50.785-153.067\r\n\tC40.452,97.465,0,172.007,0,256c0,141.384,114.616,256,256,256c83.993,0,158.535-40.452,205.215-102.933\r\n\tC418.52,440.964,365.541,459.852,308.148,459.852z");
    			set_style(path1, "fill", "#AA6EFF");
    			attr(path1, "d", "M293.972,79.468c-1.185,0-2.398-0.116-3.611-0.347c-11.24-2.171-22.796-3.269-34.361-3.269\r\n\t\tc-10.472,0-18.963-8.491-18.963-18.963S245.528,37.926,256,37.926c13.963,0,27.944,1.329,41.547,3.954\r\n\t\tc10.287,1.986,17.01,11.93,15.028,22.213C310.824,73.161,302.88,79.468,293.972,79.468z");
    			set_style(path2, "fill", "#AA6EFF");
    			attr(path2, "d", "M453.064,246.523c-9.278,0-17.389-6.824-18.741-16.282c-7.675-53.649-38.833-100.546-85.48-128.663\r\n\t\tc-8.972-5.408-11.861-17.061-6.453-26.028c5.399-8.981,17.047-11.866,26.028-6.453c56.444,34.023,94.149,90.801,103.444,155.774\r\n\t\tc1.491,10.366-5.713,19.973-16.083,21.458C454.871,246.458,453.963,246.523,453.064,246.523z");
    			set_style(path3, "fill", "#FFFFFF");
    			attr(path3, "d", "M379.259,248.889c6.546,0,11.852-5.306,11.852-11.852c0-6.546-5.306-11.852-11.852-11.852h-10.196\r\n\t\tl2.854-14.268c1.287-6.417-2.88-12.663-9.297-13.945c-6.482-1.292-12.658,2.875-13.945,9.297l-3.783,18.917h-23.237l2.854-14.268\r\n\t\tc1.287-6.417-2.88-12.663-9.297-13.945c-6.472-1.292-12.658,2.875-13.945,9.297l-3.783,18.917h-13.041\r\n\t\tc-6.546,0-11.852,5.306-11.852,11.852c0,6.546,5.306,11.852,11.852,11.852h8.3l-2.844,14.222h-14.937\r\n\t\tc-6.546,0-11.852,5.306-11.852,11.852c0,6.546,5.306,11.852,11.852,11.852h10.196l-2.854,14.268\r\n\t\tc-1.287,6.417,2.88,12.663,9.297,13.945c0.787,0.158,1.564,0.236,2.334,0.236c5.537,0,10.482-3.898,11.611-9.532l3.783-18.917\r\n\t\th23.237l-2.854,14.268c-1.287,6.417,2.88,12.663,9.297,13.945c0.787,0.158,1.564,0.236,2.334,0.236\r\n\t\tc5.537,0,10.482-3.898,11.611-9.532l3.783-18.917h13.041c6.546,0,11.852-5.306,11.852-11.852c0-6.546-5.306-11.852-11.852-11.852\r\n\t\th-8.3l2.844-14.222H379.259z M337.307,263.111h-23.237l2.844-14.222h23.237L337.307,263.111z");
    			set_style(path4, "fill", "#FFFFFF");
    			attr(path4, "d", "M199.111,192c11.176,0,21.945,3.393,31.138,9.81c5.389,3.759,12.768,2.436,16.51-2.936\r\n\t\tc3.74-5.365,2.426-12.755-2.936-16.5c-13.203-9.212-28.657-14.078-44.712-14.078c-43.13,0-78.222,35.092-78.222,78.222v18.963\r\n\t\tc0,43.13,35.092,78.222,78.222,78.222c16.056,0,31.509-4.865,44.713-14.079c5.361-3.745,6.676-11.135,2.936-16.5\r\n\t\tc-3.75-5.361-11.121-6.69-16.51-2.936c-9.195,6.418-19.963,9.811-31.14,9.811c-30.065,0-54.519-24.459-54.519-54.519v-18.963\r\n\t\tC144.593,216.459,169.047,192,199.111,192z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, circle);
    			append(svg, path0);
    			append(svg, g0);
    			append(g0, path1);
    			append(g0, path2);
    			append(svg, g1);
    			append(g1, path3);
    			append(g1, path4);
    			append(svg, g2);
    			append(svg, g3);
    			append(svg, g4);
    			append(svg, g5);
    			append(svg, g6);
    			append(svg, g7);
    			append(svg, g8);
    			append(svg, g9);
    			append(svg, g10);
    			append(svg, g11);
    			append(svg, g12);
    			append(svg, g13);
    			append(svg, g14);
    			append(svg, g15);
    			append(svg, g16);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ version: "1.1" },
    				{ id: "Layer_1" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{
    					"xmlns:xlink": "http://www.w3.org/1999/xlink"
    				},
    				{ x: "0px" },
    				{ y: "0px" },
    				{ viewBox: "0 0 512 512" },
    				{
    					style: "enable-background:new 0 0 512 512;"
    				},
    				{ "xml:space": "preserve" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Cs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    var icons = {
      JS: Js,
      CS: Cs
    };

    /* src/components/Icon.svelte generated by Svelte v3.29.7 */

    const file$1 = "src/components/Icon.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let iconimage;
    	let current;
    	iconimage = new /*IconImage*/ ctx[0]({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(iconimage.$$.fragment);
    			attr_dev(div, "class", /*className*/ ctx[1]);
    			add_location(div, file$1, 6, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(iconimage, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*className*/ 2) {
    				attr_dev(div, "class", /*className*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(iconimage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	let { IconImage } = $$props;
    	let { class: className } = $$props;
    	const writable_props = ["IconImage", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("IconImage" in $$props) $$invalidate(0, IconImage = $$props.IconImage);
    		if ("class" in $$props) $$invalidate(1, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({ IconImage, className });

    	$$self.$inject_state = $$props => {
    		if ("IconImage" in $$props) $$invalidate(0, IconImage = $$props.IconImage);
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [IconImage, className];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { IconImage: 0, class: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*IconImage*/ ctx[0] === undefined && !("IconImage" in props)) {
    			console.warn("<Icon> was created without expected prop 'IconImage'");
    		}

    		if (/*className*/ ctx[1] === undefined && !("class" in props)) {
    			console.warn("<Icon> was created without expected prop 'class'");
    		}
    	}

    	get IconImage() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set IconImage(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Code.svelte generated by Svelte v3.29.7 */

    const file$2 = "src/components/Code.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let pre;
    	let code_1;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			pre = element("pre");
    			code_1 = element("code");
    			t = text(/*code*/ ctx[0]);
    			add_location(code_1, file$2, 6, 2, 101);
    			attr_dev(pre, "class", "language-javascript code svelte-65fw7");
    			add_location(pre, file$2, 5, 4, 60);
    			attr_dev(div, "class", "code svelte-65fw7");
    			add_location(div, file$2, 4, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, pre);
    			append_dev(pre, code_1);
    			append_dev(code_1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*code*/ 1) set_data_dev(t, /*code*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Code", slots, []);
    	let { code } = $$props;
    	const writable_props = ["code"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    	};

    	$$self.$capture_state = () => ({ code });

    	$$self.$inject_state = $$props => {
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [code];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { code: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*code*/ ctx[0] === undefined && !("code" in props)) {
    			console.warn("<Code> was created without expected prop 'code'");
    		}
    	}

    	get code() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set code(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Card.svelte generated by Svelte v3.29.7 */
    const file$3 = "src/components/Card.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let icon;
    	let t0;
    	let div0;
    	let t2;
    	let p;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: {
    				IconImage: icons[/*lang*/ ctx[0]],
    				class: "cata-icon"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = `${/*q*/ ctx[2]}`;
    			t2 = space();
    			p = element("p");
    			p.textContent = `${/*name*/ ctx[1]}`;
    			attr_dev(div0, "class", "q svelte-asp8v1");
    			add_location(div0, file$3, 30, 4, 664);
    			add_location(p, file$3, 31, 4, 693);
    			attr_dev(div1, "class", "card svelte-asp8v1");
    			add_location(div1, file$3, 28, 0, 566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(icon, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*openModal*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	const { open } = getContext("simple-modal");
    	let { data } = $$props;
    	const { lang, name, q, code } = data;

    	const openModal = () => open(Code, { code }, {
    		styleWindow: {
    			width: "100%",
    			maxWidth: "720px",
    			backgroundColor: "#303133"
    		},
    		styleContent: { padding: "2px", borderRadius: "4px" },
    		styleCloseButton: { display: "none" }
    	});

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		icons,
    		Icon,
    		Code,
    		getContext,
    		open,
    		data,
    		lang,
    		name,
    		q,
    		code,
    		openModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lang, name, q, openModal, data];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[4] === undefined && !("data" in props)) {
    			console.warn("<Card> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var links = [
    	{
    		url: "https://github.com/v-excelsior",
    		text: "Github"
    	},
    	{
    		url: "https://t.me/v_excelsior",
    		text: "Telegram"
    	},
    	{
    		url: "https://www.codewars.com/users/Sicely",
    		text: "Codewars"
    	}
    ];

    /* src/components/Links.svelte generated by Svelte v3.29.7 */
    const file$4 = "src/components/Links.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (7:8) {#each links as link}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*link*/ ctx[0].text + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[0].url);
    			attr_dev(a, "class", " svelte-1tqzfzp");
    			add_location(a, file$4, 8, 16, 167);
    			attr_dev(li, "class", "link svelte-1tqzfzp");
    			add_location(li, file$4, 7, 12, 133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:8) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let ul;
    	let each_value = links;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "links-list svelte-1tqzfzp");
    			add_location(ul, file$4, 5, 4, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 0) {
    				each_value = links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Links", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Links> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ links });
    	return [];
    }

    class Links extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Links",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ModalButton.svelte generated by Svelte v3.29.7 */
    const file$5 = "src/components/ModalButton.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+";
    			attr_dev(button, "class", "modal-button svelte-1yoelvi");
    			add_location(button, file$5, 7, 4, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ModalButton", slots, []);
    	const { close } = getContext("simple-modal");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModalButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, close });
    	return [close];
    }

    class ModalButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalButton",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.29.7 */
    const file$6 = "src/components/Header.svelte";

    function create_fragment$8(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Codewars | stats";
    			t2 = space();
    			button = element("button");
    			button.textContent = "v - excelsior";
    			attr_dev(img, "class", "header_icon svelte-eegk1l");
    			if (img.src !== (img_src_value = "assets/logo-36.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "CodeWars logo");
    			add_location(img, file$6, 22, 16, 523);
    			attr_dev(span, "class", "header_heading svelte-eegk1l");
    			add_location(span, file$6, 23, 16, 610);
    			attr_dev(div0, "class", "header_main svelte-eegk1l");
    			add_location(div0, file$6, 21, 12, 481);
    			attr_dev(button, "class", "header_name svelte-eegk1l");
    			attr_dev(button, "title", "My socials");
    			add_location(button, file$6, 26, 12, 695);
    			attr_dev(div1, "class", "header_content container svelte-eegk1l");
    			add_location(div1, file$6, 20, 8, 430);
    			attr_dev(header, "class", "header svelte-eegk1l");
    			add_location(header, file$6, 19, 4, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div1, t2);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openModal*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const { open } = getContext("simple-modal");

    	const openModal = () => open(Links, {}, {
    		styleWindow: {
    			width: "100%",
    			maxWidth: "360px",
    			backgroundColor: "#303133"
    		},
    		closeButton: ModalButton
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		Links,
    		ModalButton,
    		open,
    		openModal
    	});

    	return [openModal];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const code = `var spiralize = function (size) {
    function floors(n) {
        const tower = []
        for (let i = 0; i < n; i++) {
            const floor = []
            for (let j = 0; j < n; j++) floor.push(0)
            tower.push(floor)
        }
        return tower
    }
    function solution(tower) {
        let x = tower[0].length - 1, isBreak = false, y = x, ys = 0, xs = 2, xc = 0, yc = 0
        const t = Math.floor(tower[0].length - 1) / 2
        for (let draw = 0; draw < t; draw++) {
            let counter = 0;
            for (; yc < y; yc++) { tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            for (; xc < x; xc++) { tower[xc][yc] = 1; counter++ }
            for (; yc > ys; yc--) { isBreak = true; tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            for (; xc > xs; xc--) { isBreak = true; tower[xc][yc] = 1; counter++ }
            if (counter < 2) { isBreak = true; break; } else { counter = 0 }
            ys += 2; xs += 2;
            tower[xc][yc] = 1
            if (++draw != t) {
                yc++;
                tower[xc][yc] = 1
                yc++;
                y -= 2; x -= 2;
            }
        }
        if (isBreak) tower[xc][yc] = 1
        if (tower[0].length % 2 == 0) tower[++xc][yc] = 1
        return tower
    }
    return solution(floors(size))
}`;

    var make_a_spiral = {
      lang: 'JS',
      name: 'Make a spiral',
      q   : 3,
      code
    };

    const code$1 = `function permutations(string) {
    function permutation(array) {
        if (array.length > 1) {
            let firstElement = array[0]
            let returnedArray = permutation(array.slice(1))
            let permutedArray = []
            let temporaryArray = []
            let elementLength = returnedArray[0].length
            for (let i = 0; i < returnedArray.length; i++)
                for (let j = 0; j <= elementLength; j++) {
                    temporaryArray = returnedArray[i].slice(0)
                    temporaryArray.splice(j, 0, firstElement)
                    permutedArray.push(temporaryArray)
                }
            return permutedArray
        } else {
            return [array]
        }
    }
    let arr = string.split('')
    let answ = permutation(arr)
    answ = [...new Set(answ.map((el) => el.join('')))]
    return answ
}`;

    var permutations = {
      lang: 'JS',
      name: 'Permutation',
      q   : 4,
      code: code$1
    };

    const code$2 = `function solution(list){
 let answ = []
 for (let i = 0; i < list.length; i++){
   let cur = list[i]
   let dop
   while( list[i] === (list[i+1] - 1)){
     i++
     dop = list[i]
   }
   console.log(cur)
   if((cur + 1) < dop) {
     answ.push(cur+ '-' +dop)
   } else {
   answ.push(cur)
   dop?answ.push(dop):''
   }
  }
return answ.join(',')
}`;

    var range_extration = {
      lang: 'JS',
      name:'The Observed Pin',
      q: 4,
      code: code$2
    };

    const code$3 = `function solution(input, markers) {
  input = input.split('\n')
  for (let mark of markers){
    input.forEach( (el,index) =>{
      let pivot = el.indexOf(mark)
      input[index] =  el.substring(0, pivot !== -1 ? pivot : 999).trim()
    })
  }
  input = input.join('\n').trim()
  console.log(input)
  return input
}`;

    var strip_comments = {
      lang: 'JS',
      name:'Strip Coments',
      q:4,
      code: code$3
    };

    const code$4 = `function sumIntervals(intervals){
  intervals.sort((i1,i2) => i1[0] - i2[0])
  for(let i = 1; i < intervals.length;){
    if(intervals[i][1] <= intervals[i-1][1]){
      intervals.splice(i,1)
      continue
    }
    if(intervals[i][0] < intervals[i-1][1]){
      intervals[i-1][1] = intervals[i][1]
      intervals.splice(i,1)
    }
    i++
  }
  return intervals.reduce((acc,el) => acc += el[1] - el[0],0)
}`;

    var sum_of_intervals = {
        lang:'JS',
        name: 'Sum of Intervals',
        q: 4,
        code: code$4
    };

    const code$5 = `function getPINs(observed) {
  if (observed === '') return []
  const neighbours = [
    ['8', '0'], ['1', '2', '4'], ['1', '2', '3', '5'], ['2', '3', '6'],
    ['1', '4', '5', '7'], ['2', '4', '5', '6', '8'], ['3', '5', '6', '9'],
    ['4', '7', '8'], ['5', '7', '8', '9', '0'], ['6', '8', '9']
  ]

  const brutArray = [...observed].map(el => el = neighbours[+el])

  const answ = []

  function brutForse(el, array) {
    for (let i = 0; i < array[0].length; i++) {
      if (array.length > 1) {
        brutForse(el + array[0][i], array.slice(1))
      }
      answ.push(el + array[0][i])
    }
  }

  brutForse('', brutArray)
}`;

    var the_observed_pin = {
      lang: 'JS',
      name:'The Observed Pin',
      q: 4,
      code: code$5
    };

    const code$6 = `function array_diff_very_fast(a, b) {
  b = new Set(b)
  return a.filter( el = !b.has(el))
}`;

    var array_diff_hero = {
      lang: 'JS',
      name: 'Array diff hero',
      q   : 5,
      code: code$6
    };

    const code$7 = `function josephus(items,k){
  let answ = [],pos = 0
  while(items.length){
    for (let i = 1; i < k; i++){
    items.push(items.shift())
    }
    answ.push(items.shift())
  }
  return answ
}`;

    var josephus_permutation = {
      lang: 'JS',
      name: 'Josephus permutation',
      q   : 5,
      code: code$7
    };

    const code$8 = `function towerBuilder(nFloors) {
  let floor = ''.repeat(nFloors
  2 - 1
)
  let tower = []
  tower.push(floor)
  for (let i = 1; i  nFloors;
  i++
)
  {
    floor = floor.replace(, ' ').split('').reverse().join('').replace(, ' ')
    tower.push(floor)
  }
  return tower.reverse()
}`;

    var build_tower = {
      lang: 'JS',
      name: 'Build Tower',
      q   : 6,
      code: code$8
    };

    const code$9 = `function duplicateEncode(word){
   word = word.toLowerCase()
   let answ = []
   for (let el of word){
     if (word.split('').filter(symb => symb == el).length > 1){
       answ.push(')')
     } else {
       answ.push('(')
     }
   }
   return answ.join('')
}`;

    var duplicate_encoder = {
      lang: 'JS',
      name: 'Duplicate encoder',
      q   : 6,
      code: code$9
    };

    const code$a = `function findNumber(array) {
  const sum = (array.length + 1) * (array.length + 2) / 2
  const actualSun = array.reduce((acc,el) => acc + el, 0)
  
  return sum - actualSun
}`;

    var number_zoo_patrol = {
      lang: 'JS',
      name: 'Number Zoo Patrol',
      q   : 6,
      code: code$a
    };

    const code$b = `const nums = [
  '     |  |',
  ' _  _||_ ',
  ' _  _| _|',
  '   |_|  |',
  ' _ |_  _|',
  ' _ |_ |_|',
  ' _   |  |',
  ' _ |_||_|',
  ' _ |_| _|'
]

function parseBankAccount(bankAccount) {
    let answ = []
    let rows = bankAccount.split('\n')
    let lg = rows[0].length / 3
    for (let i = 0; i < lg; i++){
    let number = rows[0].slice(0,3) + rows[1].slice(0,3) + rows[2].slice(0,3)
    for (let y = 0; y < 3; y++){
      rows[y] = rows[y].slice(3)
    }
    answ.push(nums.indexOf(number)+1)
  }
  return parseInt(answ.join(''))
}`;

    var parse_bank_account_number = {
      lang: 'JS',
      name: 'Parse bank account number',
      q   : 6,
      code: code$b
    };

    const code$c = `function splitAndAdd(arr, n) {
  for ( let i = 0; i < n; i++){
  let pivot = Math.floor(arr.length) / 2
  let arr1 = arr.slice(0,pivot).reverse()
  let arr2 = arr.slice(pivot).reverse()
  arr2 = arr2.map((el,index) => el = el + (arr1[index] ?arr1[index] : 0))
  arr = arr2.reverse()
  }
  return arr
}`;

    var split_and_add = {
      lang: 'JS',
      name:'Split and then add both sides of an array together',
      q:6,
      code: code$c
    };

    const code$d = `function songDecoder(song){
  return song.split('WUB').filter(el => el !== '').join(' ')
}`;

    var dubstep = {
      lang: 'JS',
      name: 'Make a spiral',
      q   : 3,
      code: code$d
    };

    const code$e = `const uniqueInOrder = function(iterable){
  if (!iterable.length) return []
  if (!Array.isArray(iterable)) iterable = iterable.split('')
  let answ = []
  answ.push(iterable[0])
  for (let i = 1; i< iterable.length; i++) {
    if (iterable[i] != iterable[i-1]) answ.push(iterable[i])
  }
  return answ
}`;

    var unique_in_order = {
      lang: 'JS',
      name: 'Unique In Order',
      q   : 6,
      code: code$e
    };

    const code$f =`const order = w => w.split(' ').sort((a,b) => a.match(/\d+/) - b.match(/\d+/)).join(' ')
`;

    var your_order_please = {
      lang: 'JS',
      name: 'Your order, please',
      q: 6,
      code: code$f
    };

    const code$g = `function declareWinner(fighter1, fighter2, firstAttacker) {
  const f1 = Math.ceil(fighter1.health / fighter2.damagePerAttack)
  const f2 = Math.ceil(fighter2.health / fighter1.damagePerAttack)
  return f1 < f2 ? fighter2.name : (f2 < f1 ? fighter1.name : firstAttacker)
}`;

    var two_fighters_one_winner = {
      lang: 'JS',
      name: 'Two fighters, one winner',
      q   : 7,
      code: code$g
    };

    var catas = [
      make_a_spiral,
      permutations,
      range_extration,
      strip_comments,
      sum_of_intervals,
      the_observed_pin,
      array_diff_hero,
      josephus_permutation,
      build_tower,
      duplicate_encoder,
      number_zoo_patrol,
      parse_bank_account_number,
      split_and_add,
      dubstep,
      unique_in_order,
      your_order_please,
      two_fighters_one_winner
    ];

    /* src/components/Gallery.svelte generated by Svelte v3.29.7 */
    const file$7 = "src/components/Gallery.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (7:4) {#each catas as cata}
    function create_each_block$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: { data: /*cata*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(7:4) {#each catas as cata}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	let each_value = catas;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container grid-gallery");
    			add_location(div, file$7, 5, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*catas*/ 0) {
    				each_value = catas;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Card, catas });
    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$8 = "src/App.svelte";

    // (8:1) <Modal>
    function create_default_slot(ctx) {
    	let header;
    	let t;
    	let gallery;
    	let current;
    	header = new Header({ $$inline: true });
    	gallery = new Gallery({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(gallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(gallery, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(gallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:1) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(modal.$$.fragment);
    			attr_dev(main, "class", "app-content svelte-1yq94x9");
    			add_location(main, file$8, 6, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(modal, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(modal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Modal, Card, Header, Gallery });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = ".container {\n  padding: 0 10px;\n  width: 100%;\n  max-width: 1280px;\n  margin: 0 auto; }\n\n.grid-gallery {\n  display: grid;\n  width: 100%;\n  gap: 12px;\n  padding: 10px;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }\n\n.cata-icon {\n  position: absolute;\n  right: 4px;\n  top: 4px;\n  width: 24px; }\n\n* {\n  padding: 0;\n  margin: 0;\n  box-sizing: border-box; }\n\nbody, button {\n  font-family: 'Main'; }\n";
    styleInject(css_248z);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

    var prism = createCommonjsModule(function (module) {
    /* PrismJS 1.22.0
    https://prismjs.com/download.html#themes=prism-dark&languages=clike+javascript */
    var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(u){var c=/\blang(?:uage)?-([\w-]+)\b/i,n=0,_={manual:u.Prism&&u.Prism.manual,disableWorkerMessageHandler:u.Prism&&u.Prism.disableWorkerMessageHandler,util:{encode:function e(n){return n instanceof M?new M(n.type,e(n.content),n.alias):Array.isArray(n)?n.map(e):n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function t(e,r){var a,n;switch(r=r||{},_.util.type(e)){case"Object":if(n=_.util.objId(e),r[n])return r[n];for(var i in a={},r[n]=a,e)e.hasOwnProperty(i)&&(a[i]=t(e[i],r));return a;case"Array":return n=_.util.objId(e),r[n]?r[n]:(a=[],r[n]=a,e.forEach(function(e,n){a[n]=t(e,r);}),a);default:return e}},getLanguage:function(e){for(;e&&!c.test(e.className);)e=e.parentElement;return e?(e.className.match(c)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(e){var n=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack)||[])[1];if(n){var t=document.getElementsByTagName("script");for(var r in t)if(t[r].src==n)return t[r]}return null}},isActive:function(e,n,t){for(var r="no-"+n;e;){var a=e.classList;if(a.contains(n))return !0;if(a.contains(r))return !1;e=e.parentElement;}return !!t}},languages:{extend:function(e,n){var t=_.util.clone(_.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(t,e,n,r){var a=(r=r||_.languages)[t],i={};for(var l in a)if(a.hasOwnProperty(l)){if(l==e)for(var o in n)n.hasOwnProperty(o)&&(i[o]=n[o]);n.hasOwnProperty(l)||(i[l]=a[l]);}var s=r[t];return r[t]=i,_.languages.DFS(_.languages,function(e,n){n===s&&e!=t&&(this[e]=i);}),i},DFS:function e(n,t,r,a){a=a||{};var i=_.util.objId;for(var l in n)if(n.hasOwnProperty(l)){t.call(n,l,n[l],r||l);var o=n[l],s=_.util.type(o);"Object"!==s||a[i(o)]?"Array"!==s||a[i(o)]||(a[i(o)]=!0,e(o,t,l,a)):(a[i(o)]=!0,e(o,t,null,a));}}},plugins:{},highlightAll:function(e,n){_.highlightAllUnder(document,e,n);},highlightAllUnder:function(e,n,t){var r={callback:t,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};_.hooks.run("before-highlightall",r),r.elements=Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)),_.hooks.run("before-all-elements-highlight",r);for(var a,i=0;a=r.elements[i++];)_.highlightElement(a,!0===n,r.callback);},highlightElement:function(e,n,t){var r=_.util.getLanguage(e),a=_.languages[r];e.className=e.className.replace(c,"").replace(/\s+/g," ")+" language-"+r;var i=e.parentElement;i&&"pre"===i.nodeName.toLowerCase()&&(i.className=i.className.replace(c,"").replace(/\s+/g," ")+" language-"+r);var l={element:e,language:r,grammar:a,code:e.textContent};function o(e){l.highlightedCode=e,_.hooks.run("before-insert",l),l.element.innerHTML=l.highlightedCode,_.hooks.run("after-highlight",l),_.hooks.run("complete",l),t&&t.call(l.element);}if(_.hooks.run("before-sanity-check",l),!l.code)return _.hooks.run("complete",l),void(t&&t.call(l.element));if(_.hooks.run("before-highlight",l),l.grammar)if(n&&u.Worker){var s=new Worker(_.filename);s.onmessage=function(e){o(e.data);},s.postMessage(JSON.stringify({language:l.language,code:l.code,immediateClose:!0}));}else o(_.highlight(l.code,l.grammar,l.language));else o(_.util.encode(l.code));},highlight:function(e,n,t){var r={code:e,grammar:n,language:t};return _.hooks.run("before-tokenize",r),r.tokens=_.tokenize(r.code,r.grammar),_.hooks.run("after-tokenize",r),M.stringify(_.util.encode(r.tokens),r.language)},tokenize:function(e,n){var t=n.rest;if(t){for(var r in t)n[r]=t[r];delete n.rest;}var a=new i;return z(a,a.head,e),function e(n,t,r,a,i,l){for(var o in r)if(r.hasOwnProperty(o)&&r[o]){var s=r[o];s=Array.isArray(s)?s:[s];for(var u=0;u<s.length;++u){if(l&&l.cause==o+","+u)return;var c=s[u],g=c.inside,f=!!c.lookbehind,h=!!c.greedy,d=c.alias;if(h&&!c.pattern.global){var v=c.pattern.toString().match(/[imsuy]*$/)[0];c.pattern=RegExp(c.pattern.source,v+"g");}for(var p=c.pattern||c,m=a.next,y=i;m!==t.tail&&!(l&&y>=l.reach);y+=m.value.length,m=m.next){var k=m.value;if(t.length>n.length)return;if(!(k instanceof M)){var b,x=1;if(h){if(!(b=W(p,y,n,f)))break;var w=b.index,A=b.index+b[0].length,P=y;for(P+=m.value.length;P<=w;)m=m.next,P+=m.value.length;if(P-=m.value.length,y=P,m.value instanceof M)continue;for(var S=m;S!==t.tail&&(P<A||"string"==typeof S.value);S=S.next)x++,P+=S.value.length;x--,k=n.slice(y,P),b.index-=y;}else if(!(b=W(p,0,k,f)))continue;var w=b.index,E=b[0],O=k.slice(0,w),L=k.slice(w+E.length),N=y+k.length;l&&N>l.reach&&(l.reach=N);var j=m.prev;O&&(j=z(t,j,O),y+=O.length),I(t,j,x);var C=new M(o,g?_.tokenize(E,g):E,d,E);m=z(t,j,C),L&&z(t,m,L),1<x&&e(n,t,r,m.prev,y,{cause:o+","+u,reach:N});}}}}}(e,a,n,a.head,0),function(e){var n=[],t=e.head.next;for(;t!==e.tail;)n.push(t.value),t=t.next;return n}(a)},hooks:{all:{},add:function(e,n){var t=_.hooks.all;t[e]=t[e]||[],t[e].push(n);},run:function(e,n){var t=_.hooks.all[e];if(t&&t.length)for(var r,a=0;r=t[a++];)r(n);}},Token:M};function M(e,n,t,r){this.type=e,this.content=n,this.alias=t,this.length=0|(r||"").length;}function W(e,n,t,r){e.lastIndex=n;var a=e.exec(t);if(a&&r&&a[1]){var i=a[1].length;a.index+=i,a[0]=a[0].slice(i);}return a}function i(){var e={value:null,prev:null,next:null},n={value:null,prev:e,next:null};e.next=n,this.head=e,this.tail=n,this.length=0;}function z(e,n,t){var r=n.next,a={value:t,prev:n,next:r};return n.next=a,r.prev=a,e.length++,a}function I(e,n,t){for(var r=n.next,a=0;a<t&&r!==e.tail;a++)r=r.next;(n.next=r).prev=n,e.length-=a;}if(u.Prism=_,M.stringify=function n(e,t){if("string"==typeof e)return e;if(Array.isArray(e)){var r="";return e.forEach(function(e){r+=n(e,t);}),r}var a={type:e.type,content:n(e.content,t),tag:"span",classes:["token",e.type],attributes:{},language:t},i=e.alias;i&&(Array.isArray(i)?Array.prototype.push.apply(a.classes,i):a.classes.push(i)),_.hooks.run("wrap",a);var l="";for(var o in a.attributes)l+=" "+o+'="'+(a.attributes[o]||"").replace(/"/g,"&quot;")+'"';return "<"+a.tag+' class="'+a.classes.join(" ")+'"'+l+">"+a.content+"</"+a.tag+">"},!u.document)return u.addEventListener&&(_.disableWorkerMessageHandler||u.addEventListener("message",function(e){var n=JSON.parse(e.data),t=n.language,r=n.code,a=n.immediateClose;u.postMessage(_.highlight(r,_.languages[t],t)),a&&u.close();},!1)),_;var e=_.util.currentScript();function t(){_.manual||_.highlightAll();}if(e&&(_.filename=e.src,e.hasAttribute("data-manual")&&(_.manual=!0)),!_.manual){var r=document.readyState;"loading"===r||"interactive"===r&&e&&e.defer?document.addEventListener("DOMContentLoaded",t):window.requestAnimationFrame?window.requestAnimationFrame(t):window.setTimeout(t,16);}return _}(_self);module.exports&&(module.exports=Prism),"undefined"!=typeof commonjsGlobal&&(commonjsGlobal.Prism=Prism);
    Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/};
    Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,lookbehind:!0}],keyword:[{pattern:/((?:^|})\s*)(?:catch|finally)\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],number:/\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,function:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/,Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:Prism.languages.regex},"regex-flags":/[a-z]+$/,"regex-delimiter":/^\/|\/$/}},"function-variable":{pattern:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),Prism.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\${|}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.js=Prism.languages.javascript;
    });

    var css_248z$1 = "/* PrismJS 1.22.0\nhttps://prismjs.com/download.html#themes=prism-tomorrow&languages=markup+css+clike+javascript */\n/**\n * prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML\n * Based on https://github.com/chriskempson/tomorrow-theme\n * @author Rose Pritchard\n */\n\ncode[class*=\"language-\"],\npre[class*=\"language-\"] {\n\tcolor: #ccc;\n\tbackground: none;\n\tfont-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;\n\tfont-size: 1em;\n\ttext-align: left;\n\twhite-space: pre;\n\tword-spacing: normal;\n\tword-break: normal;\n\tword-wrap: normal;\n\tline-height: 1.5;\n\n\t-moz-tab-size: 4;\n\t-o-tab-size: 4;\n\ttab-size: 4;\n\n\t-webkit-hyphens: none;\n\t-moz-hyphens: none;\n\t-ms-hyphens: none;\n\thyphens: none;\n\n}\n\n/* Code blocks */\npre[class*=\"language-\"] {\n\tpadding: 1em;\n\tmargin: 0;\n\toverflow: auto;\n}\n\n:not(pre) > code[class*=\"language-\"],\npre[class*=\"language-\"] {\n\tbackground: #2d2d2d;\n}\n\n/* Inline code */\n:not(pre) > code[class*=\"language-\"] {\n\tpadding: .1em;\n\tborder-radius: .3em;\n\twhite-space: normal;\n}\n\n.token.comment,\n.token.block-comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n\tcolor: #999;\n}\n\n.token.punctuation {\n\tcolor: #ccc;\n}\n\n.token.tag,\n.token.attr-name,\n.token.namespace,\n.token.deleted {\n\tcolor: #e2777a;\n}\n\n.token.function-name {\n\tcolor: #6196cc;\n}\n\n.token.boolean,\n.token.number,\n.token.function {\n\tcolor: #f08d49;\n}\n\n.token.property,\n.token.class-name,\n.token.constant,\n.token.symbol {\n\tcolor: #f8c555;\n}\n\n.token.selector,\n.token.important,\n.token.atrule,\n.token.keyword,\n.token.builtin {\n\tcolor: #cc99cd;\n}\n\n.token.string,\n.token.char,\n.token.attr-value,\n.token.regex,\n.token.variable {\n\tcolor: #7ec699;\n}\n\n.token.operator,\n.token.entity,\n.token.url {\n\tcolor: #67cdcc;\n}\n\n.token.important,\n.token.bold {\n\tfont-weight: bold;\n}\n.token.italic {\n\tfont-style: italic;\n}\n\n.token.entity {\n\tcursor: help;\n}\n\n.token.inserted {\n\tcolor: green;\n}\n\n";
    styleInject(css_248z$1);

    const app = new App({ target: document.body });

    return app;

}());
//# sourceMappingURL=bundle.js.map
