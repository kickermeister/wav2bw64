
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
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
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.34.0' }, detail)));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const fileInfo = writable({filename: "", path: "", channels: 0});

    function getAudioProgrammeStructure(){
      return {
        id: ID(),
        name: "Audio Programme 1", 
        loudness: -23,
        apItems: [],
        language: "eng"
      }
    }

    function ID(){
      // Math.random should be unique because of its seeding algorithm.
      // Convert it to base 36 (numbers + letters), and grab the first 9 characters after the decimal.
      return Math.random().toString(36).substr(2, 9);
    }


    function Store() {
      const { subscribe, set, update } = writable(
        [
          // {
          //   id: ID(),
          //   name: "Audio Programme 1",
          //   loudness: -23,
          //   apItems: [
          //     {id: ID(), name: "My Object 1" , type: "Object", routing: "1 - 1", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
          //     {id: ID(), name: "Stereo Bed", type: "0+2+0", routing: "1 - 2"},
          //   ],
          //   language: 'de'
          // },
          // {
          //   id: ID(),
          //   name: "Audio Programme 2",
          //   loudness: -23,
          //   apItems: [
          //     {id: ID(), name: "Surround Bed", type: "0+5+0", routing: "1 - 6"},
          //     {id: ID(), name: "Music", type: "0+2+0", routing: "1 - 2"},
          //     {id: ID(), name: "Dialog", type: "Object", routing: "7 - 7", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
          //     {id: ID(), name: "Effect", type: "Object", routing: "8 - 8", object_parameter: {position: {azimuth: 0, elevation: 0, distance: 1.0}}},
          //     {id: ID(), name: "Headphones", type: "Binaural", routing: "1 - 2"} 
          //   ],
          //   language: 'en'
          // },
        ]
      );

      return {
        subscribe,
        update,
        set,
        addAP: () => update(adm => {
          return [...adm, getAudioProgrammeStructure()];
        }),
        addItem: (apToUpdate, itemType) => update(adm => {
          let ap = adm.find(ap => ap.id === apToUpdate.id);
          let itemStructure = {type: itemType,
                                 routing: [],
                                 id: ID(),
                                 importance: 10,
                                 interactivity: {
                                   onOffInteract: false,
                                   gainInteract: false,
                                   gainInteractionRange: [-6.0, 6.0],
                                   positionInteract: false,
                                   azRange: [-30.0, 30.0],
                                   elRange: [-30.0, 30.0],
                                 }};
          if (itemType === "Object"){
            itemStructure["object_parameter"] = {position: {azimuth: 0.0, elevation: 0.0, distance: 1.0}};
          }
          ap.apItems.push(itemStructure);
          return adm;
        })
      }
    }
    const ADMStore = Store();

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /**
     * Click Outside
     * @param {Node} node
     */
    var ClickOutside = (node, _options = {}) => {
      const options = { include: [], ..._options };

      function detect({ target }) {
        if (!node.contains(target) || options.include.some((i) => target.isSameNode(i))) {
          node.dispatchEvent(new CustomEvent('clickOutside'));
        }
      }
      document.addEventListener('click', detect, { passive: true, capture: true });
      return {
        destroy() {
          document.removeEventListener('click', detect);
        },
      };
    };

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/MaterialApp/MaterialApp.svelte generated by Svelte v3.34.0 */

    const file$C = "../../../svelte-materialify/packages/svelte-materialify/src/components/MaterialApp/MaterialApp.svelte";

    function create_fragment$F(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file$C, 13408, 0, 255852);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment$F.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format$2(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format$2(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format$2(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Icon/Icon.svelte generated by Svelte v3.34.0 */
    const file$B = "../../../svelte-materialify/packages/svelte-materialify/src/components/Icon/Icon.svelte";

    // (66:2) {#if path}
    function create_if_block$k(ctx) {
    	let svg;
    	let path_1;
    	let svg_viewBox_value;
    	let if_block = /*label*/ ctx[10] && create_if_block_1$a(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[9]);
    			add_location(path_1, file$B, 71, 6, 1639);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[2]);
    			attr_dev(svg, "height", /*height*/ ctx[3]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5]);
    			add_location(svg, file$B, 66, 4, 1512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$a(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 512) {
    				attr_dev(path_1, "d", /*path*/ ctx[9]);
    			}

    			if (dirty & /*width*/ 4) {
    				attr_dev(svg, "width", /*width*/ ctx[2]);
    			}

    			if (dirty & /*height*/ 8) {
    				attr_dev(svg, "height", /*height*/ ctx[3]);
    			}

    			if (dirty & /*viewWidth, viewHeight*/ 48 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$k.name,
    		type: "if",
    		source: "(66:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {#if label}
    function create_if_block_1$a(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[10]);
    			add_location(title, file$B, 73, 10, 1685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1024) set_data_dev(t, /*label*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(73:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$E(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[9] && create_if_block$k(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[0]);
    			attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			attr_dev(i, "style", /*style*/ ctx[11]);
    			toggle_class(i, "spin", /*spin*/ ctx[7]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			add_location(i, file$B, 56, 0, 1290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[1],
    					"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$k(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[0])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 1024) {
    				attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			}

    			if (!current || dirty & /*disabled*/ 256) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(i, "style", /*style*/ ctx[11]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 66) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[1],
    				"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    			});

    			if (dirty & /*klass, spin*/ 129) {
    				toggle_class(i, "spin", /*spin*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 257) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { viewWidth = "24" } = $$props;
    	let { viewHeight = "24" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"size",
    		"width",
    		"height",
    		"viewWidth",
    		"viewHeight",
    		"rotate",
    		"spin",
    		"disabled",
    		"path",
    		"label",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		width,
    		height,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		size,
    		width,
    		height,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {
    			class: 0,
    			size: 1,
    			width: 2,
    			height: 3,
    			viewWidth: 4,
    			viewHeight: 5,
    			rotate: 6,
    			spin: 7,
    			disabled: 8,
    			path: 9,
    			label: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$E.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewWidth() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewWidth(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewHeight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewHeight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Button/Button.svelte generated by Svelte v3.34.0 */
    const file$A = "../../../svelte-materialify/packages/svelte-materialify/src/components/Button/Button.svelte";

    function create_fragment$D(ctx) {
    	let button_1;
    	let span;
    	let button_1_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		{
    			class: button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[14] },
    		{ style: /*style*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[11] },
    		{ "aria-disabled": /*disabled*/ ctx[11] },
    		/*$$restProps*/ ctx[17]
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button_1 = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$A, 241, 2, 5930);
    			set_attributes(button_1, button_1_data);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    			add_location(button_1, file$A, 221, 0, 5500);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*button_1_binding*/ ctx[21](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button_1, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button_1, /*ripple*/ ctx[15])),
    					listen_dev(button_1, "click", /*click_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				(!current || dirty & /*size, klass*/ 34 && button_1_class_value !== (button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1])) && { class: button_1_class_value },
    				(!current || dirty & /*type*/ 16384) && { type: /*type*/ ctx[14] },
    				(!current || dirty & /*style*/ 65536) && { style: /*style*/ ctx[16] },
    				(!current || dirty & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] },
    				(!current || dirty & /*disabled*/ 2048) && { "aria-disabled": /*disabled*/ ctx[11] },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 12288) Class_action.update.call(null, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 32768) Ripple_action.update.call(null, /*ripple*/ ctx[15]);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style","button"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;
    	let { button = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(1, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$new_props) $$invalidate(0, button = $$new_props.button);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		button
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$props) $$invalidate(0, button = $$new_props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		button,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_1_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {
    			class: 1,
    			fab: 2,
    			icon: 3,
    			block: 4,
    			size: 5,
    			tile: 6,
    			text: 7,
    			depressed: 8,
    			outlined: 9,
    			rounded: 10,
    			disabled: 11,
    			active: 12,
    			activeClass: 13,
    			type: 14,
    			ripple: 15,
    			style: 16,
    			button: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$D.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/ItemGroup/ItemGroup.svelte generated by Svelte v3.34.0 */
    const file$z = "../../../svelte-materialify/packages/svelte-materialify/src/components/ItemGroup/ItemGroup.svelte";

    function create_fragment$C(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$z, 61, 0, 1572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$C($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemGroup", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!mandatory || value.length > 1) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else if (typeof val === "number") {
    				$$invalidate(3, value = val);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(multiple ? val : [val]);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max",
    		"role",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 8) {
    			valueStore.set(value);
    		}

    		if ($$self.$$.dirty & /*value*/ 8) {
    			dispatch("change", value);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$C.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass$1(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass$1(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Input/Input.svelte generated by Svelte v3.34.0 */
    const file$y = "../../../svelte-materialify/packages/svelte-materialify/src/components/Input/Input.svelte";
    const get_append_outer_slot_changes$4 = dirty => ({});
    const get_append_outer_slot_context$4 = ctx => ({});
    const get_messages_slot_changes = dirty => ({});
    const get_messages_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes$4 = dirty => ({});
    const get_prepend_outer_slot_context$4 = ctx => ({});

    function create_fragment$B(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_outer_slot_template = /*#slots*/ ctx[9]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_prepend_outer_slot_context$4);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const messages_slot_template = /*#slots*/ ctx[9].messages;
    	const messages_slot = create_slot(messages_slot_template, ctx, /*$$scope*/ ctx[8], get_messages_slot_context);
    	const append_outer_slot_template = /*#slots*/ ctx[9]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_append_outer_slot_context$4);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_outer_slot) prepend_outer_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (messages_slot) messages_slot.c();
    			t2 = space();
    			if (append_outer_slot) append_outer_slot.c();
    			attr_dev(div0, "class", "s-input__slot");
    			add_location(div0, file$y, 349, 4, 9880);
    			attr_dev(div1, "class", "s-input__details");
    			add_location(div1, file$y, 352, 4, 9938);
    			attr_dev(div2, "class", "s-input__control");
    			add_location(div2, file$y, 348, 2, 9845);
    			attr_dev(div3, "class", div3_class_value = "s-input " + /*klass*/ ctx[0]);
    			attr_dev(div3, "style", /*style*/ ctx[7]);
    			toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			toggle_class(div3, "error", /*error*/ ctx[5]);
    			toggle_class(div3, "success", /*success*/ ctx[6]);
    			toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$y, 338, 0, 9627);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (messages_slot) {
    				messages_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_outer_slot) {
    				append_outer_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div3, /*success*/ ctx[6]
    				? "success"
    				: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_prepend_outer_slot_changes$4, get_prepend_outer_slot_context$4);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (messages_slot) {
    				if (messages_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(messages_slot, messages_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_messages_slot_changes, get_messages_slot_context);
    				}
    			}

    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_append_outer_slot_changes$4, get_append_outer_slot_context$4);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div3_class_value !== (div3_class_value = "s-input " + /*klass*/ ctx[0])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div3, "style", /*style*/ ctx[7]);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*success, error, color*/ 98) TextColor_action.update.call(null, /*success*/ ctx[6]
    			? "success"
    			: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]);

    			if (dirty & /*klass, dense*/ 5) {
    				toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			}

    			if (dirty & /*klass, error*/ 33) {
    				toggle_class(div3, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*klass, success*/ 65) {
    				toggle_class(div3, "success", /*success*/ ctx[6]);
    			}

    			if (dirty & /*klass, readonly*/ 9) {
    				toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			transition_in(default_slot, local);
    			transition_in(messages_slot, local);
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			transition_out(default_slot, local);
    			transition_out(messages_slot, local);
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (messages_slot) messages_slot.d(detaching);
    			if (append_outer_slot) append_outer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, ['prepend-outer','default','messages','append-outer']);
    	let { class: klass = "" } = $$props;
    	let { color = null } = $$props;
    	let { dense = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "color", "dense", "readonly", "disabled", "error", "success", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		color,
    		dense,
    		readonly,
    		disabled,
    		error,
    		success,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, color, dense, readonly, disabled, error, success, style, $$scope, slots];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {
    			class: 0,
    			color: 1,
    			dense: 2,
    			readonly: 3,
    			disabled: 4,
    			error: 5,
    			success: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$B.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var uid = (len) => {
      let str = '';
      let num = len || 11;
      while (num--) str += HEX[(Math.random() * 36) | 0];
      return str;
    };

    var closeIcon = 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/TextField/TextField.svelte generated by Svelte v3.34.0 */
    const file$x = "../../../svelte-materialify/packages/svelte-materialify/src/components/TextField/TextField.svelte";
    const get_append_outer_slot_changes$3 = dirty => ({});
    const get_append_outer_slot_context$3 = ctx => ({ slot: "append-outer" });

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    const get_append_slot_changes$2 = dirty => ({});
    const get_append_slot_context$2 = ctx => ({});
    const get_clear_icon_slot_changes$1 = dirty => ({});
    const get_clear_icon_slot_context$1 = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_prepend_slot_changes$2 = dirty => ({});
    const get_prepend_slot_context$2 = ctx => ({});
    const get_prepend_outer_slot_changes$3 = dirty => ({});
    const get_prepend_outer_slot_context$3 = ctx => ({ slot: "prepend-outer" });

    // (74:2) <slot slot="prepend-outer" name="prepend-outer" />   <div     class="s-text-field__wrapper"     class:filled     class:solo     class:outlined     class:flat     class:rounded>     <!-- Slot for prepend inside the input. -->     <slot name="prepend" />      <div class="s-text-field__input">       <label for={id}
    function create_prepend_outer_slot$3(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[33]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_outer_slot_context$3);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_prepend_outer_slot_changes$3, get_prepend_outer_slot_context$3);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$3.name,
    		type: "slot",
    		source: "(74:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <div     class=\\\"s-text-field__wrapper\\\"     class:filled     class:solo     class:outlined     class:flat     class:rounded>     <!-- Slot for prepend inside the input. -->     <slot name=\\\"prepend\\\" />      <div class=\\\"s-text-field__input\\\">       <label for={id}",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#if clearable && value !== ''}
    function create_if_block_1$9(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[33]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[43], get_clear_icon_slot_context$1);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$x, 112, 6, 2562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(clear_icon_slot, clear_icon_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_clear_icon_slot_changes$1, get_clear_icon_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(112:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (115:32)            
    function fallback_block$6(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$6.name,
    		type: "fallback",
    		source: "(115:32)            ",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#each messages as message}
    function create_each_block_1$4(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$x, 127, 33, 2955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 131072 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(128:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block$5(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$x, 128, 59, 3044);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(129:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if counter}
    function create_if_block$j(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[16]);
    			add_location(span, file$x, 130, 17, 3102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 65536) set_data_dev(t2, /*counter*/ ctx[16]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$j.name,
    		type: "if",
    		source: "(131:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (125:2) <div slot="messages">
    function create_messages_slot$1(ctx) {
    	let div0;
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[17];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[16] && create_if_block$j(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[15]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(span, file$x, 126, 6, 2902);
    			add_location(div1, file$x, 125, 4, 2890);
    			attr_dev(div0, "slot", "messages");
    			add_location(div0, file$x, 124, 2, 2864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 32768) set_data_dev(t0, /*hint*/ ctx[15]);

    			if (dirty[0] & /*messages*/ 131072) {
    				each_value_1 = /*messages*/ ctx[17];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448) {
    				each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[16]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$j(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot$1.name,
    		type: "slot",
    		source: "(125:2) <div slot=\\\"messages\\\">",
    		ctx
    	});

    	return block;
    }

    // (135:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot$3(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[33]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_append_outer_slot_context$3);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_append_outer_slot_changes$3, get_append_outer_slot_context$3);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$3.name,
    		type: "slot",
    		source: "(135:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Input   class="s-text-field {klass}"   {color}   {dense}   {readonly}   {disabled}   {error}   {success}   {style}>
    function create_default_slot$g(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let label;
    	let t2;
    	let t3;
    	let input;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[33].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_slot_context$2);
    	const default_slot_template = /*#slots*/ ctx[33].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);
    	const content_slot_template = /*#slots*/ ctx[33].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[43], get_content_slot_context);

    	let input_levels = [
    		{ type: "text" },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ id: /*id*/ ctx[20] },
    		{ readOnly: /*readonly*/ ctx[12] },
    		{ disabled: /*disabled*/ ctx[13] },
    		/*$$restProps*/ ctx[28]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[11] && /*value*/ ctx[0] !== "" && create_if_block_1$9(ctx);
    	const append_slot_template = /*#slots*/ ctx[33].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[43], get_append_slot_context$2);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (content_slot) content_slot.c();
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			if (append_slot) append_slot.c();
    			t6 = space();
    			t7 = space();
    			attr_dev(label, "for", /*id*/ ctx[20]);
    			toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			add_location(label, file$x, 85, 6, 1939);
    			set_attributes(input, input_data);
    			add_location(input, file$x, 90, 6, 2125);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$x, 84, 4, 1899);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			add_location(div1, file$x, 74, 2, 1694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t2);

    			if (content_slot) {
    				content_slot.m(div0, null);
    			}

    			append_dev(div0, t3);
    			append_dev(div0, input);
    			/*input_binding*/ ctx[41](input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div1, t4);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t5);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[42]),
    					listen_dev(input, "focus", /*onFocus*/ ctx[24], false, false, false),
    					listen_dev(input, "blur", /*onBlur*/ ctx[25], false, false, false),
    					listen_dev(input, "input", /*onInput*/ ctx[27], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[34], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[35], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[36], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[37], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[38], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[39], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[40], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_prepend_slot_changes$2, get_prepend_slot_context$2);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[43], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 1048576) {
    				attr_dev(label, "for", /*id*/ ctx[20]);
    			}

    			if (dirty[0] & /*labelActive*/ 8388608) {
    				toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*placeholder*/ 16384) && { placeholder: /*placeholder*/ ctx[14] },
    				(!current || dirty[0] & /*id*/ 1048576) && { id: /*id*/ ctx[20] },
    				(!current || dirty[0] & /*readonly*/ 4096) && { readOnly: /*readonly*/ ctx[12] },
    				(!current || dirty[0] & /*disabled*/ 8192) && { disabled: /*disabled*/ ctx[13] },
    				dirty[0] & /*$$restProps*/ 268435456 && /*$$restProps*/ ctx[28]
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[11] && /*value*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 2049) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_append_slot_changes$2, get_append_slot_context$2);
    				}
    			}

    			if (dirty[0] & /*filled*/ 32) {
    				toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			}

    			if (dirty[0] & /*solo*/ 64) {
    				toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			}

    			if (dirty[0] & /*outlined*/ 128) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			}

    			if (dirty[0] & /*flat*/ 256) {
    				toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			}

    			if (dirty[0] & /*rounded*/ 1024) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(content_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(content_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			/*input_binding*/ ctx[41](null);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$g.name,
    		type: "slot",
    		source: "(64:0) <Input   class=\\\"s-text-field {klass}\\\"   {color}   {dense}   {readonly}   {disabled}   {error}   {success}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field " + /*klass*/ ctx[3],
    				color: /*color*/ ctx[4],
    				dense: /*dense*/ ctx[9],
    				readonly: /*readonly*/ ctx[12],
    				disabled: /*disabled*/ ctx[13],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[19],
    				style: /*style*/ ctx[21],
    				$$slots: {
    					default: [create_default_slot$g],
    					"append-outer": [create_append_outer_slot$3],
    					messages: [create_messages_slot$1],
    					"prepend-outer": [create_prepend_outer_slot$3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*klass*/ 8) input_changes.class = "s-text-field " + /*klass*/ ctx[3];
    			if (dirty[0] & /*color*/ 16) input_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*dense*/ 512) input_changes.dense = /*dense*/ ctx[9];
    			if (dirty[0] & /*readonly*/ 4096) input_changes.readonly = /*readonly*/ ctx[12];
    			if (dirty[0] & /*disabled*/ 8192) input_changes.disabled = /*disabled*/ ctx[13];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 524288) input_changes.success = /*success*/ ctx[19];
    			if (dirty[0] & /*style*/ 2097152) input_changes.style = /*style*/ ctx[21];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, clearable, placeholder, id, readonly, disabled, $$restProps, inputElement, labelActive*/ 282590693 | dirty[1] & /*$$scope*/ 4096) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let labelActive;

    	const omit_props_names = [
    		"class","value","color","filled","solo","outlined","flat","dense","rounded","clearable","readonly","disabled","placeholder","hint","counter","messages","rules","errorCount","validateOnBlur","error","success","id","style","inputElement","validate"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots("TextField", slots, [
    		'prepend-outer','prepend','default','content','clear-icon','append','append-outer'
    	]);

    	let { class: klass = "" } = $$props;
    	let { value = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { counter = false } = $$props;
    	let { messages = [] } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	let focused = false;
    	let errorMessages = [];

    	function validate() {
    		$$invalidate(22, errorMessages = rules.map(r => r(value)).filter(r => typeof r === "string"));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}

    		return error;
    	}

    	function onFocus() {
    		$$invalidate(32, focused = true);
    	}

    	function onBlur() {
    		$$invalidate(32, focused = false);
    		if (validateOnBlur) validate();
    	}

    	function clear() {
    		$$invalidate(0, value = "");
    	}

    	function onInput() {
    		if (!validateOnBlur) validate();
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(28, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(3, klass = $$new_props.class);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("filled" in $$new_props) $$invalidate(5, filled = $$new_props.filled);
    		if ("solo" in $$new_props) $$invalidate(6, solo = $$new_props.solo);
    		if ("outlined" in $$new_props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ("flat" in $$new_props) $$invalidate(8, flat = $$new_props.flat);
    		if ("dense" in $$new_props) $$invalidate(9, dense = $$new_props.dense);
    		if ("rounded" in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("clearable" in $$new_props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ("readonly" in $$new_props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ("disabled" in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ("placeholder" in $$new_props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(15, hint = $$new_props.hint);
    		if ("counter" in $$new_props) $$invalidate(16, counter = $$new_props.counter);
    		if ("messages" in $$new_props) $$invalidate(17, messages = $$new_props.messages);
    		if ("rules" in $$new_props) $$invalidate(29, rules = $$new_props.rules);
    		if ("errorCount" in $$new_props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$new_props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(19, success = $$new_props.success);
    		if ("id" in $$new_props) $$invalidate(20, id = $$new_props.id);
    		if ("style" in $$new_props) $$invalidate(21, style = $$new_props.style);
    		if ("inputElement" in $$new_props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ("$$scope" in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		klass,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		rules,
    		errorCount,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		inputElement,
    		focused,
    		errorMessages,
    		validate,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		labelActive
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(3, klass = $$new_props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("filled" in $$props) $$invalidate(5, filled = $$new_props.filled);
    		if ("solo" in $$props) $$invalidate(6, solo = $$new_props.solo);
    		if ("outlined" in $$props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ("flat" in $$props) $$invalidate(8, flat = $$new_props.flat);
    		if ("dense" in $$props) $$invalidate(9, dense = $$new_props.dense);
    		if ("rounded" in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("clearable" in $$props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ("readonly" in $$props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ("disabled" in $$props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ("placeholder" in $$props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(15, hint = $$new_props.hint);
    		if ("counter" in $$props) $$invalidate(16, counter = $$new_props.counter);
    		if ("messages" in $$props) $$invalidate(17, messages = $$new_props.messages);
    		if ("rules" in $$props) $$invalidate(29, rules = $$new_props.rules);
    		if ("errorCount" in $$props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(19, success = $$new_props.success);
    		if ("id" in $$props) $$invalidate(20, id = $$new_props.id);
    		if ("style" in $$props) $$invalidate(21, style = $$new_props.style);
    		if ("inputElement" in $$props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ("focused" in $$props) $$invalidate(32, focused = $$new_props.focused);
    		if ("errorMessages" in $$props) $$invalidate(22, errorMessages = $$new_props.errorMessages);
    		if ("labelActive" in $$props) $$invalidate(23, labelActive = $$new_props.labelActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*placeholder, value*/ 16385 | $$self.$$.dirty[1] & /*focused*/ 2) {
    			$$invalidate(23, labelActive = !!placeholder || value || focused);
    		}
    	};

    	return [
    		value,
    		error,
    		inputElement,
    		klass,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		errorCount,
    		success,
    		id,
    		style,
    		errorMessages,
    		labelActive,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		validate,
    		focused,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		keypress_handler,
    		keydown_handler,
    		keyup_handler,
    		input_binding,
    		input_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$A,
    			create_fragment$A,
    			safe_not_equal,
    			{
    				class: 3,
    				value: 0,
    				color: 4,
    				filled: 5,
    				solo: 6,
    				outlined: 7,
    				flat: 8,
    				dense: 9,
    				rounded: 10,
    				clearable: 11,
    				readonly: 12,
    				disabled: 13,
    				placeholder: 14,
    				hint: 15,
    				counter: 16,
    				messages: 17,
    				rules: 29,
    				errorCount: 18,
    				validateOnBlur: 30,
    				error: 1,
    				success: 19,
    				id: 20,
    				style: 21,
    				inputElement: 2,
    				validate: 31
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$A.name
    		});
    	}

    	get class() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validate() {
    		return this.$$.ctx[31];
    	}

    	set validate(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Textarea/Textarea.svelte generated by Svelte v3.34.0 */
    const file$w = "../../../svelte-materialify/packages/svelte-materialify/src/components/Textarea/Textarea.svelte";
    const get_append_outer_slot_changes$2 = dirty => ({});
    const get_append_outer_slot_context$2 = ctx => ({ slot: "append-outer" });

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    const get_append_slot_changes$1 = dirty => ({});
    const get_append_slot_context$1 = ctx => ({});
    const get_clear_icon_slot_changes = dirty => ({});
    const get_clear_icon_slot_context = ctx => ({});
    const get_prepend_slot_changes$1 = dirty => ({});
    const get_prepend_slot_context$1 = ctx => ({});
    const get_prepend_outer_slot_changes$2 = dirty => ({});
    const get_prepend_outer_slot_context$2 = ctx => ({ slot: "prepend-outer" });

    // (76:2) <slot slot="prepend-outer" name="prepend-outer" />   <div     class="s-text-field__wrapper"     class:filled     class:solo     class:outlined     class:flat     class:rounded     class:autogrow     class:no-resize={noResize || autogrow}
    function create_prepend_outer_slot$2(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[32]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[39], get_prepend_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_prepend_outer_slot_changes$2, get_prepend_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$2.name,
    		type: "slot",
    		source: "(76:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <div     class=\\\"s-text-field__wrapper\\\"     class:filled     class:solo     class:outlined     class:flat     class:rounded     class:autogrow     class:no-resize={noResize || autogrow}",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#if clearable && value !== ''}
    function create_if_block_1$8(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[32]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[39], get_clear_icon_slot_context);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$w, 112, 6, 2628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(clear_icon_slot, clear_icon_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_clear_icon_slot_changes, get_clear_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(112:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (115:32)            
    function fallback_block$5(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(115:32)            ",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#each messages as message}
    function create_each_block_1$3(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[41] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$w, 127, 33, 3021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 524288 && t_value !== (t_value = /*message*/ ctx[41] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(128:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block$4(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[41] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$w, 128, 59, 3110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 17039360 && t_value !== (t_value = /*message*/ ctx[41] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(129:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if counter}
    function create_if_block$i(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[17]);
    			add_location(span, file$w, 130, 17, 3168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 131072) set_data_dev(t2, /*counter*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$i.name,
    		type: "if",
    		source: "(131:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (125:2) <div slot="messages">
    function create_messages_slot(ctx) {
    	let div0;
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[19];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[24].slice(0, /*errorCount*/ ctx[18]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[17] && create_if_block$i(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[16]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(span, file$w, 126, 6, 2968);
    			add_location(div1, file$w, 125, 4, 2956);
    			attr_dev(div0, "slot", "messages");
    			add_location(div0, file$w, 124, 2, 2930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 65536) set_data_dev(t0, /*hint*/ ctx[16]);

    			if (dirty[0] & /*messages*/ 524288) {
    				each_value_1 = /*messages*/ ctx[19];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 17039360) {
    				each_value = /*errorMessages*/ ctx[24].slice(0, /*errorCount*/ ctx[18]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[17]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$i(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot.name,
    		type: "slot",
    		source: "(125:2) <div slot=\\\"messages\\\">",
    		ctx
    	});

    	return block;
    }

    // (135:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot$2(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[32]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[39], get_append_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_append_outer_slot_changes$2, get_append_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$2.name,
    		type: "slot",
    		source: "(135:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Input   class="s-text-field s-textarea"   {color}   {readonly}   {disabled}   {error}   {success}   {style}>
    function create_default_slot$f(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let label;
    	let t2;
    	let textarea_1;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[32].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[39], get_prepend_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[32].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[39], null);

    	let textarea_1_levels = [
    		{ type: "text" },
    		{ rows: /*rows*/ ctx[11] },
    		{ placeholder: /*placeholder*/ ctx[15] },
    		{ id: /*id*/ ctx[21] },
    		{ readOnly: /*readonly*/ ctx[10] },
    		{ disabled: /*disabled*/ ctx[14] },
    		/*$$restProps*/ ctx[29]
    	];

    	let textarea_1_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_1_data = assign(textarea_1_data, textarea_1_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[9] && /*value*/ ctx[0] !== "" && create_if_block_1$8(ctx);
    	const append_slot_template = /*#slots*/ ctx[32].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[39], get_append_slot_context$1);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			textarea_1 = element("textarea");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			if (append_slot) append_slot.c();
    			t5 = space();
    			t6 = space();
    			attr_dev(label, "for", /*id*/ ctx[21]);
    			toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			add_location(label, file$w, 89, 6, 2151);
    			set_attributes(textarea_1, textarea_1_data);
    			add_location(textarea_1, file$w, 92, 6, 2233);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$w, 88, 4, 2111);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[8]);
    			toggle_class(div1, "autogrow", /*autogrow*/ ctx[12]);
    			toggle_class(div1, "no-resize", /*noResize*/ ctx[13] || /*autogrow*/ ctx[12]);
    			add_location(div1, file$w, 76, 2, 1844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, textarea_1);
    			/*textarea_1_binding*/ ctx[37](textarea_1);
    			set_input_value(textarea_1, /*value*/ ctx[0]);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t4);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[38]),
    					listen_dev(textarea_1, "focus", /*onFocus*/ ctx[25], false, false, false),
    					listen_dev(textarea_1, "blur", /*onBlur*/ ctx[26], false, false, false),
    					listen_dev(textarea_1, "input", /*onInput*/ ctx[28], false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler*/ ctx[33], false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler*/ ctx[34], false, false, false),
    					listen_dev(textarea_1, "input", /*input_handler*/ ctx[35], false, false, false),
    					listen_dev(textarea_1, "change", /*change_handler*/ ctx[36], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_prepend_slot_changes$1, get_prepend_slot_context$1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[39], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 2097152) {
    				attr_dev(label, "for", /*id*/ ctx[21]);
    			}

    			if (dirty[0] & /*labelActive*/ 8388608) {
    				toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			}

    			set_attributes(textarea_1, textarea_1_data = get_spread_update(textarea_1_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*rows*/ 2048) && { rows: /*rows*/ ctx[11] },
    				(!current || dirty[0] & /*placeholder*/ 32768) && { placeholder: /*placeholder*/ ctx[15] },
    				(!current || dirty[0] & /*id*/ 2097152) && { id: /*id*/ ctx[21] },
    				(!current || dirty[0] & /*readonly*/ 1024) && { readOnly: /*readonly*/ ctx[10] },
    				(!current || dirty[0] & /*disabled*/ 16384) && { disabled: /*disabled*/ ctx[14] },
    				dirty[0] & /*$$restProps*/ 536870912 && /*$$restProps*/ ctx[29]
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[9] && /*value*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 513) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t4);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_append_slot_changes$1, get_append_slot_context$1);
    				}
    			}

    			if (dirty[0] & /*filled*/ 16) {
    				toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			}

    			if (dirty[0] & /*solo*/ 32) {
    				toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			}

    			if (dirty[0] & /*outlined*/ 64) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty[0] & /*flat*/ 128) {
    				toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			}

    			if (dirty[0] & /*rounded*/ 256) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[8]);
    			}

    			if (dirty[0] & /*autogrow*/ 4096) {
    				toggle_class(div1, "autogrow", /*autogrow*/ ctx[12]);
    			}

    			if (dirty[0] & /*noResize, autogrow*/ 12288) {
    				toggle_class(div1, "no-resize", /*noResize*/ ctx[13] || /*autogrow*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*textarea_1_binding*/ ctx[37](null);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(67:0) <Input   class=\\\"s-text-field s-textarea\\\"   {color}   {readonly}   {disabled}   {error}   {success}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field s-textarea",
    				color: /*color*/ ctx[3],
    				readonly: /*readonly*/ ctx[10],
    				disabled: /*disabled*/ ctx[14],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[20],
    				style: /*style*/ ctx[22],
    				$$slots: {
    					default: [create_default_slot$f],
    					"append-outer": [create_append_outer_slot$2],
    					messages: [create_messages_slot],
    					"prepend-outer": [create_prepend_outer_slot$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*color*/ 8) input_changes.color = /*color*/ ctx[3];
    			if (dirty[0] & /*readonly*/ 1024) input_changes.readonly = /*readonly*/ ctx[10];
    			if (dirty[0] & /*disabled*/ 16384) input_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 1048576) input_changes.success = /*success*/ ctx[20];
    			if (dirty[0] & /*style*/ 4194304) input_changes.style = /*style*/ ctx[22];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, autogrow, noResize, clearable, rows, placeholder, id, readonly, disabled, $$restProps, textarea, labelActive*/ 565182453 | dirty[1] & /*$$scope*/ 256) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"value","color","filled","solo","outlined","flat","rounded","clearable","readonly","rows","autogrow","noResize","disabled","placeholder","hint","counter","rules","errorCount","messages","validateOnBlur","error","success","id","style","textarea"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Textarea", slots, ['prepend-outer','prepend','default','clear-icon','append','append-outer']);
    	let { value = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { rows = 5 } = $$props;
    	let { autogrow = false } = $$props;
    	let { noResize = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { counter = false } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { messages = [] } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let { textarea = null } = $$props;
    	let labelActive = !!placeholder || value;
    	let errorMessages = [];

    	function checkRules() {
    		$$invalidate(24, errorMessages = rules.map(r => r(value)).filter(r => typeof r === "string"));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}
    	}

    	function onFocus() {
    		$$invalidate(23, labelActive = true);
    	}

    	function onBlur() {
    		if (!value && !placeholder) $$invalidate(23, labelActive = false);
    		if (validateOnBlur) checkRules();
    	}

    	function clear() {
    		$$invalidate(0, value = "");
    		if (!placeholder) $$invalidate(23, labelActive = false);
    	}

    	function onInput() {
    		if (!validateOnBlur) checkRules();

    		if (autogrow) {
    			$$invalidate(2, textarea.style.height = "auto", textarea);
    			$$invalidate(2, textarea.style.height = `${textarea.scrollHeight}px`, textarea);
    		}
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function textarea_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			textarea = $$value;
    			$$invalidate(2, textarea);
    		});
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(29, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$new_props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$new_props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$new_props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$new_props) $$invalidate(7, flat = $$new_props.flat);
    		if ("rounded" in $$new_props) $$invalidate(8, rounded = $$new_props.rounded);
    		if ("clearable" in $$new_props) $$invalidate(9, clearable = $$new_props.clearable);
    		if ("readonly" in $$new_props) $$invalidate(10, readonly = $$new_props.readonly);
    		if ("rows" in $$new_props) $$invalidate(11, rows = $$new_props.rows);
    		if ("autogrow" in $$new_props) $$invalidate(12, autogrow = $$new_props.autogrow);
    		if ("noResize" in $$new_props) $$invalidate(13, noResize = $$new_props.noResize);
    		if ("disabled" in $$new_props) $$invalidate(14, disabled = $$new_props.disabled);
    		if ("placeholder" in $$new_props) $$invalidate(15, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(16, hint = $$new_props.hint);
    		if ("counter" in $$new_props) $$invalidate(17, counter = $$new_props.counter);
    		if ("rules" in $$new_props) $$invalidate(30, rules = $$new_props.rules);
    		if ("errorCount" in $$new_props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("messages" in $$new_props) $$invalidate(19, messages = $$new_props.messages);
    		if ("validateOnBlur" in $$new_props) $$invalidate(31, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(20, success = $$new_props.success);
    		if ("id" in $$new_props) $$invalidate(21, id = $$new_props.id);
    		if ("style" in $$new_props) $$invalidate(22, style = $$new_props.style);
    		if ("textarea" in $$new_props) $$invalidate(2, textarea = $$new_props.textarea);
    		if ("$$scope" in $$new_props) $$invalidate(39, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		rounded,
    		clearable,
    		readonly,
    		rows,
    		autogrow,
    		noResize,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		rules,
    		errorCount,
    		messages,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		textarea,
    		labelActive,
    		errorMessages,
    		checkRules,
    		onFocus,
    		onBlur,
    		clear,
    		onInput
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$props) $$invalidate(7, flat = $$new_props.flat);
    		if ("rounded" in $$props) $$invalidate(8, rounded = $$new_props.rounded);
    		if ("clearable" in $$props) $$invalidate(9, clearable = $$new_props.clearable);
    		if ("readonly" in $$props) $$invalidate(10, readonly = $$new_props.readonly);
    		if ("rows" in $$props) $$invalidate(11, rows = $$new_props.rows);
    		if ("autogrow" in $$props) $$invalidate(12, autogrow = $$new_props.autogrow);
    		if ("noResize" in $$props) $$invalidate(13, noResize = $$new_props.noResize);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$new_props.disabled);
    		if ("placeholder" in $$props) $$invalidate(15, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(16, hint = $$new_props.hint);
    		if ("counter" in $$props) $$invalidate(17, counter = $$new_props.counter);
    		if ("rules" in $$props) $$invalidate(30, rules = $$new_props.rules);
    		if ("errorCount" in $$props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("messages" in $$props) $$invalidate(19, messages = $$new_props.messages);
    		if ("validateOnBlur" in $$props) $$invalidate(31, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(20, success = $$new_props.success);
    		if ("id" in $$props) $$invalidate(21, id = $$new_props.id);
    		if ("style" in $$props) $$invalidate(22, style = $$new_props.style);
    		if ("textarea" in $$props) $$invalidate(2, textarea = $$new_props.textarea);
    		if ("labelActive" in $$props) $$invalidate(23, labelActive = $$new_props.labelActive);
    		if ("errorMessages" in $$props) $$invalidate(24, errorMessages = $$new_props.errorMessages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		error,
    		textarea,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		rounded,
    		clearable,
    		readonly,
    		rows,
    		autogrow,
    		noResize,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		errorCount,
    		messages,
    		success,
    		id,
    		style,
    		labelActive,
    		errorMessages,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		textarea_1_binding,
    		textarea_1_input_handler,
    		$$scope
    	];
    }

    class Textarea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$z,
    			create_fragment$z,
    			safe_not_equal,
    			{
    				value: 0,
    				color: 3,
    				filled: 4,
    				solo: 5,
    				outlined: 6,
    				flat: 7,
    				rounded: 8,
    				clearable: 9,
    				readonly: 10,
    				rows: 11,
    				autogrow: 12,
    				noResize: 13,
    				disabled: 14,
    				placeholder: 15,
    				hint: 16,
    				counter: 17,
    				rules: 30,
    				errorCount: 18,
    				messages: 19,
    				validateOnBlur: 31,
    				error: 1,
    				success: 20,
    				id: 21,
    				style: 22,
    				textarea: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Textarea",
    			options,
    			id: create_fragment$z.name
    		});
    	}

    	get value() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autogrow() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autogrow(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResize() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResize(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* eslint-disable */

    var nouislider_min = createCommonjsModule(function (module, exports) {
    /*! nouislider - 14.6.1 - 8/17/2020 */
    !(function (t) {
      (module.exports = t())
        ;
    })(function () {
      var lt = '14.6.1';
      function ut(t) {
        t.parentElement.removeChild(t);
      }
      function a(t) {
        return null != t;
      }
      function ct(t) {
        t.preventDefault();
      }
      function o(t) {
        return 'number' == typeof t && !isNaN(t) && isFinite(t);
      }
      function pt(t, e, r) {
        0 < r &&
          (ht(t, e),
          setTimeout(function () {
            mt(t, e);
          }, r));
      }
      function ft(t) {
        return Math.max(Math.min(t, 100), 0);
      }
      function dt(t) {
        return Array.isArray(t) ? t : [t];
      }
      function e(t) {
        var e = (t = String(t)).split('.');
        return 1 < e.length ? e[1].length : 0;
      }
      function ht(t, e) {
        t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
      }
      function mt(t, e) {
        t.classList && !/\s/.test(e)
          ? t.classList.remove(e)
          : (t.className = t.className.replace(
              new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'),
              ' ',
            ));
      }
      function gt(t) {
        var e = void 0 !== window.pageXOffset,
          r = 'CSS1Compat' === (t.compatMode || '');
        return {
          x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
          y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
        };
      }
      function c(t, e) {
        return 100 / (e - t);
      }
      function p(t, e, r) {
        return (100 * e) / (t[r + 1] - t[r]);
      }
      function f(t, e) {
        for (var r = 1; t >= e[r]; ) r += 1;
        return r;
      }
      function r(t, e, r) {
        if (r >= t.slice(-1)[0]) return 100;
        var n,
          i,
          o = f(r, t),
          s = t[o - 1],
          a = t[o],
          l = e[o - 1],
          u = e[o];
        return (
          l +
          ((i = r), p((n = [s, a]), n[0] < 0 ? i + Math.abs(n[0]) : i - n[0], 0) / c(l, u))
        );
      }
      function n(t, e, r, n) {
        if (100 === n) return n;
        var i,
          o,
          s = f(n, t),
          a = t[s - 1],
          l = t[s];
        return r
          ? (l - a) / 2 < n - a
            ? l
            : a
          : e[s - 1]
          ? t[s - 1] + ((i = n - t[s - 1]), (o = e[s - 1]), Math.round(i / o) * o)
          : n;
      }
      function s(t, e, r) {
        var n;
        if (('number' == typeof e && (e = [e]), !Array.isArray(e)))
          throw new Error('noUiSlider (' + lt + "): 'range' contains invalid value.");
        if (!o((n = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !o(e[0]))
          throw new Error('noUiSlider (' + lt + "): 'range' value isn't numeric.");
        r.xPct.push(n),
          r.xVal.push(e[0]),
          n ? r.xSteps.push(!isNaN(e[1]) && e[1]) : isNaN(e[1]) || (r.xSteps[0] = e[1]),
          r.xHighestCompleteStep.push(0);
      }
      function l(t, e, r) {
        if (e)
          if (r.xVal[t] !== r.xVal[t + 1]) {
            r.xSteps[t] = p([r.xVal[t], r.xVal[t + 1]], e, 0) / c(r.xPct[t], r.xPct[t + 1]);
            var n = (r.xVal[t + 1] - r.xVal[t]) / r.xNumSteps[t],
              i = Math.ceil(Number(n.toFixed(3)) - 1),
              o = r.xVal[t] + r.xNumSteps[t] * i;
            r.xHighestCompleteStep[t] = o;
          } else r.xSteps[t] = r.xHighestCompleteStep[t] = r.xVal[t];
      }
      function i(t, e, r) {
        var n;
        (this.xPct = []),
          (this.xVal = []),
          (this.xSteps = [r || !1]),
          (this.xNumSteps = [!1]),
          (this.xHighestCompleteStep = []),
          (this.snap = e);
        var i = [];
        for (n in t) t.hasOwnProperty(n) && i.push([t[n], n]);
        for (
          i.length && 'object' == typeof i[0][0]
            ? i.sort(function (t, e) {
                return t[0][0] - e[0][0];
              })
            : i.sort(function (t, e) {
                return t[0] - e[0];
              }),
            n = 0;
          n < i.length;
          n++
        )
          s(i[n][1], i[n][0], this);
        for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
          l(n, this.xNumSteps[n], this);
      }
      (i.prototype.getDistance = function (t) {
        var e,
          r = [];
        for (e = 0; e < this.xNumSteps.length - 1; e++) {
          var n = this.xNumSteps[e];
          if (n && (t / n) % 1 != 0)
            throw new Error(
              'noUiSlider (' +
                lt +
                "): 'limit', 'margin' and 'padding' of " +
                this.xPct[e] +
                '% range must be divisible by step.',
            );
          r[e] = p(this.xVal, t, e);
        }
        return r;
      }),
        (i.prototype.getAbsoluteDistance = function (t, e, r) {
          var n,
            i = 0;
          if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
          else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
          r || t !== this.xPct[i + 1] || i++;
          var o = 1,
            s = e[i],
            a = 0,
            l = 0,
            u = 0,
            c = 0;
          for (
            n = r
              ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
              : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
            0 < s;

          )
            (a = this.xPct[i + 1 + c] - this.xPct[i + c]),
              100 < e[i + c] * o + 100 - 100 * n
                ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
              r
                ? ((u -= l), 1 <= this.xPct.length + c && c--)
                : ((u += l), 1 <= this.xPct.length - c && c++),
              (s = e[i + c] * o);
          return t + u;
        }),
        (i.prototype.toStepping = function (t) {
          return (t = r(this.xVal, this.xPct, t));
        }),
        (i.prototype.fromStepping = function (t) {
          return (function (t, e, r) {
            if (100 <= r) return t.slice(-1)[0];
            var n,
              i = f(r, e),
              o = t[i - 1],
              s = t[i],
              a = e[i - 1],
              l = e[i];
            return (n = [o, s]), ((r - a) * c(a, l) * (n[1] - n[0])) / 100 + n[0];
          })(this.xVal, this.xPct, t);
        }),
        (i.prototype.getStep = function (t) {
          return (t = n(this.xPct, this.xSteps, this.snap, t));
        }),
        (i.prototype.getDefaultStep = function (t, e, r) {
          var n = f(t, this.xPct);
          return (
            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
            (this.xVal[n] - this.xVal[n - 1]) / r
          );
        }),
        (i.prototype.getNearbySteps = function (t) {
          var e = f(t, this.xPct);
          return {
            stepBefore: {
              startValue: this.xVal[e - 2],
              step: this.xNumSteps[e - 2],
              highestStep: this.xHighestCompleteStep[e - 2],
            },
            thisStep: {
              startValue: this.xVal[e - 1],
              step: this.xNumSteps[e - 1],
              highestStep: this.xHighestCompleteStep[e - 1],
            },
            stepAfter: {
              startValue: this.xVal[e],
              step: this.xNumSteps[e],
              highestStep: this.xHighestCompleteStep[e],
            },
          };
        }),
        (i.prototype.countStepDecimals = function () {
          var t = this.xNumSteps.map(e);
          return Math.max.apply(null, t);
        }),
        (i.prototype.convert = function (t) {
          return this.getStep(this.toStepping(t));
        });
      var u = {
          to: function (t) {
            return void 0 !== t && t.toFixed(2);
          },
          from: Number,
        },
        d = {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle',
          handleLower: 'handle-lower',
          handleUpper: 'handle-upper',
          touchArea: 'touch-area',
          horizontal: 'horizontal',
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          textDirectionLtr: 'txt-dir-ltr',
          textDirectionRtl: 'txt-dir-rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub',
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub',
        };
      function h(t) {
        if (
          'object' == typeof (e = t) &&
          'function' == typeof e.to &&
          'function' == typeof e.from
        )
          return !0;
        var e;
        throw new Error(
          'noUiSlider (' + lt + "): 'format' requires 'to' and 'from' methods.",
        );
      }
      function m(t, e) {
        if (!o(e)) throw new Error('noUiSlider (' + lt + "): 'step' is not numeric.");
        t.singleStep = e;
      }
      function g(t, e) {
        if (!o(e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardPageMultiplier' is not numeric.",
          );
        t.keyboardPageMultiplier = e;
      }
      function v(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'keyboardDefaultStep' is not numeric.");
        t.keyboardDefaultStep = e;
      }
      function b(t, e) {
        if ('object' != typeof e || Array.isArray(e))
          throw new Error('noUiSlider (' + lt + "): 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)
          throw new Error('noUiSlider (' + lt + "): Missing 'min' or 'max' in 'range'.");
        if (e.min === e.max)
          throw new Error(
            'noUiSlider (' + lt + "): 'range' 'min' and 'max' cannot be equal.",
          );
        t.spectrum = new i(e, t.snap, t.singleStep);
      }
      function x(t, e) {
        if (((e = dt(e)), !Array.isArray(e) || !e.length))
          throw new Error('noUiSlider (' + lt + "): 'start' option is incorrect.");
        (t.handles = e.length), (t.start = e);
      }
      function S(t, e) {
        if ('boolean' != typeof (t.snap = e))
          throw new Error('noUiSlider (' + lt + "): 'snap' option must be a boolean.");
      }
      function w(t, e) {
        if ('boolean' != typeof (t.animate = e))
          throw new Error('noUiSlider (' + lt + "): 'animate' option must be a boolean.");
      }
      function y(t, e) {
        if ('number' != typeof (t.animationDuration = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'animationDuration' option must be a number.",
          );
      }
      function E(t, e) {
        var r,
          n = [!1];
        if (
          ('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]),
          !0 === e || !1 === e)
        ) {
          for (r = 1; r < t.handles; r++) n.push(e);
          n.push(!1);
        } else {
          if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
            throw new Error(
              'noUiSlider (' + lt + "): 'connect' option doesn't match handle count.",
            );
          n = e;
        }
        t.connect = n;
      }
      function C(t, e) {
        switch (e) {
          case 'horizontal':
            t.ort = 0;
            break;
          case 'vertical':
            t.ort = 1;
            break;
          default:
            throw new Error('noUiSlider (' + lt + "): 'orientation' option is invalid.");
        }
      }
      function P(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'margin' option must be numeric.");
        0 !== e && (t.margin = t.spectrum.getDistance(e));
      }
      function N(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'limit' option must be numeric.");
        if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'limit' option is only supported on linear sliders with 2 or more handles.",
          );
      }
      function k(t, e) {
        var r;
        if (!o(e) && !Array.isArray(e))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (Array.isArray(e) && 2 !== e.length && !o(e[0]) && !o(e[1]))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (0 !== e) {
          for (
            Array.isArray(e) || (e = [e, e]),
              t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])],
              r = 0;
            r < t.spectrum.xNumSteps.length - 1;
            r++
          )
            if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
              throw new Error(
                'noUiSlider (' + lt + "): 'padding' option must be a positive number(s).",
              );
          var n = e[0] + e[1],
            i = t.spectrum.xVal[0];
          if (1 < n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i))
            throw new Error(
              'noUiSlider (' + lt + "): 'padding' option must not exceed 100% of the range.",
            );
        }
      }
      function U(t, e) {
        switch (e) {
          case 'ltr':
            t.dir = 0;
            break;
          case 'rtl':
            t.dir = 1;
            break;
          default:
            throw new Error(
              'noUiSlider (' + lt + "): 'direction' option was not recognized.",
            );
        }
      }
      function A(t, e) {
        if ('string' != typeof e)
          throw new Error(
            'noUiSlider (' + lt + "): 'behaviour' must be a string containing options.",
          );
        var r = 0 <= e.indexOf('tap'),
          n = 0 <= e.indexOf('drag'),
          i = 0 <= e.indexOf('fixed'),
          o = 0 <= e.indexOf('snap'),
          s = 0 <= e.indexOf('hover'),
          a = 0 <= e.indexOf('unconstrained');
        if (i) {
          if (2 !== t.handles)
            throw new Error(
              'noUiSlider (' + lt + "): 'fixed' behaviour must be used with 2 handles",
            );
          P(t, t.start[1] - t.start[0]);
        }
        if (a && (t.margin || t.limit))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'unconstrained' behaviour cannot be used with margin or limit",
          );
        t.events = { tap: r || o, drag: n, fixed: i, snap: o, hover: s, unconstrained: a };
      }
      function V(t, e) {
        if (!1 !== e)
          if (!0 === e) {
            t.tooltips = [];
            for (var r = 0; r < t.handles; r++) t.tooltips.push(!0);
          } else {
            if (((t.tooltips = dt(e)), t.tooltips.length !== t.handles))
              throw new Error(
                'noUiSlider (' + lt + '): must pass a formatter for all handles.',
              );
            t.tooltips.forEach(function (t) {
              if (
                'boolean' != typeof t &&
                ('object' != typeof t || 'function' != typeof t.to)
              )
                throw new Error(
                  'noUiSlider (' +
                    lt +
                    "): 'tooltips' must be passed a formatter or 'false'.",
                );
            });
          }
      }
      function D(t, e) {
        h((t.ariaFormat = e));
      }
      function M(t, e) {
        h((t.format = e));
      }
      function O(t, e) {
        if ('boolean' != typeof (t.keyboardSupport = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardSupport' option must be a boolean.",
          );
      }
      function L(t, e) {
        t.documentElement = e;
      }
      function z(t, e) {
        if ('string' != typeof e && !1 !== e)
          throw new Error(
            'noUiSlider (' + lt + "): 'cssPrefix' must be a string or `false`.",
          );
        t.cssPrefix = e;
      }
      function H(t, e) {
        if ('object' != typeof e)
          throw new Error('noUiSlider (' + lt + "): 'cssClasses' must be an object.");
        if ('string' == typeof t.cssPrefix)
          for (var r in ((t.cssClasses = {}), e))
            e.hasOwnProperty(r) && (t.cssClasses[r] = t.cssPrefix + e[r]);
        else t.cssClasses = e;
      }
      function vt(e) {
        var r = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: !0,
            animationDuration: 300,
            ariaFormat: u,
            format: u,
          },
          n = {
            step: { r: !1, t: m },
            keyboardPageMultiplier: { r: !1, t: g },
            keyboardDefaultStep: { r: !1, t: v },
            start: { r: !0, t: x },
            connect: { r: !0, t: E },
            direction: { r: !0, t: U },
            snap: { r: !1, t: S },
            animate: { r: !1, t: w },
            animationDuration: { r: !1, t: y },
            range: { r: !0, t: b },
            orientation: { r: !1, t: C },
            margin: { r: !1, t: P },
            limit: { r: !1, t: N },
            padding: { r: !1, t: k },
            behaviour: { r: !0, t: A },
            ariaFormat: { r: !1, t: D },
            format: { r: !1, t: M },
            tooltips: { r: !1, t: V },
            keyboardSupport: { r: !0, t: O },
            documentElement: { r: !1, t: L },
            cssPrefix: { r: !0, t: z },
            cssClasses: { r: !0, t: H },
          },
          i = {
            connect: !1,
            direction: 'ltr',
            behaviour: 'tap',
            orientation: 'horizontal',
            keyboardSupport: !0,
            cssPrefix: 'noUi-',
            cssClasses: d,
            keyboardPageMultiplier: 5,
            keyboardDefaultStep: 10,
          };
        e.format && !e.ariaFormat && (e.ariaFormat = e.format),
          Object.keys(n).forEach(function (t) {
            if (!a(e[t]) && void 0 === i[t]) {
              if (n[t].r)
                throw new Error('noUiSlider (' + lt + "): '" + t + "' is required.");
              return !0;
            }
            n[t].t(r, a(e[t]) ? e[t] : i[t]);
          }),
          (r.pips = e.pips);
        var t = document.createElement('div'),
          o = void 0 !== t.style.msTransform,
          s = void 0 !== t.style.transform;
        r.transformRule = s ? 'transform' : o ? 'msTransform' : 'webkitTransform';
        return (
          (r.style = [
            ['left', 'top'],
            ['right', 'bottom'],
          ][r.dir][r.ort]),
          r
        );
      }
      function j(t, b, o) {
        var l,
          u,
          s,
          c,
          i,
          a,
          e,
          p,
          f = window.navigator.pointerEnabled
            ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
            : window.navigator.msPointerEnabled
            ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
            : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
              },
          d =
            window.CSS &&
            CSS.supports &&
            CSS.supports('touch-action', 'none') &&
            (function () {
              var t = !1;
              try {
                var e = Object.defineProperty({}, 'passive', {
                  get: function () {
                    t = !0;
                  },
                });
                window.addEventListener('test', null, e);
              } catch (t) {}
              return t;
            })(),
          h = t,
          y = b.spectrum,
          x = [],
          S = [],
          m = [],
          g = 0,
          v = {},
          w = t.ownerDocument,
          E = b.documentElement || w.documentElement,
          C = w.body,
          P = -1,
          N = 0,
          k = 1,
          U = 2,
          A = 'rtl' === w.dir || 1 === b.ort ? 0 : 100;
        function V(t, e) {
          var r = w.createElement('div');
          return e && ht(r, e), t.appendChild(r), r;
        }
        function D(t, e) {
          var r = V(t, b.cssClasses.origin),
            n = V(r, b.cssClasses.handle);
          return (
            V(n, b.cssClasses.touchArea),
            n.setAttribute('data-handle', e),
            b.keyboardSupport &&
              (n.setAttribute('tabindex', '0'),
              n.addEventListener('keydown', function (t) {
                return (function (t, e) {
                  if (O() || L(e)) return !1;
                  var r = ['Left', 'Right'],
                    n = ['Down', 'Up'],
                    i = ['PageDown', 'PageUp'],
                    o = ['Home', 'End'];
                  b.dir && !b.ort
                    ? r.reverse()
                    : b.ort && !b.dir && (n.reverse(), i.reverse());
                  var s,
                    a = t.key.replace('Arrow', ''),
                    l = a === i[0],
                    u = a === i[1],
                    c = a === n[0] || a === r[0] || l,
                    p = a === n[1] || a === r[1] || u,
                    f = a === o[0],
                    d = a === o[1];
                  if (!(c || p || f || d)) return !0;
                  if ((t.preventDefault(), p || c)) {
                    var h = b.keyboardPageMultiplier,
                      m = c ? 0 : 1,
                      g = at(e),
                      v = g[m];
                    if (null === v) return !1;
                    !1 === v && (v = y.getDefaultStep(S[e], c, b.keyboardDefaultStep)),
                      (u || l) && (v *= h),
                      (v = Math.max(v, 1e-7)),
                      (v *= c ? -1 : 1),
                      (s = x[e] + v);
                  } else s = d ? b.spectrum.xVal[b.spectrum.xVal.length - 1] : b.spectrum.xVal[0];
                  return (
                    rt(e, y.toStepping(s), !0, !0),
                    J('slide', e),
                    J('update', e),
                    J('change', e),
                    J('set', e),
                    !1
                  );
                })(t, e);
              })),
            n.setAttribute('role', 'slider'),
            n.setAttribute('aria-orientation', b.ort ? 'vertical' : 'horizontal'),
            0 === e
              ? ht(n, b.cssClasses.handleLower)
              : e === b.handles - 1 && ht(n, b.cssClasses.handleUpper),
            r
          );
        }
        function M(t, e) {
          return !!e && V(t, b.cssClasses.connect);
        }
        function r(t, e) {
          return !!b.tooltips[e] && V(t.firstChild, b.cssClasses.tooltip);
        }
        function O() {
          return h.hasAttribute('disabled');
        }
        function L(t) {
          return u[t].hasAttribute('disabled');
        }
        function z() {
          i &&
            (G('update.tooltips'),
            i.forEach(function (t) {
              t && ut(t);
            }),
            (i = null));
        }
        function H() {
          z(),
            (i = u.map(r)),
            $('update.tooltips', function (t, e, r) {
              if (i[e]) {
                var n = t[e];
                !0 !== b.tooltips[e] && (n = b.tooltips[e].to(r[e])), (i[e].innerHTML = n);
              }
            });
        }
        function j(e, i, o) {
          var s = w.createElement('div'),
            a = [];
          (a[N] = b.cssClasses.valueNormal),
            (a[k] = b.cssClasses.valueLarge),
            (a[U] = b.cssClasses.valueSub);
          var l = [];
          (l[N] = b.cssClasses.markerNormal),
            (l[k] = b.cssClasses.markerLarge),
            (l[U] = b.cssClasses.markerSub);
          var u = [b.cssClasses.valueHorizontal, b.cssClasses.valueVertical],
            c = [b.cssClasses.markerHorizontal, b.cssClasses.markerVertical];
          function p(t, e) {
            var r = e === b.cssClasses.value,
              n = r ? a : l;
            return e + ' ' + (r ? u : c)[b.ort] + ' ' + n[t];
          }
          return (
            ht(s, b.cssClasses.pips),
            ht(s, 0 === b.ort ? b.cssClasses.pipsHorizontal : b.cssClasses.pipsVertical),
            Object.keys(e).forEach(function (t) {
              !(function (t, e, r) {
                if ((r = i ? i(e, r) : r) !== P) {
                  var n = V(s, !1);
                  (n.className = p(r, b.cssClasses.marker)),
                    (n.style[b.style] = t + '%'),
                    N < r &&
                      (((n = V(s, !1)).className = p(r, b.cssClasses.value)),
                      n.setAttribute('data-value', e),
                      (n.style[b.style] = t + '%'),
                      (n.innerHTML = o.to(e)));
                }
              })(t, e[t][0], e[t][1]);
            }),
            s
          );
        }
        function F() {
          c && (ut(c), (c = null));
        }
        function R(t) {
          F();
          var m,
            g,
            v,
            b,
            e,
            r,
            x,
            S,
            w,
            n = t.mode,
            i = t.density || 1,
            o = t.filter || !1,
            s = (function (t, e, r) {
              if ('range' === t || 'steps' === t) return y.xVal;
              if ('count' === t) {
                if (e < 2)
                  throw new Error(
                    'noUiSlider (' + lt + "): 'values' (>= 2) required for mode 'count'.",
                  );
                var n = e - 1,
                  i = 100 / n;
                for (e = []; n--; ) e[n] = n * i;
                e.push(100), (t = 'positions');
              }
              return 'positions' === t
                ? e.map(function (t) {
                    return y.fromStepping(r ? y.getStep(t) : t);
                  })
                : 'values' === t
                ? r
                  ? e.map(function (t) {
                      return y.fromStepping(y.getStep(y.toStepping(t)));
                    })
                  : e
                : void 0;
            })(n, t.values || !1, t.stepped || !1),
            a =
              ((m = i),
              (g = n),
              (v = s),
              (b = {}),
              (e = y.xVal[0]),
              (r = y.xVal[y.xVal.length - 1]),
              (S = x = !1),
              (w = 0),
              (v = v
                .slice()
                .sort(function (t, e) {
                  return t - e;
                })
                .filter(function (t) {
                  return !this[t] && (this[t] = !0);
                }, {}))[0] !== e && (v.unshift(e), (x = !0)),
              v[v.length - 1] !== r && (v.push(r), (S = !0)),
              v.forEach(function (t, e) {
                var r,
                  n,
                  i,
                  o,
                  s,
                  a,
                  l,
                  u,
                  c,
                  p,
                  f = t,
                  d = v[e + 1],
                  h = 'steps' === g;
                if ((h && (r = y.xNumSteps[e]), r || (r = d - f), !1 !== f))
                  for (
                    void 0 === d && (d = f), r = Math.max(r, 1e-7), n = f;
                    n <= d;
                    n = (n + r).toFixed(7) / 1
                  ) {
                    for (
                      u = (s = (o = y.toStepping(n)) - w) / m,
                        p = s / (c = Math.round(u)),
                        i = 1;
                      i <= c;
                      i += 1
                    )
                      b[(a = w + i * p).toFixed(5)] = [y.fromStepping(a), 0];
                    (l = -1 < v.indexOf(n) ? k : h ? U : N),
                      !e && x && n !== d && (l = 0),
                      (n === d && S) || (b[o.toFixed(5)] = [n, l]),
                      (w = o);
                  }
              }),
              b),
            l = t.format || { to: Math.round };
          return (c = h.appendChild(j(a, o, l)));
        }
        function T() {
          var t = l.getBoundingClientRect(),
            e = 'offset' + ['Width', 'Height'][b.ort];
          return 0 === b.ort ? t.width || l[e] : t.height || l[e];
        }
        function B(n, i, o, s) {
          var e = function (t) {
              return (
                !!(t = (function (t, e, r) {
                  var n,
                    i,
                    o = 0 === t.type.indexOf('touch'),
                    s = 0 === t.type.indexOf('mouse'),
                    a = 0 === t.type.indexOf('pointer');
                  0 === t.type.indexOf('MSPointer') && (a = !0);
                  if (o) {
                    var l = function (t) {
                      return (
                        t.target === r ||
                        r.contains(t.target) ||
                        (t.target.shadowRoot && t.target.shadowRoot.contains(r))
                      );
                    };
                    if ('touchstart' === t.type) {
                      var u = Array.prototype.filter.call(t.touches, l);
                      if (1 < u.length) return !1;
                      (n = u[0].pageX), (i = u[0].pageY);
                    } else {
                      var c = Array.prototype.find.call(t.changedTouches, l);
                      if (!c) return !1;
                      (n = c.pageX), (i = c.pageY);
                    }
                  }
                  (e = e || gt(w)),
                    (s || a) && ((n = t.clientX + e.x), (i = t.clientY + e.y));
                  return (t.pageOffset = e), (t.points = [n, i]), (t.cursor = s || a), t;
                })(t, s.pageOffset, s.target || i)) &&
                !(O() && !s.doNotReject) &&
                ((e = h),
                (r = b.cssClasses.tap),
                !(
                  (e.classList
                    ? e.classList.contains(r)
                    : new RegExp('\\b' + r + '\\b').test(e.className)) && !s.doNotReject
                ) &&
                  !(n === f.start && void 0 !== t.buttons && 1 < t.buttons) &&
                  (!s.hover || !t.buttons) &&
                  (d || t.preventDefault(), (t.calcPoint = t.points[b.ort]), void o(t, s)))
              );
              var e, r;
            },
            r = [];
          return (
            n.split(' ').forEach(function (t) {
              i.addEventListener(t, e, !!d && { passive: !0 }), r.push([t, e]);
            }),
            r
          );
        }
        function q(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            a =
              (100 *
                (t -
                  ((e = l),
                  (r = b.ort),
                  (n = e.getBoundingClientRect()),
                  (i = e.ownerDocument),
                  (o = i.documentElement),
                  (s = gt(i)),
                  /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (s.x = 0),
                  r ? n.top + s.y - o.clientTop : n.left + s.x - o.clientLeft))) /
              T();
          return (a = ft(a)), b.dir ? 100 - a : a;
        }
        function X(t, e) {
          'mouseout' === t.type &&
            'HTML' === t.target.nodeName &&
            null === t.relatedTarget &&
            _(t, e);
        }
        function Y(t, e) {
          if (
            -1 === navigator.appVersion.indexOf('MSIE 9') &&
            0 === t.buttons &&
            0 !== e.buttonsProperty
          )
            return _(t, e);
          var r = (b.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
          Z(0 < r, (100 * r) / e.baseSize, e.locations, e.handleNumbers);
        }
        function _(t, e) {
          e.handle && (mt(e.handle, b.cssClasses.active), (g -= 1)),
            e.listeners.forEach(function (t) {
              E.removeEventListener(t[0], t[1]);
            }),
            0 === g &&
              (mt(h, b.cssClasses.drag),
              et(),
              t.cursor && ((C.style.cursor = ''), C.removeEventListener('selectstart', ct))),
            e.handleNumbers.forEach(function (t) {
              J('change', t), J('set', t), J('end', t);
            });
        }
        function I(t, e) {
          if (e.handleNumbers.some(L)) return !1;
          var r;
          1 === e.handleNumbers.length &&
            ((r = u[e.handleNumbers[0]].children[0]), (g += 1), ht(r, b.cssClasses.active));
          t.stopPropagation();
          var n = [],
            i = B(f.move, E, Y, {
              target: t.target,
              handle: r,
              listeners: n,
              startCalcPoint: t.calcPoint,
              baseSize: T(),
              pageOffset: t.pageOffset,
              handleNumbers: e.handleNumbers,
              buttonsProperty: t.buttons,
              locations: S.slice(),
            }),
            o = B(f.end, E, _, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            }),
            s = B('mouseout', E, X, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            });
          n.push.apply(n, i.concat(o, s)),
            t.cursor &&
              ((C.style.cursor = getComputedStyle(t.target).cursor),
              1 < u.length && ht(h, b.cssClasses.drag),
              C.addEventListener('selectstart', ct, !1)),
            e.handleNumbers.forEach(function (t) {
              J('start', t);
            });
        }
        function n(t) {
          if (!t.buttons && !t.touches) return !1;
          t.stopPropagation();
          var i,
            o,
            s,
            e = q(t.calcPoint),
            r =
              ((i = e),
              (s = !(o = 100)),
              u.forEach(function (t, e) {
                if (!L(e)) {
                  var r = S[e],
                    n = Math.abs(r - i);
                  (n < o || (n <= o && r < i) || (100 === n && 100 === o)) &&
                    ((s = e), (o = n));
                }
              }),
              s);
          if (!1 === r) return !1;
          b.events.snap || pt(h, b.cssClasses.tap, b.animationDuration),
            rt(r, e, !0, !0),
            et(),
            J('slide', r, !0),
            J('update', r, !0),
            J('change', r, !0),
            J('set', r, !0),
            b.events.snap && I(t, { handleNumbers: [r] });
        }
        function W(t) {
          var e = q(t.calcPoint),
            r = y.getStep(e),
            n = y.fromStepping(r);
          Object.keys(v).forEach(function (t) {
            'hover' === t.split('.')[0] &&
              v[t].forEach(function (t) {
                t.call(a, n);
              });
          });
        }
        function $(t, e) {
          (v[t] = v[t] || []),
            v[t].push(e),
            'update' === t.split('.')[0] &&
              u.forEach(function (t, e) {
                J('update', e);
              });
        }
        function G(t) {
          var n = t && t.split('.')[0],
            i = n && t.substring(n.length);
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0],
              r = t.substring(e.length);
            (n && n !== e) || (i && i !== r) || delete v[t];
          });
        }
        function J(r, n, i) {
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0];
            r === e &&
              v[t].forEach(function (t) {
                t.call(a, x.map(b.format.to), n, x.slice(), i || !1, S.slice(), a);
              });
          });
        }
        function K(t, e, r, n, i, o) {
          var s;
          return (
            1 < u.length &&
              !b.events.unconstrained &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.margin, 0)), (r = Math.max(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.margin, 1)), (r = Math.min(r, s)))),
            1 < u.length &&
              b.limit &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.limit, 0)), (r = Math.min(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.limit, 1)), (r = Math.max(r, s)))),
            b.padding &&
              (0 === e &&
                ((s = y.getAbsoluteDistance(0, b.padding[0], 0)), (r = Math.max(r, s))),
              e === u.length - 1 &&
                ((s = y.getAbsoluteDistance(100, b.padding[1], 1)), (r = Math.min(r, s)))),
            !((r = ft((r = y.getStep(r)))) === t[e] && !o) && r
          );
        }
        function Q(t, e) {
          var r = b.ort;
          return (r ? e : t) + ', ' + (r ? t : e);
        }
        function Z(t, n, r, e) {
          var i = r.slice(),
            o = [!t, t],
            s = [t, !t];
          (e = e.slice()),
            t && e.reverse(),
            1 < e.length
              ? e.forEach(function (t, e) {
                  var r = K(i, t, i[t] + n, o[e], s[e], !1);
                  !1 === r ? (n = 0) : ((n = r - i[t]), (i[t] = r));
                })
              : (o = s = [!0]);
          var a = !1;
          e.forEach(function (t, e) {
            a = rt(t, r[t] + n, o[e], s[e]) || a;
          }),
            a &&
              e.forEach(function (t) {
                J('update', t), J('slide', t);
              });
        }
        function tt(t, e) {
          return b.dir ? 100 - t - e : t;
        }
        function et() {
          m.forEach(function (t) {
            var e = 50 < S[t] ? -1 : 1,
              r = 3 + (u.length + e * t);
            u[t].style.zIndex = r;
          });
        }
        function rt(t, e, r, n) {
          return (
            !1 !== (e = K(S, t, e, r, n, !1)) &&
            ((function (t, e) {
              (S[t] = e), (x[t] = y.fromStepping(e));
              var r = 'translate(' + Q(10 * (tt(e, 0) - A) + '%', '0') + ')';
              (u[t].style[b.transformRule] = r), nt(t), nt(t + 1);
            })(t, e),
            !0)
          );
        }
        function nt(t) {
          if (s[t]) {
            var e = 0,
              r = 100;
            0 !== t && (e = S[t - 1]), t !== s.length - 1 && (r = S[t]);
            var n = r - e,
              i = 'translate(' + Q(tt(e, n) + '%', '0') + ')',
              o = 'scale(' + Q(n / 100, '1') + ')';
            s[t].style[b.transformRule] = i + ' ' + o;
          }
        }
        function it(t, e) {
          return null === t || !1 === t || void 0 === t
            ? S[e]
            : ('number' == typeof t && (t = String(t)),
              (t = b.format.from(t)),
              !1 === (t = y.toStepping(t)) || isNaN(t) ? S[e] : t);
        }
        function ot(t, e) {
          var r = dt(t),
            n = void 0 === S[0];
          (e = void 0 === e || !!e),
            b.animate && !n && pt(h, b.cssClasses.tap, b.animationDuration),
            m.forEach(function (t) {
              rt(t, it(r[t], t), !0, !1);
            });
          for (var i = 1 === m.length ? 0 : 1; i < m.length; ++i)
            m.forEach(function (t) {
              rt(t, S[t], !0, !0);
            });
          et(),
            m.forEach(function (t) {
              J('update', t), null !== r[t] && e && J('set', t);
            });
        }
        function st() {
          var t = x.map(b.format.to);
          return 1 === t.length ? t[0] : t;
        }
        function at(t) {
          var e = S[t],
            r = y.getNearbySteps(e),
            n = x[t],
            i = r.thisStep.step,
            o = null;
          if (b.snap)
            return [n - r.stepBefore.startValue || null, r.stepAfter.startValue - n || null];
          !1 !== i && n + i > r.stepAfter.startValue && (i = r.stepAfter.startValue - n),
            (o =
              n > r.thisStep.startValue
                ? r.thisStep.step
                : !1 !== r.stepBefore.step && n - r.stepBefore.highestStep),
            100 === e ? (i = null) : 0 === e && (o = null);
          var s = y.countStepDecimals();
          return (
            null !== i && !1 !== i && (i = Number(i.toFixed(s))),
            null !== o && !1 !== o && (o = Number(o.toFixed(s))),
            [o, i]
          );
        }
        return (
          ht((e = h), b.cssClasses.target),
          0 === b.dir ? ht(e, b.cssClasses.ltr) : ht(e, b.cssClasses.rtl),
          0 === b.ort ? ht(e, b.cssClasses.horizontal) : ht(e, b.cssClasses.vertical),
          ht(
            e,
            'rtl' === getComputedStyle(e).direction
              ? b.cssClasses.textDirectionRtl
              : b.cssClasses.textDirectionLtr,
          ),
          (l = V(e, b.cssClasses.base)),
          (function (t, e) {
            var r = V(e, b.cssClasses.connects);
            (u = []), (s = []).push(M(r, t[0]));
            for (var n = 0; n < b.handles; n++)
              u.push(D(e, n)), (m[n] = n), s.push(M(r, t[n + 1]));
          })(b.connect, l),
          (p = b.events).fixed ||
            u.forEach(function (t, e) {
              B(f.start, t.children[0], I, { handleNumbers: [e] });
            }),
          p.tap && B(f.start, l, n, {}),
          p.hover && B(f.move, l, W, { hover: !0 }),
          p.drag &&
            s.forEach(function (t, e) {
              if (!1 !== t && 0 !== e && e !== s.length - 1) {
                var r = u[e - 1],
                  n = u[e],
                  i = [t];
                ht(t, b.cssClasses.draggable),
                  p.fixed && (i.push(r.children[0]), i.push(n.children[0])),
                  i.forEach(function (t) {
                    B(f.start, t, I, { handles: [r, n], handleNumbers: [e - 1, e] });
                  });
              }
            }),
          ot(b.start),
          b.pips && R(b.pips),
          b.tooltips && H(),
          $('update', function (t, e, s, r, a) {
            m.forEach(function (t) {
              var e = u[t],
                r = K(S, t, 0, !0, !0, !0),
                n = K(S, t, 100, !0, !0, !0),
                i = a[t],
                o = b.ariaFormat.to(s[t]);
              (r = y.fromStepping(r).toFixed(1)),
                (n = y.fromStepping(n).toFixed(1)),
                (i = y.fromStepping(i).toFixed(1)),
                e.children[0].setAttribute('aria-valuemin', r),
                e.children[0].setAttribute('aria-valuemax', n),
                e.children[0].setAttribute('aria-valuenow', i),
                e.children[0].setAttribute('aria-valuetext', o);
            });
          }),
          (a = {
            destroy: function () {
              for (var t in b.cssClasses)
                b.cssClasses.hasOwnProperty(t) && mt(h, b.cssClasses[t]);
              for (; h.firstChild; ) h.removeChild(h.firstChild);
              delete h.noUiSlider;
            },
            steps: function () {
              return m.map(at);
            },
            on: $,
            off: G,
            get: st,
            set: ot,
            setHandle: function (t, e, r) {
              if (!(0 <= (t = Number(t)) && t < m.length))
                throw new Error('noUiSlider (' + lt + '): invalid handle number, got: ' + t);
              rt(t, it(e, t), !0, !0), J('update', t), r && J('set', t);
            },
            reset: function (t) {
              ot(b.start, t);
            },
            __moveHandles: function (t, e, r) {
              Z(t, e, S, r);
            },
            options: o,
            updateOptions: function (e, t) {
              var r = st(),
                n = [
                  'margin',
                  'limit',
                  'padding',
                  'range',
                  'animate',
                  'snap',
                  'step',
                  'format',
                  'pips',
                  'tooltips',
                ];
              n.forEach(function (t) {
                void 0 !== e[t] && (o[t] = e[t]);
              });
              var i = vt(o);
              n.forEach(function (t) {
                void 0 !== e[t] && (b[t] = i[t]);
              }),
                (y = i.spectrum),
                (b.margin = i.margin),
                (b.limit = i.limit),
                (b.padding = i.padding),
                b.pips ? R(b.pips) : F(),
                b.tooltips ? H() : z(),
                (S = []),
                ot(e.start || r, t);
            },
            target: h,
            removePips: F,
            removeTooltips: z,
            getTooltips: function () {
              return i;
            },
            getOrigins: function () {
              return u;
            },
            pips: R,
          })
        );
      }
      return {
        __spectrum: i,
        version: lt,
        cssClasses: d,
        create: function (t, e) {
          if (!t || !t.nodeName)
            throw new Error(
              'noUiSlider (' + lt + '): create requires a single element, got: ' + t,
            );
          if (t.noUiSlider)
            throw new Error('noUiSlider (' + lt + '): Slider was already initialized.');
          var r = j(t, vt(e), e);
          return (t.noUiSlider = r);
        },
      };
    });
    });

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Slider/Slider.svelte generated by Svelte v3.34.0 */
    const file$v = "../../../svelte-materialify/packages/svelte-materialify/src/components/Slider/Slider.svelte";
    const get_append_outer_slot_changes$1 = dirty => ({});
    const get_append_outer_slot_context$1 = ctx => ({ slot: "append-outer" });
    const get_prepend_outer_slot_changes$1 = dirty => ({});
    const get_prepend_outer_slot_context$1 = ctx => ({ slot: "prepend-outer" });

    // (313:2) <slot slot="prepend-outer" name="prepend-outer" />   <label class="s-slider__label" class:inverse-label={inverseLabel}
    function create_prepend_outer_slot$1(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[20]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[22], get_prepend_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_prepend_outer_slot_changes$1, get_prepend_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$1.name,
    		type: "slot",
    		source: "(313:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <label class=\\\"s-slider__label\\\" class:inverse-label={inverseLabel}",
    		ctx
    	});

    	return block;
    }

    // (322:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot$1(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[20]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[22], get_append_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_append_outer_slot_changes$1, get_append_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$1.name,
    		type: "slot",
    		source: "(322:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (311:0) <Input class="s-slider" {color} {readonly} {disabled}>
    function create_default_slot$e(ctx) {
    	let t0;
    	let label;
    	let t1;
    	let div;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	const block = {
    		c: function create() {
    			t0 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			attr_dev(label, "class", "s-slider__label");
    			toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			add_location(label, file$v, 313, 2, 7246);
    			attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			attr_dev(div, "style", /*style*/ ctx[5]);
    			toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			add_location(div, file$v, 314, 2, 7331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[21](div);
    			insert_dev(target, t2, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (dirty & /*inverseLabel*/ 4) {
    				toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(div, "style", /*style*/ ctx[5]);
    			}

    			if (dirty & /*persistentThumb*/ 2) {
    				toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[21](null);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(311:0) <Input class=\\\"s-slider\\\" {color} {readonly} {disabled}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-slider",
    				color: /*color*/ ctx[0],
    				readonly: /*readonly*/ ctx[3],
    				disabled: /*disabled*/ ctx[4],
    				$$slots: {
    					default: [create_default_slot$e],
    					"append-outer": [create_append_outer_slot$1],
    					"prepend-outer": [create_prepend_outer_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*color*/ 1) input_changes.color = /*color*/ ctx[0];
    			if (dirty & /*readonly*/ 8) input_changes.readonly = /*readonly*/ ctx[3];
    			if (dirty & /*disabled*/ 16) input_changes.disabled = /*disabled*/ ctx[4];

    			if (dirty & /*$$scope, disabled, style, sliderElement, persistentThumb, inverseLabel*/ 4194422) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format(val) {
    	if (Array.isArray(val)) {
    		if (val.length === 1) return Number(val[0]);
    		return val.map(v => Number(v));
    	}

    	return Number(val);
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, ['prepend-outer','default','append-outer']);
    	let sliderElement;
    	let slider;
    	let localValue;
    	const dispatch = createEventDispatcher();
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { value = (min + max) / 2 } = $$props;
    	let { connect = Array.isArray(value) ? true : "lower" } = $$props;
    	let { color = "primary" } = $$props;
    	let { step = null } = $$props;
    	let { precision = 0 } = $$props;
    	let { margin = null } = $$props;
    	let { limit = null } = $$props;
    	let { padding = null } = $$props;
    	let { thumb = false } = $$props;
    	let { persistentThumb = false } = $$props;
    	let { thumbClass = "primary-color" } = $$props;
    	let { vertical = false } = $$props;
    	let { inverseLabel = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = null } = $$props;
    	let { style = null } = $$props;

    	function tooltip() {
    		if (Array.isArray(thumb)) {
    			return thumb.map(x => {
    				if (typeof x === "function") return { to: x };
    				return x;
    			});
    		}

    		if (typeof thumb === "function") {
    			return { to: thumb };
    		}

    		return thumb;
    	}

    	onMount(() => {
    		nouislider_min.cssClasses.tooltip = `tooltip ${thumbClass}`;

    		nouislider_min.create(sliderElement, {
    			cssPrefix: "s-slider__",
    			format: {
    				to: v => v.toFixed(precision),
    				from: v => Number(v)
    			},
    			start: value,
    			connect,
    			margin,
    			limit,
    			padding,
    			range: { min, max },
    			orientation: vertical ? "vertical" : "horizontal",
    			step,
    			tooltips: tooltip()
    		});

    		$$invalidate(19, slider = sliderElement.noUiSlider);

    		slider.on("update", (val, handle) => {
    			$$invalidate(7, value = format(val));
    			localValue = value;
    			dispatch("update", { value: val, handle });
    		});

    		slider.on("change", (val, handle) => {
    			dispatch("change", { value: val, handle });
    		});

    		return () => {
    			slider.destroy();
    		};
    	});

    	afterUpdate(() => {
    		if (value !== localValue) slider.set(value, false);
    	});

    	const writable_props = [
    		"min",
    		"max",
    		"value",
    		"connect",
    		"color",
    		"step",
    		"precision",
    		"margin",
    		"limit",
    		"padding",
    		"thumb",
    		"persistentThumb",
    		"thumbClass",
    		"vertical",
    		"inverseLabel",
    		"readonly",
    		"disabled",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(6, sliderElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("min" in $$props) $$invalidate(8, min = $$props.min);
    		if ("max" in $$props) $$invalidate(9, max = $$props.max);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(10, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(11, step = $$props.step);
    		if ("precision" in $$props) $$invalidate(12, precision = $$props.precision);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		noUiSlider: nouislider_min,
    		Input,
    		onMount,
    		afterUpdate,
    		createEventDispatcher,
    		sliderElement,
    		slider,
    		localValue,
    		dispatch,
    		min,
    		max,
    		value,
    		connect,
    		color,
    		step,
    		precision,
    		margin,
    		limit,
    		padding,
    		thumb,
    		persistentThumb,
    		thumbClass,
    		vertical,
    		inverseLabel,
    		readonly,
    		disabled,
    		style,
    		format,
    		tooltip
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(6, sliderElement = $$props.sliderElement);
    		if ("slider" in $$props) $$invalidate(19, slider = $$props.slider);
    		if ("localValue" in $$props) localValue = $$props.localValue;
    		if ("min" in $$props) $$invalidate(8, min = $$props.min);
    		if ("max" in $$props) $$invalidate(9, max = $$props.max);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(10, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(11, step = $$props.step);
    		if ("precision" in $$props) $$invalidate(12, precision = $$props.precision);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slider, min, max, vertical, connect, margin, limit, padding*/ 845568) {
    			{
    				if (slider != null) {
    					slider.updateOptions({
    						range: { min, max },
    						orientation: vertical ? "vertical" : "horizontal",
    						connect,
    						margin,
    						limit,
    						padding
    					});
    				}
    			}
    		}
    	};

    	return [
    		color,
    		persistentThumb,
    		inverseLabel,
    		readonly,
    		disabled,
    		style,
    		sliderElement,
    		value,
    		min,
    		max,
    		connect,
    		step,
    		precision,
    		margin,
    		limit,
    		padding,
    		thumb,
    		thumbClass,
    		vertical,
    		slider,
    		slots,
    		div_binding,
    		$$scope
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {
    			min: 8,
    			max: 9,
    			value: 7,
    			connect: 10,
    			color: 0,
    			step: 11,
    			precision: 12,
    			margin: 13,
    			limit: 14,
    			padding: 15,
    			thumb: 16,
    			persistentThumb: 1,
    			thumbClass: 17,
    			vertical: 18,
    			inverseLabel: 2,
    			readonly: 3,
    			disabled: 4,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$y.name
    		});
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connect() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connect(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get precision() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set precision(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limit() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limit(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentThumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentThumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbClass() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbClass(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverseLabel() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverseLabel(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Menu/Menu.svelte generated by Svelte v3.34.0 */
    const file$u = "../../../svelte-materialify/packages/svelte-materialify/src/components/Menu/Menu.svelte";
    const get_activator_slot_changes = dirty => ({});
    const get_activator_slot_context = ctx => ({});

    // (145:2) {#if active}
    function create_if_block$h(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-menu " + /*klass*/ ctx[1]);
    			attr_dev(div, "role", "menu");
    			attr_dev(div, "style", div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]));
    			toggle_class(div, "tile", /*tile*/ ctx[5]);
    			add_location(div, file$u, 145, 4, 3712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*menuClick*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*klass*/ 2 && div_class_value !== (div_class_value = "s-menu " + /*klass*/ ctx[1])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*position, origin, index, style*/ 960 && div_style_value !== (div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]))) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty[0] & /*klass, tile*/ 34) {
    				toggle_class(div, "tile", /*tile*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*transition*/ ctx[2], /*inOpts*/ ctx[3]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*transition*/ ctx[2], /*outOpts*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(145:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*#slots*/ ctx[26].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[25], get_activator_slot_context);
    	let if_block = /*active*/ ctx[0] && create_if_block$h(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "s-menu__wrapper");
    			add_location(div, file$u, 136, 0, 3511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (activator_slot) {
    				activator_slot.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[27](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ClickOutside.call(null, div)),
    					listen_dev(div, "clickOutside", /*clickOutsideMenu*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (activator_slot) {
    				if (activator_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_activator_slot_changes, get_activator_slot_context);
    				}
    			}

    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$h(ctx);
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
    			transition_in(activator_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (activator_slot) activator_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, ['activator','default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { absolute = false } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 200 } } = $$props;
    	let { offsetX = false } = $$props;
    	let { offsetY = true } = $$props;
    	let { nudgeX = 0 } = $$props;
    	let { nudgeY = 0 } = $$props;
    	let { openOnClick = true } = $$props;
    	let { hover = false } = $$props;
    	let { closeOnClickOutside = true } = $$props;
    	let { closeOnClick = true } = $$props;
    	let { bottom = false } = $$props;
    	let { right = false } = $$props;
    	let { tile = false } = $$props;
    	let { disabled = false } = $$props;
    	let { index = 8 } = $$props;
    	let { style = "" } = $$props;
    	let origin = "top left";
    	let position;
    	let wrapper;
    	const dispatch = createEventDispatcher();

    	const align = {
    		x: right ? "right" : "left",
    		y: bottom ? "bottom" : "top"
    	};

    	setContext("S_ListItemRole", "menuitem");
    	setContext("S_ListItemRipple", true);

    	// For opening the menu
    	function open(posX = 0, posY = 0) {
    		$$invalidate(0, active = true);
    		const rect = wrapper.getBoundingClientRect();
    		let x = nudgeX;
    		let y = nudgeY;

    		if (absolute) {
    			x += posX;
    			y += posY;
    		} else {
    			if (offsetX) x += rect.width;
    			if (offsetY) y += rect.height;
    		}

    		$$invalidate(9, position = `${align.y}:${y}px;${align.x}:${x}px`);
    		$$invalidate(8, origin = `${align.y} ${align.x}`);

    		/**
     * Event when menu is opened.
     * @returns Nothing
     */
    		dispatch("open");
    	}

    	// For closing the menu.
    	function close() {
    		$$invalidate(0, active = false);

    		/**
     * Event when menu is closed.
     * @returns Nothing
     */
    		dispatch("close");
    	}

    	// When the activator slot is clicked.
    	function triggerClick(e) {
    		if (!disabled) {
    			if (active) {
    				close();
    			} else if (openOnClick) {
    				open(e.offsetX, e.offsetY);
    			}
    		}
    	}

    	// When the menu itself is clicked.
    	function menuClick() {
    		if (active && closeOnClick) close();
    	}

    	// When user clicked somewhere outside the menu.
    	function clickOutsideMenu() {
    		if (active && closeOnClickOutside) close();
    	}

    	onMount(() => {
    		const trigger = wrapper.querySelector("[slot='activator']");

    		// Opening the menu if active is set to true.
    		if (active) open();

    		trigger.addEventListener("click", triggerClick, { passive: true });

    		if (hover) {
    			wrapper.addEventListener("mouseenter", open, { passive: true });
    			wrapper.addEventListener("mouseleave", close, { passive: true });
    		}

    		return () => {
    			trigger.removeEventListener("click", triggerClick);

    			if (hover) {
    				wrapper.removeEventListener("mouseenter", open);
    				wrapper.removeEventListener("mouseleave", close);
    			}
    		};
    	});

    	const writable_props = [
    		"class",
    		"active",
    		"absolute",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"offsetX",
    		"offsetY",
    		"nudgeX",
    		"nudgeY",
    		"openOnClick",
    		"hover",
    		"closeOnClickOutside",
    		"closeOnClick",
    		"bottom",
    		"right",
    		"tile",
    		"disabled",
    		"index",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(10, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClickOutside,
    		onMount,
    		setContext,
    		createEventDispatcher,
    		fade,
    		klass,
    		active,
    		absolute,
    		transition,
    		inOpts,
    		outOpts,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		tile,
    		disabled,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		dispatch,
    		align,
    		open,
    		close,
    		triggerClick,
    		menuClick,
    		clickOutsideMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("origin" in $$props) $$invalidate(8, origin = $$props.origin);
    		if ("position" in $$props) $$invalidate(9, position = $$props.position);
    		if ("wrapper" in $$props) $$invalidate(10, wrapper = $$props.wrapper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		tile,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		menuClick,
    		clickOutsideMenu,
    		absolute,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		disabled,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$x,
    			create_fragment$x,
    			safe_not_equal,
    			{
    				class: 1,
    				active: 0,
    				absolute: 13,
    				transition: 2,
    				inOpts: 3,
    				outOpts: 4,
    				offsetX: 14,
    				offsetY: 15,
    				nudgeX: 16,
    				nudgeY: 17,
    				openOnClick: 18,
    				hover: 19,
    				closeOnClickOutside: 20,
    				closeOnClick: 21,
    				bottom: 22,
    				right: 23,
    				tile: 5,
    				disabled: 24,
    				index: 6,
    				style: 7
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$x.name
    		});
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClickOutside() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClickOutside(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/List/ListItem.svelte generated by Svelte v3.34.0 */
    const file$t = "../../../svelte-materialify/packages/svelte-materialify/src/components/List/ListItem.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    function create_fragment$w(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let div3_aria_selected_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[14].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[13], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const subtitle_slot_template = /*#slots*/ ctx[14].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[13], get_subtitle_slot_context);
    	const append_slot_template = /*#slots*/ ctx[14].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[13], get_append_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (subtitle_slot) subtitle_slot.c();
    			t2 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(div0, "class", "s-list-item__title");
    			add_location(div0, file$t, 206, 4, 5372);
    			attr_dev(div1, "class", "s-list-item__subtitle");
    			add_location(div1, file$t, 209, 4, 5435);
    			attr_dev(div2, "class", "s-list-item__content");
    			add_location(div2, file$t, 205, 2, 5333);
    			attr_dev(div3, "class", div3_class_value = "s-list-item " + /*klass*/ ctx[1]);
    			attr_dev(div3, "role", /*role*/ ctx[10]);
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1);
    			attr_dev(div3, "aria-selected", div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			toggle_class(div3, "link", /*link*/ ctx[6]);
    			toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			add_location(div3, file$t, 189, 0, 5000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (subtitle_slot) {
    				subtitle_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_slot) {
    				append_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, div3, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]])),
    					action_destroyer(Ripple_action = Ripple.call(null, div3, /*ripple*/ ctx[8])),
    					listen_dev(div3, "click", /*click*/ ctx[11], false, false, false),
    					listen_dev(div3, "click", /*click_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(subtitle_slot, subtitle_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_subtitle_slot_changes, get_subtitle_slot_context);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 2 && div3_class_value !== (div3_class_value = "s-list-item " + /*klass*/ ctx[1])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*link*/ 64 && div3_tabindex_value !== (div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div3_aria_selected_value !== (div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null)) {
    				attr_dev(div3, "aria-selected", div3_aria_selected_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 5) Class_action.update.call(null, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 256) Ripple_action.update.call(null, /*ripple*/ ctx[8]);

    			if (dirty & /*klass, dense*/ 10) {
    				toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 18) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*klass, multiline*/ 34) {
    				toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			}

    			if (dirty & /*klass, link*/ 66) {
    				toggle_class(div3, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, selectable*/ 130) {
    				toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(subtitle_slot, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(subtitle_slot, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['prepend','default','subtitle','append']);
    	const role = getContext("S_ListItemRole");
    	const ITEM_GROUP = getContext("S_ListItemGroup");

    	const DEFAULTS = {
    		select: () => null,
    		register: () => null,
    		index: () => null,
    		activeClass: "active"
    	};

    	const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS;
    	let { class: klass = "" } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { active = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = null } = $$props;
    	let { multiline = false } = $$props;
    	let { link = role } = $$props;
    	let { selectable = !link } = $$props;
    	let { ripple = getContext("S_ListItemRipple") || role || false } = $$props;
    	let { style = null } = $$props;

    	ITEM.register(values => {
    		$$invalidate(0, active = values.includes(value));
    	});

    	function click() {
    		if (!disabled) ITEM.select(value);
    	}

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"active",
    		"dense",
    		"disabled",
    		"multiline",
    		"link",
    		"selectable",
    		"ripple",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Ripple,
    		Class,
    		role,
    		ITEM_GROUP,
    		DEFAULTS,
    		ITEM,
    		klass,
    		activeClass,
    		value,
    		active,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		activeClass,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		role,
    		click,
    		value,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {
    			class: 1,
    			activeClass: 2,
    			value: 12,
    			active: 0,
    			dense: 3,
    			disabled: 4,
    			multiline: 5,
    			link: 6,
    			selectable: 7,
    			ripple: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/List/ListItemGroup.svelte generated by Svelte v3.34.0 */

    // (22:0) <ItemGroup   class="s-list-item-group {klass}"   role="listbox"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>
    function create_default_slot$d(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(22:0) <ItemGroup   class=\\\"s-list-item-group {klass}\\\"   role=\\\"listbox\\\"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[8](value);
    	}

    	let itemgroup_props = {
    		class: "s-list-item-group " + /*klass*/ ctx[1],
    		role: "listbox",
    		activeClass: /*activeClass*/ ctx[2],
    		multiple: /*multiple*/ ctx[3],
    		mandatory: /*mandatory*/ ctx[4],
    		max: /*max*/ ctx[5],
    		style: /*style*/ ctx[6],
    		$$slots: { default: [create_default_slot$d] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-list-item-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 4) itemgroup_changes.activeClass = /*activeClass*/ ctx[2];
    			if (dirty & /*multiple*/ 8) itemgroup_changes.multiple = /*multiple*/ ctx[3];
    			if (dirty & /*mandatory*/ 16) itemgroup_changes.mandatory = /*mandatory*/ ctx[4];
    			if (dirty & /*max*/ 32) itemgroup_changes.max = /*max*/ ctx[5];
    			if (dirty & /*style*/ 64) itemgroup_changes.style = /*style*/ ctx[6];

    			if (dirty & /*$$scope*/ 512) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItemGroup", slots, ['default']);
    	setContext("S_ListItemRole", "option");
    	setContext("S_ListItemGroup", ITEM_GROUP);
    	let { class: klass = "primary-text" } = $$props;
    	let { value = [] } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "value", "activeClass", "multiple", "mandatory", "max", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItemGroup> was created with unknown prop '${key}'`);
    	});

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		ItemGroup,
    		ITEM_GROUP,
    		klass,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style,
    		slots,
    		itemgroup_value_binding,
    		$$scope
    	];
    }

    class ListItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {
    			class: 1,
    			value: 0,
    			activeClass: 2,
    			multiple: 3,
    			mandatory: 4,
    			max: 5,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItemGroup",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Chip/Chip.svelte generated by Svelte v3.34.0 */
    const file$s = "../../../svelte-materialify/packages/svelte-materialify/src/components/Chip/Chip.svelte";
    const get_close_icon_slot_changes = dirty => ({});
    const get_close_icon_slot_context = ctx => ({});

    // (167:0) {#if active}
    function create_if_block$g(ctx) {
    	let span;
    	let t;
    	let span_class_value;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block = /*close*/ ctx[8] && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3]);
    			toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			toggle_class(span, "pill", /*pill*/ ctx[5]);
    			toggle_class(span, "link", /*link*/ ctx[6]);
    			toggle_class(span, "label", /*label*/ ctx[7]);
    			toggle_class(span, "selected", /*selected*/ ctx[2]);
    			add_location(span, file$s, 167, 2, 4047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(span, t);
    			if (if_block) if_block.m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Ripple_action = Ripple.call(null, span, /*link*/ ctx[6])),
    					listen_dev(span, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (/*close*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*close*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass, size*/ 10 && span_class_value !== (span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3])) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*link*/ 64) Ripple_action.update.call(null, /*link*/ ctx[6]);

    			if (dirty & /*klass, size, outlined*/ 26) {
    				toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			}

    			if (dirty & /*klass, size, pill*/ 42) {
    				toggle_class(span, "pill", /*pill*/ ctx[5]);
    			}

    			if (dirty & /*klass, size, link*/ 74) {
    				toggle_class(span, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, size, label*/ 138) {
    				toggle_class(span, "label", /*label*/ ctx[7]);
    			}

    			if (dirty & /*klass, size, selected*/ 14) {
    				toggle_class(span, "selected", /*selected*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(167:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (178:4) {#if close}
    function create_if_block_1$7(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const close_icon_slot_template = /*#slots*/ ctx[11]["close-icon"];
    	const close_icon_slot = create_slot(close_icon_slot_template, ctx, /*$$scope*/ ctx[10], get_close_icon_slot_context);
    	const close_icon_slot_or_fallback = close_icon_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.c();
    			attr_dev(div, "class", "s-chip__close");
    			add_location(div, file$s, 178, 6, 4247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (close_icon_slot_or_fallback) {
    				close_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClose*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (close_icon_slot) {
    				if (close_icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(close_icon_slot, close_icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_close_icon_slot_changes, get_close_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(178:4) {#if close}",
    		ctx
    	});

    	return block;
    }

    // (180:32)            
    function fallback_block$4(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(180:32)            ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$g(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chip", slots, ['default','close-icon']);
    	let { class: klass = "" } = $$props;
    	let { active = true } = $$props;
    	let { selected = false } = $$props;
    	let { size = "default" } = $$props;
    	let { outlined = false } = $$props;
    	let { pill = false } = $$props;
    	let { link = false } = $$props;
    	let { label = false } = $$props;
    	let { close = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function onClose(e) {
    		$$invalidate(0, active = false);
    		dispatch("close", e);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"selected",
    		"size",
    		"outlined",
    		"pill",
    		"link",
    		"label",
    		"close"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chip> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Icon,
    		closeIcon,
    		createEventDispatcher,
    		klass,
    		active,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		dispatch,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		onClose,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			class: 1,
    			active: 0,
    			selected: 2,
    			size: 3,
    			outlined: 4,
    			pill: 5,
    			link: 6,
    			label: 7,
    			close: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get class() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pill() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pill(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Checkbox/Checkbox.svelte generated by Svelte v3.34.0 */
    const file$r = "../../../svelte-materialify/packages/svelte-materialify/src/components/Checkbox/Checkbox.svelte";

    // (170:6) {#if checked || indeterminate}
    function create_if_block$f(ctx) {
    	let svg;
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*checked*/ ctx[0] ? check : dash);
    			add_location(path, file$r, 175, 10, 4150);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$r, 170, 8, 4016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*checked*/ 1 && path_d_value !== (path_d_value = /*checked*/ ctx[0] ? check : dash)) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(170:6) {#if checked || indeterminate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div2;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let TextColor_action;
    	let t1;
    	let label;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) && create_if_block$f(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "checkbox");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[6];
    			input.__value = /*value*/ ctx[7];
    			input.value = input.__value;
    			if (/*checked*/ ctx[0] === void 0 || /*indeterminate*/ ctx[1] === void 0) add_render_callback(() => /*input_change_handler*/ ctx[16].call(input));
    			add_location(input, file$r, 156, 4, 3665);
    			attr_dev(div0, "class", "s-checkbox__background");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$r, 168, 4, 3915);
    			attr_dev(div1, "class", div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[4]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[6]);
    			add_location(div1, file$r, 151, 2, 3499);
    			attr_dev(label, "for", /*id*/ ctx[2]);
    			add_location(label, file$r, 180, 2, 4235);
    			attr_dev(div2, "class", "s-checkbox");
    			attr_dev(div2, "style", /*style*/ ctx[8]);
    			add_location(div2, file$r, 150, 0, 3464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[15](input);
    			input.checked = /*checked*/ ctx[0];
    			input.indeterminate = /*indeterminate*/ ctx[1];
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[16]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[14], false, false, false),
    					action_destroyer(Ripple.call(null, div1, { centered: true })),
    					action_destroyer(TextColor_action = TextColor.call(null, div1, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    					? /*color*/ ctx[5]
    					: false))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 64) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (!current || dirty & /*value*/ 128) {
    				prop_dev(input, "__value", /*value*/ ctx[7]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*indeterminate*/ 2) {
    				input.indeterminate = /*indeterminate*/ ctx[1];
    			}

    			if (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$f(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*klass*/ 16 && div1_class_value !== (div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[4])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, indeterminate, color*/ 35) TextColor_action.update.call(null, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    			? /*color*/ ctx[5]
    			: false);

    			if (dirty & /*klass, disabled*/ 80) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(label, "for", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 256) {
    				attr_dev(div2, "style", /*style*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[15](null);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const check = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
    const dash = "M4,11L4,13L20,13L20,11L4,11Z";

    function instance$t($$self, $$props, $$invalidate) {
    	let hasValidGroup;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { checked = false } = $$props;
    	let { indeterminate = false } = $$props;
    	let { disabled = false } = $$props;
    	let { value = null } = $$props;
    	let { group = null } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	id = id || `s-checkbox-${uid(5)}`;

    	function groupUpdate() {
    		if (hasValidGroup && value != null) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(10, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"checked",
    		"indeterminate",
    		"disabled",
    		"value",
    		"group",
    		"id",
    		"style",
    		"inputElement"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(3, inputElement);
    		});
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		indeterminate = this.indeterminate;
    		((($$invalidate(0, checked), $$invalidate(11, hasValidGroup)), $$invalidate(7, value)), $$invalidate(10, group));
    		$$invalidate(1, indeterminate);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(4, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(3, inputElement = $$props.inputElement);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		check,
    		dash,
    		Ripple,
    		TextColor,
    		klass,
    		color,
    		checked,
    		indeterminate,
    		disabled,
    		value,
    		group,
    		id,
    		style,
    		inputElement,
    		groupUpdate,
    		hasValidGroup
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(4, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(3, inputElement = $$props.inputElement);
    		if ("hasValidGroup" in $$props) $$invalidate(11, hasValidGroup = $$props.hasValidGroup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*group*/ 1024) {
    			$$invalidate(11, hasValidGroup = Array.isArray(group));
    		}

    		if ($$self.$$.dirty & /*hasValidGroup, value, group*/ 3200) {
    			if (hasValidGroup && value != null) {
    				$$invalidate(0, checked = group.indexOf(value) >= 0);
    			}
    		}
    	};

    	return [
    		checked,
    		indeterminate,
    		id,
    		inputElement,
    		klass,
    		color,
    		disabled,
    		value,
    		style,
    		groupUpdate,
    		group,
    		hasValidGroup,
    		$$scope,
    		slots,
    		change_handler,
    		input_binding,
    		input_change_handler
    	];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {
    			class: 4,
    			color: 5,
    			checked: 0,
    			indeterminate: 1,
    			disabled: 6,
    			value: 7,
    			group: 10,
    			id: 2,
    			style: 8,
    			inputElement: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get class() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var down = 'M7,10L12,15L17,10H7Z';

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Select/Select.svelte generated by Svelte v3.34.0 */
    const file$q = "../../../svelte-materialify/packages/svelte-materialify/src/components/Select/Select.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({ item: dirty & /*items*/ 8 });
    const get_item_slot_context = ctx => ({ item: /*item*/ ctx[22] });
    const get_append_outer_slot_changes = dirty => ({});
    const get_append_outer_slot_context = ctx => ({ slot: "append-outer" });

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    const get_prepend_outer_slot_changes = dirty => ({});
    const get_prepend_outer_slot_context = ctx => ({ slot: "prepend-outer" });

    // (70:8) <slot slot="prepend-outer" name="prepend-outer" />          <slot />         <div slot="content">           {#if chips}
    function create_prepend_outer_slot(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[17]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[20], get_prepend_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_prepend_outer_slot_changes, get_prepend_outer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot.name,
    		type: "slot",
    		source: "(70:8) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />          <slot />         <div slot=\\\"content\\\">           {#if chips}",
    		ctx
    	});

    	return block;
    }

    // (74:10) {#if chips}
    function create_if_block_1$6(ctx) {
    	let span;
    	let current;

    	let each_value_1 = Array.isArray(/*value*/ ctx[0])
    	? /*value*/ ctx[0]
    	: [/*value*/ ctx[0]];

    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "s-select__chips");
    			add_location(span, file$q, 74, 12, 2090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, value*/ 1) {
    				each_value_1 = Array.isArray(/*value*/ ctx[0])
    				? /*value*/ ctx[0]
    				: [/*value*/ ctx[0]];

    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(span, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(74:10) {#if chips}",
    		ctx
    	});

    	return block;
    }

    // (77:16) <Chip>
    function create_default_slot_4$5(ctx) {
    	let t_value = /*v*/ ctx[25] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && t_value !== (t_value = /*v*/ ctx[25] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$5.name,
    		type: "slot",
    		source: "(77:16) <Chip>",
    		ctx
    	});

    	return block;
    }

    // (76:14) {#each Array.isArray(value) ? value : [value] as v}
    function create_each_block_1$2(ctx) {
    	let chip;
    	let current;

    	chip = new Chip({
    			props: {
    				$$slots: { default: [create_default_slot_4$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chip_changes = {};

    			if (dirty & /*$$scope, value*/ 1048577) {
    				chip_changes.$$scope = { dirty, ctx };
    			}

    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(76:14) {#each Array.isArray(value) ? value : [value] as v}",
    		ctx
    	});

    	return block;
    }

    // (73:8) <div slot="content">
    function create_content_slot(ctx) {
    	let div;
    	let current;
    	let if_block = /*chips*/ ctx[13] && create_if_block_1$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "content");
    			add_location(div, file$q, 72, 8, 2035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*chips*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*chips*/ 8192) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$6(ctx);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(73:8) <div slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:8) <span slot="append">
    function create_append_slot$1(ctx) {
    	let span;
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				path: down,
    				rotate: /*active*/ ctx[1] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "slot", "append");
    			add_location(span, file$q, 81, 8, 2301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*active*/ 2) icon_changes.rotate = /*active*/ ctx[1] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
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
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_slot$1.name,
    		type: "slot",
    		source: "(82:8) <span slot=\\\"append\\\">",
    		ctx
    	});

    	return block;
    }

    // (85:8) <slot slot="append-outer" name="append-outer" />       </TextField>     </span>     <ListItemGroup bind:value {mandatory}
    function create_append_outer_slot(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[17]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[20], get_append_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_append_outer_slot_changes, get_append_outer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot.name,
    		type: "slot",
    		source: "(85:8) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" />       </TextField>     </span>     <ListItemGroup bind:value {mandatory}",
    		ctx
    	});

    	return block;
    }

    // (60:6) <TextField         {filled}         {outlined}         {solo}         {dense}         {disabled}         value={format(value)}         {placeholder}         {hint}         readonly>
    function create_default_slot_3$8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block = {
    		c: function create() {
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$8.name,
    		type: "slot",
    		source: "(60:6) <TextField         {filled}         {outlined}         {solo}         {dense}         {disabled}         value={format(value)}         {placeholder}         {hint}         readonly>",
    		ctx
    	});

    	return block;
    }

    // (59:4) <span slot="activator">
    function create_activator_slot(ctx) {
    	let span;
    	let textfield;
    	let current;

    	textfield = new TextField({
    			props: {
    				filled: /*filled*/ ctx[4],
    				outlined: /*outlined*/ ctx[5],
    				solo: /*solo*/ ctx[6],
    				dense: /*dense*/ ctx[7],
    				disabled: /*disabled*/ ctx[14],
    				value: /*format*/ ctx[16](/*value*/ ctx[0]),
    				placeholder: /*placeholder*/ ctx[8],
    				hint: /*hint*/ ctx[9],
    				readonly: true,
    				$$slots: {
    					default: [create_default_slot_3$8],
    					"append-outer": [create_append_outer_slot],
    					append: [create_append_slot$1],
    					content: [create_content_slot],
    					"prepend-outer": [create_prepend_outer_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(textfield.$$.fragment);
    			attr_dev(span, "slot", "activator");
    			add_location(span, file$q, 58, 4, 1738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(textfield, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty & /*filled*/ 16) textfield_changes.filled = /*filled*/ ctx[4];
    			if (dirty & /*outlined*/ 32) textfield_changes.outlined = /*outlined*/ ctx[5];
    			if (dirty & /*solo*/ 64) textfield_changes.solo = /*solo*/ ctx[6];
    			if (dirty & /*dense*/ 128) textfield_changes.dense = /*dense*/ ctx[7];
    			if (dirty & /*disabled*/ 16384) textfield_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*format, value*/ 65537) textfield_changes.value = /*format*/ ctx[16](/*value*/ ctx[0]);
    			if (dirty & /*placeholder*/ 256) textfield_changes.placeholder = /*placeholder*/ ctx[8];
    			if (dirty & /*hint*/ 512) textfield_changes.hint = /*hint*/ ctx[9];

    			if (dirty & /*$$scope, active, value, chips*/ 1056771) {
    				textfield_changes.$$scope = { dirty, ctx };
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(textfield);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot.name,
    		type: "slot",
    		source: "(59:4) <span slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (93:14) {#if multiple}
    function create_if_block$e(ctx) {
    	let checkbox;
    	let current;

    	checkbox = new Checkbox({
    			props: {
    				checked: /*value*/ ctx[0].includes(/*item*/ ctx[22].value)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(checkbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};
    			if (dirty & /*value, items*/ 9) checkbox_changes.checked = /*value*/ ctx[0].includes(/*item*/ ctx[22].value);
    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(93:14) {#if multiple}",
    		ctx
    	});

    	return block;
    }

    // (92:12) <span slot="prepend">
    function create_prepend_slot(ctx) {
    	let span;
    	let current;
    	let if_block = /*multiple*/ ctx[11] && create_if_block$e(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span, "slot", "prepend");
    			add_location(span, file$q, 91, 12, 2670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*multiple*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*multiple*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot.name,
    		type: "slot",
    		source: "(92:12) <span slot=\\\"prepend\\\">",
    		ctx
    	});

    	return block;
    }

    // (91:10) <ListItem {dense} value={item.value}>
    function create_default_slot_2$9(ctx) {
    	let t0;
    	let t1_value = /*item*/ ctx[22].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (t1_value !== (t1_value = /*item*/ ctx[22].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$9.name,
    		type: "slot",
    		source: "(91:10) <ListItem {dense} value={item.value}>",
    		ctx
    	});

    	return block;
    }

    // (90:33)            
    function fallback_block$3(ctx) {
    	let listitem;
    	let t;
    	let current;

    	listitem = new ListItem({
    			props: {
    				dense: /*dense*/ ctx[7],
    				value: /*item*/ ctx[22].value,
    				$$slots: {
    					default: [create_default_slot_2$9],
    					prepend: [create_prepend_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = {};
    			if (dirty & /*dense*/ 128) listitem_changes.dense = /*dense*/ ctx[7];
    			if (dirty & /*items*/ 8) listitem_changes.value = /*item*/ ctx[22].value;

    			if (dirty & /*$$scope, items, value, multiple*/ 1050633) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(90:33)            ",
    		ctx
    	});

    	return block;
    }

    // (89:6) {#each items as item}
    function create_each_block$3(ctx) {
    	let current;
    	const item_slot_template = /*#slots*/ ctx[17].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[20], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items*/ 1048584) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*dense, items, value, multiple*/ 2185) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(89:6) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (88:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>
    function create_default_slot_1$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dense, items, value, multiple, $$scope*/ 1050761) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$a.name,
    		type: "slot",
    		source: "(88:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>",
    		ctx
    	});

    	return block;
    }

    // (58:2) <Menu offsetY={false} bind:active {disabled} {closeOnClick}>
    function create_default_slot$c(ctx) {
    	let t;
    	let listitemgroup;
    	let updating_value;
    	let current;

    	function listitemgroup_value_binding(value) {
    		/*listitemgroup_value_binding*/ ctx[18](value);
    	}

    	let listitemgroup_props = {
    		mandatory: /*mandatory*/ ctx[10],
    		multiple: /*multiple*/ ctx[11],
    		max: /*max*/ ctx[12],
    		$$slots: { default: [create_default_slot_1$a] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		listitemgroup_props.value = /*value*/ ctx[0];
    	}

    	listitemgroup = new ListItemGroup({
    			props: listitemgroup_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(listitemgroup, "value", listitemgroup_value_binding));

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(listitemgroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(listitemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitemgroup_changes = {};
    			if (dirty & /*mandatory*/ 1024) listitemgroup_changes.mandatory = /*mandatory*/ ctx[10];
    			if (dirty & /*multiple*/ 2048) listitemgroup_changes.multiple = /*multiple*/ ctx[11];
    			if (dirty & /*max*/ 4096) listitemgroup_changes.max = /*max*/ ctx[12];

    			if (dirty & /*$$scope, items, dense, value, multiple*/ 1050761) {
    				listitemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitemgroup.$set(listitemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(listitemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(58:2) <Menu offsetY={false} bind:active {disabled} {closeOnClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let div;
    	let menu;
    	let updating_active;
    	let div_class_value;
    	let current;

    	function menu_active_binding(value) {
    		/*menu_active_binding*/ ctx[19](value);
    	}

    	let menu_props = {
    		offsetY: false,
    		disabled: /*disabled*/ ctx[14],
    		closeOnClick: /*closeOnClick*/ ctx[15],
    		$$slots: {
    			default: [create_default_slot$c],
    			activator: [create_activator_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[1] !== void 0) {
    		menu_props.active = /*active*/ ctx[1];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, "active", menu_active_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menu.$$.fragment);
    			attr_dev(div, "class", div_class_value = "s-select " + /*klass*/ ctx[2]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			toggle_class(div, "chips", /*chips*/ ctx[13]);
    			add_location(div, file$q, 56, 0, 1613);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menu, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};
    			if (dirty & /*disabled*/ 16384) menu_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*closeOnClick*/ 32768) menu_changes.closeOnClick = /*closeOnClick*/ ctx[15];

    			if (dirty & /*$$scope, mandatory, multiple, max, value, items, dense, filled, outlined, solo, disabled, format, placeholder, hint, active, chips*/ 1146875) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 2) {
    				updating_active = true;
    				menu_changes.active = /*active*/ ctx[1];
    				add_flush_callback(() => updating_active = false);
    			}

    			menu.$set(menu_changes);

    			if (!current || dirty & /*klass*/ 4 && div_class_value !== (div_class_value = "s-select " + /*klass*/ ctx[2])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, disabled*/ 16388) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			}

    			if (dirty & /*klass, chips*/ 8196) {
    				toggle_class(div, "chips", /*chips*/ ctx[13]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['prepend-outer','default','append-outer','item']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { value = [] } = $$props;
    	let { items = [] } = $$props;
    	let { filled = false } = $$props;
    	let { outlined = false } = $$props;
    	let { solo = false } = $$props;
    	let { dense = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { mandatory = false } = $$props;
    	let { multiple = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { chips = false } = $$props;
    	let { disabled = null } = $$props;
    	let { closeOnClick = !multiple } = $$props;
    	let { format = val => Array.isArray(val) ? val.join(", ") : val } = $$props;
    	const dispatch = createEventDispatcher();

    	const writable_props = [
    		"class",
    		"active",
    		"value",
    		"items",
    		"filled",
    		"outlined",
    		"solo",
    		"dense",
    		"placeholder",
    		"hint",
    		"mandatory",
    		"multiple",
    		"max",
    		"chips",
    		"disabled",
    		"closeOnClick",
    		"format"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function listitemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function menu_active_binding(value) {
    		active = value;
    		$$invalidate(1, active);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("closeOnClick" in $$props) $$invalidate(15, closeOnClick = $$props.closeOnClick);
    		if ("format" in $$props) $$invalidate(16, format = $$props.format);
    		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		TextField,
    		Menu,
    		ListItemGroup,
    		ListItem,
    		Chip,
    		Checkbox,
    		Icon,
    		DOWN_ICON: down,
    		klass,
    		active,
    		value,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		closeOnClick,
    		format,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("closeOnClick" in $$props) $$invalidate(15, closeOnClick = $$props.closeOnClick);
    		if ("format" in $$props) $$invalidate(16, format = $$props.format);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			dispatch("change", value);
    		}
    	};

    	return [
    		value,
    		active,
    		klass,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		closeOnClick,
    		format,
    		slots,
    		listitemgroup_value_binding,
    		menu_active_binding,
    		$$scope
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			class: 2,
    			active: 1,
    			value: 0,
    			items: 3,
    			filled: 4,
    			outlined: 5,
    			solo: 6,
    			dense: 7,
    			placeholder: 8,
    			hint: 9,
    			mandatory: 10,
    			multiple: 11,
    			max: 12,
    			chips: 13,
    			disabled: 14,
    			closeOnClick: 15,
    			format: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chips() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chips(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClick() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Switch/Switch.svelte generated by Svelte v3.34.0 */
    const file$p = "../../../svelte-materialify/packages/svelte-materialify/src/components/Switch/Switch.svelte";

    function create_fragment$r(ctx) {
    	let div3;
    	let div2;
    	let input;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let TextColor_action;
    	let t2;
    	let label;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "switch");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			input.disabled = /*disabled*/ ctx[8];
    			input.__value = /*value*/ ctx[5];
    			input.value = input.__value;
    			add_location(input, file$p, 196, 4, 4532);
    			attr_dev(div0, "class", "s-switch__track");
    			add_location(div0, file$p, 207, 4, 4755);
    			attr_dev(div1, "class", "s-switch__thumb");
    			add_location(div1, file$p, 208, 4, 4791);
    			attr_dev(div2, "class", "s-switch__wrapper");
    			toggle_class(div2, "dense", /*dense*/ ctx[7]);
    			toggle_class(div2, "inset", /*inset*/ ctx[6]);
    			toggle_class(div2, "disabled", /*disabled*/ ctx[8]);
    			add_location(div2, file$p, 190, 2, 4404);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			add_location(label, file$p, 210, 2, 4834);
    			attr_dev(div3, "class", div3_class_value = "s-switch " + /*klass*/ ctx[3]);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			add_location(div3, file$p, 189, 0, 4363);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[15](input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div3, t2);
    			append_dev(div3, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[16]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[10], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[14], false, false, false),
    					action_destroyer(TextColor_action = TextColor.call(null, div2, /*checked*/ ctx[0] && /*color*/ ctx[4]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 256) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[8]);
    			}

    			if (!current || dirty & /*value*/ 32) {
    				prop_dev(input, "__value", /*value*/ ctx[5]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, color*/ 17) TextColor_action.update.call(null, /*checked*/ ctx[0] && /*color*/ ctx[4]);

    			if (dirty & /*dense*/ 128) {
    				toggle_class(div2, "dense", /*dense*/ ctx[7]);
    			}

    			if (dirty & /*inset*/ 64) {
    				toggle_class(div2, "inset", /*inset*/ ctx[6]);
    			}

    			if (dirty & /*disabled*/ 256) {
    				toggle_class(div2, "disabled", /*disabled*/ ctx[8]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(label, "for", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 8 && div3_class_value !== (div3_class_value = "s-switch " + /*klass*/ ctx[3])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*input_binding*/ ctx[15](null);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { value = null } = $$props;
    	let { group = [] } = $$props;
    	let { checked = false } = $$props;
    	let { inset = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = false } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	id = id || `s-switch-${uid(5)}`;
    	const hasValidGroup = Array.isArray(group);

    	if (hasValidGroup && value) {
    		if (group.indexOf(value) >= 0) checked = true;
    	}

    	function groupUpdate() {
    		if (hasValidGroup && value) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(11, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"value",
    		"group",
    		"checked",
    		"inset",
    		"dense",
    		"disabled",
    		"id",
    		"style",
    		"inputElement"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(3, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("group" in $$props) $$invalidate(11, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(6, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(2, inputElement = $$props.inputElement);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		TextColor,
    		klass,
    		color,
    		value,
    		group,
    		checked,
    		inset,
    		dense,
    		disabled,
    		id,
    		style,
    		inputElement,
    		hasValidGroup,
    		groupUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(3, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("group" in $$props) $$invalidate(11, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(6, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(2, inputElement = $$props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		checked,
    		id,
    		inputElement,
    		klass,
    		color,
    		value,
    		inset,
    		dense,
    		disabled,
    		style,
    		groupUpdate,
    		group,
    		$$scope,
    		slots,
    		change_handler,
    		input_binding,
    		input_change_handler
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			class: 3,
    			color: 4,
    			value: 5,
    			group: 11,
    			checked: 0,
    			inset: 6,
    			dense: 7,
    			disabled: 8,
    			id: 1,
    			style: 9,
    			inputElement: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get class() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (themeColors.includes(i)) return `${i}-color`;
        return i;
      });
    }

    function setBackgroundColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.backgroundColor = text;
        return false;
      }

      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.backgroundColor = `var(${text})`;
        return false;
      }

      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var BackgroundColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setBackgroundColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.backgroundColor = null;
          }

          if (typeof newText === 'string') {
            klass = setBackgroundColor(node, newText);
          }
        },
      };
    };

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Overlay/Overlay.svelte generated by Svelte v3.34.0 */
    const file$o = "../../../svelte-materialify/packages/svelte-materialify/src/components/Overlay/Overlay.svelte";

    // (51:0) {#if active}
    function create_if_block$d(ctx) {
    	let div2;
    	let div0;
    	let BackgroundColor_action;
    	let t;
    	let div1;
    	let div2_class_value;
    	let div2_style_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "s-overlay__scrim svelte-7bull3");
    			set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			add_location(div0, file$o, 58, 4, 1181);
    			attr_dev(div1, "class", "s-overlay__content svelte-7bull3");
    			add_location(div1, file$o, 59, 4, 1272);
    			attr_dev(div2, "class", div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-7bull3");
    			attr_dev(div2, "style", div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9]);
    			toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			add_location(div2, file$o, 51, 2, 1017);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*color*/ ctx[6])),
    					listen_dev(div2, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 32) {
    				set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 64) BackgroundColor_action.update.call(null, /*color*/ ctx[6]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-7bull3")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*index, style*/ 640 && div2_style_value !== (div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, absolute*/ 257) {
    				toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, /*transition*/ ctx[1], /*inOpts*/ ctx[2]);
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, /*transition*/ ctx[1], /*outOpts*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(51:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[4] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Overlay", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 250 } } = $$props;
    	let { active = true } = $$props;
    	let { opacity = 0.46 } = $$props;
    	let { color = "rgb(33, 33, 33)" } = $$props;
    	let { index = 5 } = $$props;
    	let { absolute = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"active",
    		"opacity",
    		"color",
    		"index",
    		"absolute",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		BackgroundColor,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			class: 0,
    			transition: 1,
    			inOpts: 2,
    			outOpts: 3,
    			active: 4,
    			opacity: 5,
    			color: 6,
    			index: 7,
    			absolute: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get class() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Dialog/Dialog.svelte generated by Svelte v3.34.0 */
    const file$n = "../../../svelte-materialify/packages/svelte-materialify/src/components/Dialog/Dialog.svelte";

    // (91:0) {#if visible}
    function create_if_block$c(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div0_transition;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "s-dialog__content " + /*klass*/ ctx[0]);
    			toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			add_location(div0, file$n, 92, 4, 2194);
    			attr_dev(div1, "role", "document");
    			attr_dev(div1, "class", "s-dialog");
    			add_location(div1, file$n, 91, 2, 2113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "introstart", /*introstart_handler*/ ctx[12], false, false, false),
    					listen_dev(div0, "outrostart", /*outrostart_handler*/ ctx[13], false, false, false),
    					listen_dev(div0, "introend", /*introend_handler*/ ctx[14], false, false, false),
    					listen_dev(div0, "outroend", /*outroend_handler*/ ctx[15], false, false, false),
    					action_destroyer(Style_action = Style.call(null, div1, { "dialog-width": /*width*/ ctx[1] }))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div0_class_value !== (div0_class_value = "s-dialog__content " + /*klass*/ ctx[0])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fullscreen*/ 5) {
    				toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*width*/ 2) Style_action.update.call(null, { "dialog-width": /*width*/ ctx[1] });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, true);
    				div0_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, false);
    			div0_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(91:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let t;
    	let overlay_1;
    	let current;
    	let if_block = /*visible*/ ctx[5] && create_if_block$c(ctx);
    	const overlay_1_spread_levels = [/*overlay*/ ctx[4], { active: /*visible*/ ctx[5] }];
    	let overlay_1_props = {};

    	for (let i = 0; i < overlay_1_spread_levels.length; i += 1) {
    		overlay_1_props = assign(overlay_1_props, overlay_1_spread_levels[i]);
    	}

    	overlay_1 = new Overlay({ props: overlay_1_props, $$inline: true });
    	overlay_1.$on("click", /*close*/ ctx[6]);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(overlay_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(overlay_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
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

    			const overlay_1_changes = (dirty & /*overlay, visible*/ 48)
    			? get_spread_update(overlay_1_spread_levels, [
    					dirty & /*overlay*/ 16 && get_spread_object(/*overlay*/ ctx[4]),
    					dirty & /*visible*/ 32 && { active: /*visible*/ ctx[5] }
    				])
    			: {};

    			overlay_1.$set(overlay_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(overlay_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(overlay_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(overlay_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let visible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dialog", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { persistent = false } = $$props;
    	let { disabled = false } = $$props;
    	let { width = 500 } = $$props;
    	let { fullscreen = false } = $$props;
    	let { transition = scale } = $$props;
    	let { overlay = {} } = $$props;

    	function close() {
    		if (!persistent) $$invalidate(7, active = false);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"persistent",
    		"disabled",
    		"width",
    		"fullscreen",
    		"transition",
    		"overlay"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	function introstart_handler(event) {
    		bubble($$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble($$self, event);
    	}

    	function introend_handler(event) {
    		bubble($$self, event);
    	}

    	function outroend_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Overlay,
    		Style,
    		scale,
    		klass,
    		active,
    		persistent,
    		disabled,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		close,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active, disabled*/ 640) {
    			$$invalidate(5, visible = active && !disabled);
    		}
    	};

    	return [
    		klass,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		visible,
    		close,
    		active,
    		persistent,
    		disabled,
    		$$scope,
    		slots,
    		introstart_handler,
    		outrostart_handler,
    		introend_handler,
    		outroend_handler
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			class: 0,
    			active: 7,
    			persistent: 8,
    			disabled: 9,
    			width: 1,
    			fullscreen: 2,
    			transition: 3,
    			overlay: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get class() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overlay() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overlay(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/ExpansionPanels/ExpansionPanels.svelte generated by Svelte v3.34.0 */
    const file$m = "../../../svelte-materialify/packages/svelte-materialify/src/components/ExpansionPanels/ExpansionPanels.svelte";

    function create_fragment$o(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-expansion-panels " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[6]);
    			toggle_class(div, "accordion", /*accordion*/ ctx[1]);
    			toggle_class(div, "popout", /*popout*/ ctx[2]);
    			toggle_class(div, "inset", /*inset*/ ctx[3]);
    			toggle_class(div, "flat", /*flat*/ ctx[4]);
    			toggle_class(div, "tile", /*tile*/ ctx[5]);
    			add_location(div, file$m, 139, 0, 3712);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-expansion-panels " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 64) {
    				attr_dev(div, "style", /*style*/ ctx[6]);
    			}

    			if (dirty & /*klass, accordion*/ 3) {
    				toggle_class(div, "accordion", /*accordion*/ ctx[1]);
    			}

    			if (dirty & /*klass, popout*/ 5) {
    				toggle_class(div, "popout", /*popout*/ ctx[2]);
    			}

    			if (dirty & /*klass, inset*/ 9) {
    				toggle_class(div, "inset", /*inset*/ ctx[3]);
    			}

    			if (dirty & /*klass, flat*/ 17) {
    				toggle_class(div, "flat", /*flat*/ ctx[4]);
    			}

    			if (dirty & /*klass, tile*/ 33) {
    				toggle_class(div, "tile", /*tile*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const EXPANSION_PANELS = {};

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExpansionPanels", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { accordion = false } = $$props;
    	let { popout = false } = $$props;
    	let { inset = false } = $$props;
    	let { flat = false } = $$props;
    	let { tile = false } = $$props;
    	let { disabled = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const values = writable(value);
    	const Disabled = writable(disabled);
    	let startIndex = -1;

    	setContext(EXPANSION_PANELS, {
    		values,
    		Disabled,
    		selectPanel: index => {
    			if (value.includes(index)) {
    				if (!(mandatory && value.length === 1)) {
    					value.splice(value.indexOf(index), 1);
    					$$invalidate(7, value);
    					dispatch("change", { index, active: false });
    				}
    			} else {
    				if (multiple) {
    					value.push(index);
    					$$invalidate(7, value);
    				} else {
    					$$invalidate(7, value = [index]);
    				}

    				dispatch("change", { index, active: true });
    			}
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		}
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"multiple",
    		"mandatory",
    		"accordion",
    		"popout",
    		"inset",
    		"flat",
    		"tile",
    		"disabled",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpansionPanels> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(9, mandatory = $$props.mandatory);
    		if ("accordion" in $$props) $$invalidate(1, accordion = $$props.accordion);
    		if ("popout" in $$props) $$invalidate(2, popout = $$props.popout);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("flat" in $$props) $$invalidate(4, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		EXPANSION_PANELS,
    		createEventDispatcher,
    		setContext,
    		writable,
    		klass,
    		value,
    		multiple,
    		mandatory,
    		accordion,
    		popout,
    		inset,
    		flat,
    		tile,
    		disabled,
    		style,
    		dispatch,
    		values,
    		Disabled,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(9, mandatory = $$props.mandatory);
    		if ("accordion" in $$props) $$invalidate(1, accordion = $$props.accordion);
    		if ("popout" in $$props) $$invalidate(2, popout = $$props.popout);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("flat" in $$props) $$invalidate(4, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 128) {
    			values.set(value);
    		}

    		if ($$self.$$.dirty & /*disabled*/ 1024) {
    			Disabled.set(disabled);
    		}
    	};

    	return [
    		klass,
    		accordion,
    		popout,
    		inset,
    		flat,
    		tile,
    		style,
    		value,
    		multiple,
    		mandatory,
    		disabled,
    		$$scope,
    		slots
    	];
    }

    class ExpansionPanels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			class: 0,
    			value: 7,
    			multiple: 8,
    			mandatory: 9,
    			accordion: 1,
    			popout: 2,
    			inset: 3,
    			flat: 4,
    			tile: 5,
    			disabled: 10,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpansionPanels",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get class() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accordion() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accordion(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popout() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popout(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/ExpansionPanels/ExpansionPanel.svelte generated by Svelte v3.34.0 */
    const file$l = "../../../svelte-materialify/packages/svelte-materialify/src/components/ExpansionPanels/ExpansionPanel.svelte";
    const get_icon_slot_changes = dirty => ({ active: dirty & /*active*/ 32 });
    const get_icon_slot_context = ctx => ({ active: /*active*/ ctx[5] });
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (155:33)          
    function fallback_block$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				disabled: /*disabled*/ ctx[0],
    				path: down,
    				rotate: /*active*/ ctx[5] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*disabled*/ 1) icon_changes.disabled = /*disabled*/ ctx[0];
    			if (dirty & /*active*/ 32) icon_changes.rotate = /*active*/ ctx[5] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(155:33)          ",
    		ctx
    	});

    	return block;
    }

    // (160:2) {#if active}
    function create_if_block$b(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "s-expansion-panel__content");
    			add_location(div, file$l, 160, 4, 4176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "introstart", /*introstart_handler*/ ctx[13], false, false, false),
    					listen_dev(div, "outrostart", /*outrostart_handler*/ ctx[14], false, false, false),
    					listen_dev(div, "introend", /*introend_handler*/ ctx[15], false, false, false),
    					listen_dev(div, "outroend", /*outroend_handler*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, /*slideOpts*/ ctx[2], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, /*slideOpts*/ ctx[2], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(160:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div1;
    	let button;
    	let t0;
    	let div0;
    	let button_tabindex_value;
    	let t1;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*#slots*/ ctx[12].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[11], get_header_slot_context);
    	const icon_slot_template = /*#slots*/ ctx[12].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[11], get_icon_slot_context);
    	const icon_slot_or_fallback = icon_slot || fallback_block$2(ctx);
    	let if_block = /*active*/ ctx[5] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button = element("button");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (icon_slot_or_fallback) icon_slot_or_fallback.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "s-expansion-panel__icon");
    			add_location(div0, file$l, 152, 4, 3921);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "s-expansion-panel__header");
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[0] ? -1 : null);
    			add_location(button, file$l, 145, 2, 3725);
    			attr_dev(div1, "class", div1_class_value = "s-expansion-panel " + /*klass*/ ctx[1]);
    			attr_dev(div1, "aria-expanded", /*active*/ ctx[5]);
    			attr_dev(div1, "style", /*style*/ ctx[4]);
    			toggle_class(div1, "active", /*active*/ ctx[5]);
    			toggle_class(div1, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			add_location(div1, file$l, 138, 0, 3597);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);

    			if (header_slot) {
    				header_slot.m(button, null);
    			}

    			append_dev(button, t0);
    			append_dev(button, div0);

    			if (icon_slot_or_fallback) {
    				icon_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope, active*/ 2080) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			} else {
    				if (icon_slot_or_fallback && icon_slot_or_fallback.p && dirty & /*disabled, active*/ 33) {
    					icon_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*disabled*/ 1 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[0] ? -1 : null)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (/*active*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass*/ 2 && div1_class_value !== (div1_class_value = "s-expansion-panel " + /*klass*/ ctx[1])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*active*/ 32) {
    				attr_dev(div1, "aria-expanded", /*active*/ ctx[5]);
    			}

    			if (!current || dirty & /*style*/ 16) {
    				attr_dev(div1, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*klass, active*/ 34) {
    				toggle_class(div1, "active", /*active*/ ctx[5]);
    			}

    			if (dirty & /*klass, readonly*/ 10) {
    				toggle_class(div1, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 3) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(icon_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(icon_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);
    			if (icon_slot_or_fallback) icon_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $Disabled;
    	let $values;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExpansionPanel", slots, ['header','icon','default']);
    	const { values, Disabled, selectPanel, index } = getContext(EXPANSION_PANELS);
    	validate_store(values, "values");
    	component_subscribe($$self, values, value => $$invalidate(10, $values = value));
    	validate_store(Disabled, "Disabled");
    	component_subscribe($$self, Disabled, value => $$invalidate(9, $Disabled = value));

    	// Classes to add to the panel.
    	let { class: klass = "" } = $$props;

    	let { slideOpts = {} } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { style = null } = $$props;
    	const value = index();
    	let active = false;

    	function toggle() {
    		selectPanel(value);
    	}

    	const writable_props = ["class", "slideOpts", "readonly", "disabled", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpansionPanel> was created with unknown prop '${key}'`);
    	});

    	function introstart_handler(event) {
    		bubble($$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble($$self, event);
    	}

    	function introend_handler(event) {
    		bubble($$self, event);
    	}

    	function outroend_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("slideOpts" in $$props) $$invalidate(2, slideOpts = $$props.slideOpts);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		EXPANSION_PANELS,
    		slide,
    		Icon,
    		down,
    		values,
    		Disabled,
    		selectPanel,
    		index,
    		klass,
    		slideOpts,
    		readonly,
    		disabled,
    		style,
    		value,
    		active,
    		toggle,
    		$Disabled,
    		$values
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("slideOpts" in $$props) $$invalidate(2, slideOpts = $$props.slideOpts);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("active" in $$props) $$invalidate(5, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$Disabled, disabled*/ 513) {
    			// Inheriting the disabled value from parent.
    			$$invalidate(0, disabled = $Disabled == null ? disabled : $Disabled);
    		}

    		if ($$self.$$.dirty & /*$values*/ 1024) {
    			// Checking if panel is active everytime the value has changed.
    			$$invalidate(5, active = $values.includes(value));
    		}
    	};

    	return [
    		disabled,
    		klass,
    		slideOpts,
    		readonly,
    		style,
    		active,
    		values,
    		Disabled,
    		toggle,
    		$Disabled,
    		$values,
    		$$scope,
    		slots,
    		introstart_handler,
    		outrostart_handler,
    		introend_handler,
    		outroend_handler
    	];
    }

    class ExpansionPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			class: 1,
    			slideOpts: 2,
    			readonly: 3,
    			disabled: 0,
    			style: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpansionPanel",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get class() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slideOpts() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slideOpts(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/ProgressLinear/ProgressLinear.svelte generated by Svelte v3.34.0 */
    const file$k = "../../../svelte-materialify/packages/svelte-materialify/src/components/ProgressLinear/ProgressLinear.svelte";

    // (163:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "determinate svelte-nixde4");
    			set_style(div, "width", /*value*/ ctx[1] + "%");
    			toggle_class(div, "striped", /*striped*/ ctx[12]);
    			add_location(div, file$k, 163, 4, 3723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 2) {
    				set_style(div, "width", /*value*/ ctx[1] + "%");
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);

    			if (dirty & /*striped*/ 4096) {
    				toggle_class(div, "striped", /*striped*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(163:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#if indeterminate}
    function create_if_block_1$5(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "indeterminate long svelte-nixde4");
    			add_location(div0, file$k, 159, 6, 3621);
    			attr_dev(div1, "class", "indeterminate short svelte-nixde4");
    			add_location(div1, file$k, 160, 6, 3662);
    			add_location(div2, file$k, 158, 4, 3581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div2, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(158:2) {#if indeterminate}",
    		ctx
    	});

    	return block;
    }

    // (175:2) {#if stream}
    function create_if_block$a(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "stream " + /*color*/ ctx[7] + " svelte-nixde4");
    			set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			add_location(div, file$k, 175, 4, 3934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 128 && div_class_value !== (div_class_value = "stream " + /*color*/ ctx[7] + " svelte-nixde4")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*buffer*/ 256) {
    				set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(175:2) {#if stream}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div2;
    	let div0;
    	let div0_style_value;
    	let BackgroundColor_action;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;
    	let div2_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*indeterminate*/ ctx[3]) return create_if_block_1$5;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*stream*/ ctx[10] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "background svelte-nixde4");
    			attr_dev(div0, "style", div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? "right" : "left") + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%");
    			add_location(div0, file$k, 152, 2, 3378);
    			attr_dev(div1, "class", "s-progress-linear__content svelte-nixde4");
    			add_location(div1, file$k, 170, 2, 3851);
    			attr_dev(div2, "role", "progressbar");
    			attr_dev(div2, "aria-valuemin", "0");
    			attr_dev(div2, "aria-valuemax", "100");
    			attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			attr_dev(div2, "class", div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-nixde4");
    			attr_dev(div2, "style", div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13]);
    			toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			add_location(div2, file$k, 142, 0, 3153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if_block0.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*backgroundColor*/ ctx[5]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*backgroundOpacity, reversed, value, buffer*/ 834 && div0_style_value !== (div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? "right" : "left") + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*backgroundColor*/ 32) BackgroundColor_action.update.call(null, /*backgroundColor*/ ctx[5]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, t1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (/*stream*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*value*/ 2) {
    				attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-nixde4")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*height, style*/ 8208 && div2_style_value !== (div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, active*/ 5) {
    				toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			}

    			if (dirty & /*klass, reversed*/ 513) {
    				toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			}

    			if (dirty & /*klass, rounded*/ 2049) {
    				toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressLinear", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { active = true } = $$props;
    	let { indeterminate = false } = $$props;
    	let { height = "4px" } = $$props;
    	let { backgroundColor = "primary" } = $$props;
    	let { backgroundOpacity = 0.3 } = $$props;
    	let { color = backgroundColor } = $$props;
    	let { buffer = 100 } = $$props;
    	let { reversed = false } = $$props;
    	let { stream = false } = $$props;
    	let { rounded = false } = $$props;
    	let { striped = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"value",
    		"active",
    		"indeterminate",
    		"height",
    		"backgroundColor",
    		"backgroundOpacity",
    		"color",
    		"buffer",
    		"reversed",
    		"stream",
    		"rounded",
    		"striped",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressLinear> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("indeterminate" in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("backgroundColor" in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ("backgroundOpacity" in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("buffer" in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ("reversed" in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ("stream" in $$props) $$invalidate(10, stream = $$props.stream);
    		if ("rounded" in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ("striped" in $$props) $$invalidate(12, striped = $$props.striped);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		BackgroundColor,
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("indeterminate" in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("backgroundColor" in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ("backgroundOpacity" in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("buffer" in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ("reversed" in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ("stream" in $$props) $$invalidate(10, stream = $$props.stream);
    		if ("rounded" in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ("striped" in $$props) $$invalidate(12, striped = $$props.striped);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style,
    		$$scope,
    		slots
    	];
    }

    class ProgressLinear extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			class: 0,
    			value: 1,
    			active: 2,
    			indeterminate: 3,
    			height: 4,
    			backgroundColor: 5,
    			backgroundOpacity: 6,
    			color: 7,
    			buffer: 8,
    			reversed: 9,
    			stream: 10,
    			rounded: 11,
    			striped: 12,
    			style: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressLinear",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get class() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundOpacity() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundOpacity(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buffer() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buffer(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reversed() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reversed(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stream() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stream(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Card/Card.svelte generated by Svelte v3.34.0 */
    const file$j = "../../../svelte-materialify/packages/svelte-materialify/src/components/Card/Card.svelte";
    const get_progress_slot_changes = dirty => ({});
    const get_progress_slot_context = ctx => ({});

    // (108:2) {#if loading}
    function create_if_block$9(ctx) {
    	let current;
    	const progress_slot_template = /*#slots*/ ctx[12].progress;
    	const progress_slot = create_slot(progress_slot_template, ctx, /*$$scope*/ ctx[11], get_progress_slot_context);
    	const progress_slot_or_fallback = progress_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (progress_slot_or_fallback) {
    				progress_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (progress_slot) {
    				if (progress_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(progress_slot, progress_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_progress_slot_changes, get_progress_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(108:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (109:26)        
    function fallback_block$1(ctx) {
    	let progresslinear;
    	let current;

    	progresslinear = new ProgressLinear({
    			props: { indeterminate: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progresslinear.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresslinear, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresslinear.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresslinear.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresslinear, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(109:26)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let if_block = /*loading*/ ctx[8] && create_if_block$9(ctx);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[10]);
    			toggle_class(div, "flat", /*flat*/ ctx[1]);
    			toggle_class(div, "tile", /*tile*/ ctx[2]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			toggle_class(div, "raised", /*raised*/ ctx[4]);
    			toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			toggle_class(div, "hover", /*hover*/ ctx[6]);
    			toggle_class(div, "link", /*link*/ ctx[7]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[9]);
    			add_location(div, file$j, 96, 0, 2668);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loading*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loading*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(div, "style", /*style*/ ctx[10]);
    			}

    			if (dirty & /*klass, flat*/ 3) {
    				toggle_class(div, "flat", /*flat*/ ctx[1]);
    			}

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(div, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, outlined*/ 9) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			}

    			if (dirty & /*klass, raised*/ 17) {
    				toggle_class(div, "raised", /*raised*/ ctx[4]);
    			}

    			if (dirty & /*klass, shaped*/ 33) {
    				toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			}

    			if (dirty & /*klass, hover*/ 65) {
    				toggle_class(div, "hover", /*hover*/ ctx[6]);
    			}

    			if (dirty & /*klass, link*/ 129) {
    				toggle_class(div, "link", /*link*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 513) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[9]);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['progress','default']);
    	let { class: klass = "" } = $$props;
    	let { flat = false } = $$props;
    	let { tile = false } = $$props;
    	let { outlined = false } = $$props;
    	let { raised = false } = $$props;
    	let { shaped = false } = $$props;
    	let { hover = false } = $$props;
    	let { link = false } = $$props;
    	let { loading = false } = $$props;
    	let { disabled = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"flat",
    		"tile",
    		"outlined",
    		"raised",
    		"shaped",
    		"hover",
    		"link",
    		"loading",
    		"disabled",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("raised" in $$props) $$invalidate(4, raised = $$props.raised);
    		if ("shaped" in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ("hover" in $$props) $$invalidate(6, hover = $$props.hover);
    		if ("link" in $$props) $$invalidate(7, link = $$props.link);
    		if ("loading" in $$props) $$invalidate(8, loading = $$props.loading);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ProgressLinear,
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("raised" in $$props) $$invalidate(4, raised = $$props.raised);
    		if ("shaped" in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ("hover" in $$props) $$invalidate(6, hover = $$props.hover);
    		if ("link" in $$props) $$invalidate(7, link = $$props.link);
    		if ("loading" in $$props) $$invalidate(8, loading = $$props.loading);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			class: 0,
    			flat: 1,
    			tile: 2,
    			outlined: 3,
    			raised: 4,
    			shaped: 5,
    			hover: 6,
    			link: 7,
    			loading: 8,
    			disabled: 9,
    			style: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raised() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raised(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shaped() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shaped(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardActions.svelte generated by Svelte v3.34.0 */

    const file$i = "../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardActions.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-actions " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$i, 13, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-actions " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardActions", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardActions> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardActions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardActions",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get class() {
    		throw new Error("<CardActions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardActions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardActions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardActions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardText.svelte generated by Svelte v3.34.0 */

    const file$h = "../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardText.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-text " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$h, 17, 0, 371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-text " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardText", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardText",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardTitle.svelte generated by Svelte v3.34.0 */

    const file$g = "../../../svelte-materialify/packages/svelte-materialify/src/components/Card/CardTitle.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-title " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$g, 27, 0, 612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-title " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardTitle", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardTitle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardTitle",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get class() {
    		throw new Error("<CardTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Container.svelte generated by Svelte v3.34.0 */

    const file$f = "../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Container.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-container " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			toggle_class(div, "fluid", /*fluid*/ ctx[1]);
    			add_location(div, file$f, 33, 0, 629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-container " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*klass, fluid*/ 3) {
    				toggle_class(div, "fluid", /*fluid*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Container", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fluid = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "fluid", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("fluid" in $$props) $$invalidate(1, fluid = $$props.fluid);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, fluid, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("fluid" in $$props) $$invalidate(1, fluid = $$props.fluid);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, fluid, style, $$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { class: 0, fluid: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Row.svelte generated by Svelte v3.34.0 */

    const file$e = "../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Row.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-row " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			toggle_class(div, "dense", /*dense*/ ctx[1]);
    			toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			add_location(div, file$e, 31, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-row " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 3) {
    				toggle_class(div, "dense", /*dense*/ ctx[1]);
    			}

    			if (dirty & /*klass, noGutters*/ 5) {
    				toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Row", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { dense = false } = $$props;
    	let { noGutters = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "dense", "noGutters", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("noGutters" in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, dense, noGutters, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("noGutters" in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, dense, noGutters, style, $$scope, slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 0,
    			dense: 1,
    			noGutters: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Col.svelte generated by Svelte v3.34.0 */
    const file$d = "../../../svelte-materialify/packages/svelte-materialify/src/components/Grid/Col.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let div_class_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-col " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[11]);
    			add_location(div, file$d, 484, 0, 10008);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Class_action = Class.call(null, div, [
    					/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    					/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    					/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    					/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    					/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    					/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    					/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    					/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    					/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    					/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    				]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-col " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(div, "style", /*style*/ ctx[11]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*cols, sm, md, lg, xl, offset, offset_sm, offset_md, offset_lg, offset_xl*/ 2046) Class_action.update.call(null, [
    				/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    				/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    				/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    				/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    				/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    				/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    				/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    				/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    				/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    				/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    			]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Col", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { cols = false } = $$props;
    	let { sm = false } = $$props;
    	let { md = false } = $$props;
    	let { lg = false } = $$props;
    	let { xl = false } = $$props;
    	let { offset = false } = $$props;
    	let { offset_sm = false } = $$props;
    	let { offset_md = false } = $$props;
    	let { offset_lg = false } = $$props;
    	let { offset_xl = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"cols",
    		"sm",
    		"md",
    		"lg",
    		"xl",
    		"offset",
    		"offset_sm",
    		"offset_md",
    		"offset_lg",
    		"offset_xl",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Col> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("cols" in $$props) $$invalidate(1, cols = $$props.cols);
    		if ("sm" in $$props) $$invalidate(2, sm = $$props.sm);
    		if ("md" in $$props) $$invalidate(3, md = $$props.md);
    		if ("lg" in $$props) $$invalidate(4, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(5, xl = $$props.xl);
    		if ("offset" in $$props) $$invalidate(6, offset = $$props.offset);
    		if ("offset_sm" in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ("offset_md" in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ("offset_lg" in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ("offset_xl" in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Class,
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("cols" in $$props) $$invalidate(1, cols = $$props.cols);
    		if ("sm" in $$props) $$invalidate(2, sm = $$props.sm);
    		if ("md" in $$props) $$invalidate(3, md = $$props.md);
    		if ("lg" in $$props) $$invalidate(4, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(5, xl = $$props.xl);
    		if ("offset" in $$props) $$invalidate(6, offset = $$props.offset);
    		if ("offset_sm" in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ("offset_md" in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ("offset_lg" in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ("offset_xl" in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 0,
    			cols: 1,
    			sm: 2,
    			md: 3,
    			lg: 4,
    			xl: 5,
    			offset: 6,
    			offset_sm: 7,
    			offset_md: 8,
    			offset_lg: 9,
    			offset_xl: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var prevIcon = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';

    var nextIcon = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/SlideGroup/SlideGroup.svelte generated by Svelte v3.34.0 */
    const file$c = "../../../svelte-materialify/packages/svelte-materialify/src/components/SlideGroup/SlideGroup.svelte";
    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_previous_slot_changes = dirty => ({});
    const get_previous_slot_context = ctx => ({});

    // (113:2) {#if arrowsVisible}
    function create_if_block_1$4(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const previous_slot_template = /*#slots*/ ctx[17].previous;
    	const previous_slot = create_slot(previous_slot_template, ctx, /*$$scope*/ ctx[22], get_previous_slot_context);
    	const previous_slot_or_fallback = previous_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (previous_slot_or_fallback) previous_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__prev");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$c, 113, 4, 2552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (previous_slot_or_fallback) {
    				previous_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*prev*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (previous_slot) {
    				if (previous_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(previous_slot, previous_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_previous_slot_changes, get_previous_slot_context);
    				}
    			}

    			if (dirty & /*x*/ 512) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previous_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previous_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (previous_slot_or_fallback) previous_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(113:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (119:28)          
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: prevIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(119:28)          ",
    		ctx
    	});

    	return block;
    }

    // (136:2) {#if arrowsVisible}
    function create_if_block$8(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const next_slot_template = /*#slots*/ ctx[17].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[22], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__next");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$c, 136, 4, 3137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*next*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			}

    			if (dirty & /*x, contentWidth, wrapperWidth*/ 896) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(136:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (142:24)          
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: nextIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(142:24)          ",
    		ctx
    	});

    	return block;
    }

    // (105:0) <ItemGroup   class="s-slide-group {klass}"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>
    function create_default_slot$b(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_resize_listener;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrowsVisible*/ ctx[10] && create_if_block_1$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*arrowsVisible*/ ctx[10] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "s-slide-group__content");
    			set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[18].call(div0));
    			add_location(div0, file$c, 128, 4, 2953);
    			attr_dev(div1, "class", "s-slide-group__wrapper");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			add_location(div1, file$c, 123, 2, 2796);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[18].bind(div0));
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "touchstart", /*touchstart*/ ctx[13], { passive: true }, false, false),
    					listen_dev(div1, "touchmove", /*touchmove*/ ctx[14], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*x*/ 512) {
    				set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			}

    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			div1_resize_listener();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(105:0) <ItemGroup   class=\\\"s-slide-group {klass}\\\"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[20](value);
    	}

    	let itemgroup_props = {
    		class: "s-slide-group " + /*klass*/ ctx[1],
    		activeClass: /*activeClass*/ ctx[3],
    		multiple: /*multiple*/ ctx[4],
    		mandatory: /*mandatory*/ ctx[5],
    		max: /*max*/ ctx[6],
    		$$slots: { default: [create_default_slot$b] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));
    	itemgroup.$on("change", /*change_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-slide-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 8) itemgroup_changes.activeClass = /*activeClass*/ ctx[3];
    			if (dirty & /*multiple*/ 16) itemgroup_changes.multiple = /*multiple*/ ctx[4];
    			if (dirty & /*mandatory*/ 32) itemgroup_changes.mandatory = /*mandatory*/ ctx[5];
    			if (dirty & /*max*/ 64) itemgroup_changes.max = /*max*/ ctx[6];

    			if (dirty & /*$$scope, x, contentWidth, wrapperWidth, hideDisabledArrows, arrowsVisible*/ 4196228) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SLIDE_GROUP = {};

    function instance$e($$self, $$props, $$invalidate) {
    	let arrowsVisible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideGroup", slots, ['previous','default','next']);
    	let contentWidth;
    	let wrapperWidth;
    	let { class: klass = "" } = $$props;
    	let { showArrows = true } = $$props;
    	let { hideDisabledArrows = false } = $$props;
    	let { centerActive = false } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let x = 0;

    	setContext(SLIDE_GROUP, item => {
    		const left = item.offsetLeft;
    		const width = item.offsetWidth;

    		if (centerActive) $$invalidate(9, x = left + (width - wrapperWidth) / 2); else if (left + 1.25 * width > wrapperWidth + x) {
    			$$invalidate(9, x = left + 1.25 * width - wrapperWidth);
    		} else if (left < x + width / 4) {
    			$$invalidate(9, x = left - width / 4);
    		}
    	});

    	afterUpdate(() => {
    		if (x + wrapperWidth > contentWidth) $$invalidate(9, x = contentWidth - wrapperWidth); else if (x < 0) $$invalidate(9, x = 0);
    	});

    	function next() {
    		$$invalidate(9, x += wrapperWidth);
    	}

    	function prev() {
    		$$invalidate(9, x -= wrapperWidth);
    	}

    	let touchStartX;

    	function touchstart({ touches }) {
    		touchStartX = x + touches[0].clientX;
    	}

    	function touchmove({ touches }) {
    		$$invalidate(9, x = touchStartX - touches[0].clientX);
    	}

    	const writable_props = [
    		"class",
    		"showArrows",
    		"hideDisabledArrows",
    		"centerActive",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideGroup> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		$$invalidate(7, contentWidth);
    	}

    	function div1_elementresize_handler() {
    		wrapperWidth = this.clientWidth;
    		$$invalidate(8, wrapperWidth);
    	}

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SLIDE_GROUP,
    		setContext,
    		afterUpdate,
    		ItemGroup,
    		prevIcon,
    		nextIcon,
    		Icon,
    		contentWidth,
    		wrapperWidth,
    		klass,
    		showArrows,
    		hideDisabledArrows,
    		centerActive,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		x,
    		next,
    		prev,
    		touchStartX,
    		touchstart,
    		touchmove,
    		arrowsVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentWidth" in $$props) $$invalidate(7, contentWidth = $$props.contentWidth);
    		if ("wrapperWidth" in $$props) $$invalidate(8, wrapperWidth = $$props.wrapperWidth);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("x" in $$props) $$invalidate(9, x = $$props.x);
    		if ("touchStartX" in $$props) touchStartX = $$props.touchStartX;
    		if ("arrowsVisible" in $$props) $$invalidate(10, arrowsVisible = $$props.arrowsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperWidth, contentWidth, showArrows*/ 33152) {
    			$$invalidate(10, arrowsVisible = wrapperWidth < contentWidth && showArrows);
    		}
    	};

    	return [
    		value,
    		klass,
    		hideDisabledArrows,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		contentWidth,
    		wrapperWidth,
    		x,
    		arrowsVisible,
    		next,
    		prev,
    		touchstart,
    		touchmove,
    		showArrows,
    		centerActive,
    		slots,
    		div0_elementresize_handler,
    		div1_elementresize_handler,
    		itemgroup_value_binding,
    		change_handler,
    		$$scope
    	];
    }

    class SlideGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 1,
    			showArrows: 15,
    			hideDisabledArrows: 2,
    			centerActive: 16,
    			activeClass: 3,
    			value: 0,
    			multiple: 4,
    			mandatory: 5,
    			max: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideGroup",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideDisabledArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDisabledArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Window/Window.svelte generated by Svelte v3.34.0 */
    const file$b = "../../../svelte-materialify/packages/svelte-materialify/src/components/Window/Window.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window " + /*klass*/ ctx[0]);
    			toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			add_location(div, file$b, 119, 0, 3576);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[12](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, reverse*/ 5) {
    				toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const WINDOW = {};

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { value = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { reverse = false } = $$props;
    	let { continuous = true } = $$props;
    	let container;
    	const windowItems = [];
    	let moving = false;

    	setContext(WINDOW, window => {
    		windowItems.push(window);
    	});

    	function set(index) {
    		const prevIndex = windowItems.findIndex(i => i.classList.contains(activeClass));

    		if (!moving && windowItems[index] && index !== prevIndex) {
    			moving = true;
    			let direction;
    			let position;

    			if (index > prevIndex) {
    				direction = "left";
    				position = "next";
    			} else {
    				direction = "right";
    				position = "prev";
    			}

    			const prev = windowItems[prevIndex];
    			prev.classList.add(direction);
    			$$invalidate(3, container.style.height = `${prev.offsetHeight}px`, container);
    			const active = windowItems[index];
    			active.classList.add(position);
    			$$invalidate(3, container.style.height = `${active.offsetHeight}px`, container);
    			active.classList.add(direction);

    			setTimeout(
    				() => {
    					prev.classList.remove("active", direction);
    					active.classList.add("active");
    					active.classList.remove(position, direction);
    					$$invalidate(3, container.style.height = null, container);
    					moving = false;
    					$$invalidate(4, value = index);
    				},
    				300
    			);
    		}
    	}

    	function next() {
    		if (value === windowItems.length - 1) {
    			if (continuous) set(0);
    		} else {
    			set(value + 1);
    		}
    	}

    	function previous() {
    		if (value === 0) {
    			if (continuous) set(windowItems.length - 1);
    		} else {
    			set(value - 1);
    		}
    	}

    	onMount(() => {
    		const activeItem = windowItems[value];
    		if (activeItem) activeItem.classList.add(activeClass);
    	});

    	const writable_props = ["class", "activeClass", "value", "vertical", "reverse", "continuous"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		WINDOW,
    		onMount,
    		setContext,
    		klass,
    		activeClass,
    		value,
    		vertical,
    		reverse,
    		continuous,
    		container,
    		windowItems,
    		moving,
    		set,
    		next,
    		previous
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("moving" in $$props) moving = $$props.moving;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 16) {
    			set(value);
    		}
    	};

    	return [
    		klass,
    		vertical,
    		reverse,
    		container,
    		value,
    		activeClass,
    		continuous,
    		set,
    		next,
    		previous,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 0,
    			activeClass: 5,
    			value: 4,
    			vertical: 1,
    			reverse: 2,
    			continuous: 6,
    			set: 7,
    			next: 8,
    			previous: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get continuous() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set continuous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get set() {
    		return this.$$.ctx[7];
    	}

    	set set(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[8];
    	}

    	set next(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		return this.$$.ctx[9];
    	}

    	set previous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Window/WindowItem.svelte generated by Svelte v3.34.0 */
    const file$a = "../../../svelte-materialify/packages/svelte-materialify/src/components/Window/WindowItem.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window-item " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$a, 31, 0, 720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window-item " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WindowItem", slots, ['default']);
    	let window;
    	const registerWindow = getContext(WINDOW);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;

    	onMount(() => {
    		registerWindow(window);
    	});

    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WindowItem> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			window = $$value;
    			$$invalidate(2, window);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		WINDOW,
    		window,
    		registerWindow,
    		klass,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("window" in $$props) $$invalidate(2, window = $$props.window);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, window, $$scope, slots, div_binding];
    }

    class WindowItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowItem",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/Tabs.svelte generated by Svelte v3.34.0 */
    const file$9 = "../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/Tabs.svelte";
    const get_tabs_slot_changes = dirty => ({});
    const get_tabs_slot_context = ctx => ({});

    // (154:6) {#if slider}
    function create_if_block$7(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10]);
    			add_location(div, file$9, 154, 8, 3571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderClass*/ 1024 && div_class_value !== (div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(154:6) {#if slider}",
    		ctx
    	});

    	return block;
    }

    // (146:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>
    function create_default_slot_1$9(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const tabs_slot_template = /*#slots*/ ctx[16].tabs;
    	const tabs_slot = create_slot(tabs_slot_template, ctx, /*$$scope*/ ctx[21], get_tabs_slot_context);
    	let if_block = /*slider*/ ctx[9] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (tabs_slot) tabs_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (tabs_slot) {
    				tabs_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tabs_slot) {
    				if (tabs_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(tabs_slot, tabs_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_tabs_slot_changes, get_tabs_slot_context);
    				}
    			}

    			if (/*slider*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tabs_slot) tabs_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$9.name,
    		type: "slot",
    		source: "(146:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>",
    		ctx
    	});

    	return block;
    }

    // (159:2) <Window bind:this={windowComponent}>
    function create_default_slot$a(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(159:2) <Window bind:this={windowComponent}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let slidegroup;
    	let updating_value;
    	let div0_class_value;
    	let t;
    	let window;
    	let current;

    	function slidegroup_value_binding(value) {
    		/*slidegroup_value_binding*/ ctx[18](value);
    	}

    	let slidegroup_props = {
    		mandatory: true,
    		centerActive: /*centerActive*/ ctx[2],
    		showArrows: /*showArrows*/ ctx[3],
    		$$slots: { default: [create_default_slot_1$9] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		slidegroup_props.value = /*value*/ ctx[0];
    	}

    	slidegroup = new SlideGroup({ props: slidegroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(slidegroup, "value", slidegroup_value_binding));
    	slidegroup.$on("change", /*moveSlider*/ ctx[14]);
    	slidegroup.$on("change", /*change_handler*/ ctx[19]);

    	let window_props = {
    		$$slots: { default: [create_default_slot$a] },
    		$$scope: { ctx }
    	};

    	window = new Window({ props: window_props, $$inline: true });
    	/*window_binding*/ ctx[20](window);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slidegroup.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1]);
    			attr_dev(div0, "role", "tablist");
    			toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			toggle_class(div0, "right", /*right*/ ctx[7]);
    			toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			add_location(div0, file$9, 137, 2, 3227);
    			attr_dev(div1, "class", "s-tabs");
    			attr_dev(div1, "role", "tablist");
    			toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			add_location(div1, file$9, 136, 0, 3174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slidegroup, div0, null);
    			append_dev(div1, t);
    			mount_component(window, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidegroup_changes = {};
    			if (dirty & /*centerActive*/ 4) slidegroup_changes.centerActive = /*centerActive*/ ctx[2];
    			if (dirty & /*showArrows*/ 8) slidegroup_changes.showArrows = /*showArrows*/ ctx[3];

    			if (dirty & /*$$scope, sliderClass, sliderElement, slider*/ 2102784) {
    				slidegroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				slidegroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidegroup.$set(slidegroup_changes);

    			if (!current || dirty & /*klass*/ 2 && div0_class_value !== (div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fixedTabs*/ 18) {
    				toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			}

    			if (dirty & /*klass, grow*/ 34) {
    				toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			}

    			if (dirty & /*klass, centered*/ 66) {
    				toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			}

    			if (dirty & /*klass, right*/ 130) {
    				toggle_class(div0, "right", /*right*/ ctx[7]);
    			}

    			if (dirty & /*klass, icons*/ 258) {
    				toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			}

    			const window_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);

    			if (dirty & /*vertical*/ 2048) {
    				toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidegroup.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidegroup.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidegroup);
    			/*window_binding*/ ctx[20](null);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['tabs','default']);
    	let sliderElement;
    	let windowComponent;
    	const tabs = [];
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { centerActive = false } = $$props;
    	let { showArrows = true } = $$props;
    	let { fixedTabs = false } = $$props;
    	let { grow = false } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { icons = false } = $$props;
    	let { slider = true } = $$props;
    	let { sliderClass = "" } = $$props;
    	let { ripple = {} } = $$props;
    	let { vertical = false } = $$props;

    	setContext(TABS, {
    		ripple,
    		registerTab: tab => {
    			tabs.push(tab);
    		}
    	});

    	function moveSlider({ detail }) {
    		if (slider) {
    			const activeTab = tabs[detail];

    			if (vertical) {
    				$$invalidate(12, sliderElement.style.top = `${activeTab.offsetTop}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.height = `${activeTab.offsetHeight}px`, sliderElement);
    			} else {
    				$$invalidate(12, sliderElement.style.left = `${activeTab.offsetLeft}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.width = `${activeTab.offsetWidth}px`, sliderElement);
    			}
    		}

    		windowComponent.set(value);
    	}

    	onMount(() => {
    		moveSlider({ detail: value });
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"centerActive",
    		"showArrows",
    		"fixedTabs",
    		"grow",
    		"centered",
    		"right",
    		"icons",
    		"slider",
    		"sliderClass",
    		"ripple",
    		"vertical"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(12, sliderElement);
    		});
    	}

    	function slidegroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function window_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			windowComponent = $$value;
    			$$invalidate(13, windowComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ("$$scope" in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		SlideGroup,
    		Window,
    		onMount,
    		setContext,
    		sliderElement,
    		windowComponent,
    		tabs,
    		klass,
    		value,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		ripple,
    		vertical,
    		moveSlider
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(12, sliderElement = $$props.sliderElement);
    		if ("windowComponent" in $$props) $$invalidate(13, windowComponent = $$props.windowComponent);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		vertical,
    		sliderElement,
    		windowComponent,
    		moveSlider,
    		ripple,
    		slots,
    		div_binding,
    		slidegroup_value_binding,
    		change_handler,
    		window_binding,
    		$$scope
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 1,
    			value: 0,
    			centerActive: 2,
    			showArrows: 3,
    			fixedTabs: 4,
    			grow: 5,
    			centered: 6,
    			right: 7,
    			icons: 8,
    			slider: 9,
    			sliderClass: 10,
    			ripple: 15,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedTabs() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedTabs(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icons() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icons(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slider() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slider(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliderClass() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliderClass(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/Tab.svelte generated by Svelte v3.34.0 */
    const file$8 = "../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/Tab.svelte";

    function create_fragment$a(ctx) {
    	let button;
    	let button_class_value;
    	let button_tabindex_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0]);
    			attr_dev(button, "role", "tab");
    			attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0);
    			toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			add_location(button, file$8, 90, 0, 2042);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[11](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]])),
    					listen_dev(button, "click", /*selectTab*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false),
    					action_destroyer(Ripple.call(null, button, /*ripple*/ ctx[5]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && button_class_value !== (button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*active*/ 16) {
    				attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 4 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 18) Class_action.update.call(null, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]]);

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, active*/ 17) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Tab", slots, ['default']);
    	let tab;
    	const click = getContext(SLIDE_GROUP);
    	const ITEM = getContext(ITEM_GROUP);
    	const { ripple, registerTab } = getContext(TABS);
    	let { class: klass = "" } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { disabled = null } = $$props;
    	let active;

    	ITEM.register(values => {
    		$$invalidate(4, active = values.includes(value));
    	});

    	function selectTab({ target }) {
    		if (!disabled) {
    			click(target);
    			ITEM.select(value);
    		}
    	}

    	onMount(() => {
    		registerTab(tab);
    	});

    	const writable_props = ["class", "value", "activeClass", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tab = $$value;
    			$$invalidate(3, tab);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		SLIDE_GROUP,
    		ITEM_GROUP,
    		TABS,
    		Class,
    		Ripple,
    		tab,
    		click,
    		ITEM,
    		ripple,
    		registerTab,
    		klass,
    		value,
    		activeClass,
    		disabled,
    		active,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		activeClass,
    		disabled,
    		tab,
    		active,
    		ripple,
    		selectTab,
    		value,
    		$$scope,
    		slots,
    		click_handler,
    		button_binding
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 0,
    			value: 7,
    			activeClass: 1,
    			disabled: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/TabContent.svelte generated by Svelte v3.34.0 */
    const file$7 = "../../../svelte-materialify/packages/svelte-materialify/src/components/Tabs/TabContent.svelte";

    // (10:2) <WindowItem>
    function create_default_slot$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(10:2) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let windowitem;
    	let div_class_value;
    	let current;

    	windowitem = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(windowitem.$$.fragment);
    			attr_dev(div, "class", div_class_value = "s-tab-content " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", "tabpanel");
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$7, 8, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(windowitem, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const windowitem_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				windowitem_changes.$$scope = { dirty, ctx };
    			}

    			windowitem.$set(windowitem_changes);

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-tab-content " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(windowitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(windowitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(windowitem);
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
    	validate_slots("TabContent", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ WindowItem, klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, slots, $$scope];
    }

    class TabContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabContent",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<TabContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TabContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TabContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const LAYOUTS = [
      {name: "Mono / 0+1+0", value: "0+1+0", channels: 1},
      {name: "Stereo / 0+2+0", value: "0+2+0", channels: 2},
      {name: "5.1 / 0+5+0", value: "0+5+0", channels: 6},
      {name: "5.1+2H / 2+5+0", value: "2+5+0", channels: 8},
      {name: "5.1+4H / 4+5+0", value: "4+5+0", channels: 10},
      // {name: "7.2+3H / 3+7+0", value: "3+7+0", channels: 12},
      {name: "9.1+4H / 4+9+0", value: "4+9+0", channels: 14},
      {name: "22.2 / 9+10+3", value: "9+10+3", channels: 24},
      {name: "7.1 / 0+7+0", value: "0+7+0", channels: 8},
      {name: "7.1+4H / 4+7+0", value: "4+7+0", channels: 12},
      // {name: "7.1+2H / 2+7+0", value: "2+7+0", channels: 10},
      {name: "Object", value: "Object", channels: 1},
      {name: "Binaural" , value: "Binaural", channels: 2}
    ];

    function getRangeFromDisplayedName(str){
      try {
        let min = parseInt(str.split(" - ")[0]);
        let max = parseInt(str.split(" - ")[1]);
        return getRangeFromMinMax(min, max);
      } catch (e) {
        return false;
      }
    }

    function getRangeFromMinMax(min, max){
      return Array.from({length:max-min+1},(v,k)=>k+min);
    }

    function getLayout(layout){
      let bs2051_layout = LAYOUTS.filter(l => {
        return l.value === layout;
      });
      return bs2051_layout[0];
    }

    function getLayoutRoutingPairs(layout, wav_channels){
      let bs2051_layout = getLayout(layout);
      return getValidRoutingPair(bs2051_layout.channels, wav_channels)
    }


    function getValidLayouts(wav_channels){
      let valid_layouts = [];
      for (const sys of LAYOUTS){
          if (sys.channels <= wav_channels){
            valid_layouts.push({name: sys.name, value: sys.value, channels: sys.channels});
          }
      }
      return valid_layouts;
    }

     function getValidRoutingPair(sys_chs, wav_channels){
      let routing_pairs = [];
      for (const ch of Array(wav_channels).keys()){
          // axml / chna track index starts with 1
          let upper = 1 + ch + sys_chs - 1;
          if (upper <= wav_channels){
            //let range_val = [1 + ch, upper];
            let range_name = String(1 + ch) + " - " + String(upper);
            routing_pairs.push({name: range_name, value: range_name});
          } else {
          break;
          }
      }
      return routing_pairs;
     }

    /* src/components/Routing.svelte generated by Svelte v3.34.0 */
    const file$6 = "src/components/Routing.svelte";

    // (14:0) {#if activeItem}
    function create_if_block$6(ctx) {
    	let div;
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(container.$$.fragment);
    			attr_dev(div, "class", "routing svelte-1hsp3yd");
    			add_location(div, file$6, 14, 0, 393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(container, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope, routings, activeItem*/ 19) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(14:0) {#if activeItem}",
    		ctx
    	});

    	return block;
    }

    // (18:4) <Col cols={12} sm={8} md={8}>
    function create_default_slot_3$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Select channel routing for item");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$7.name,
    		type: "slot",
    		source: "(18:4) <Col cols={12} sm={8} md={8}>",
    		ctx
    	});

    	return block;
    }

    // (21:4) <Col cols={12} sm={4} md={4}>
    function create_default_slot_2$8(ctx) {
    	let div;
    	let select;
    	let updating_value;
    	let current;

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[3](value);
    	}

    	let select_props = {
    		solo: true,
    		items: /*routings*/ ctx[1],
    		placeholder: "Routing"
    	};

    	if (/*activeItem*/ ctx[0].routing !== void 0) {
    		select_props.value = /*activeItem*/ ctx[0].routing;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(select.$$.fragment);
    			attr_dev(div, "class", "routing-select svelte-1hsp3yd");
    			add_location(div, file$6, 21, 6, 562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(select, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*routings*/ 2) select_changes.items = /*routings*/ ctx[1];

    			if (!updating_value && dirty & /*activeItem*/ 1) {
    				updating_value = true;
    				select_changes.value = /*activeItem*/ ctx[0].routing;
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(select);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$8.name,
    		type: "slot",
    		source: "(21:4) <Col cols={12} sm={4} md={4}>",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Row>
    function create_default_slot_1$8(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				cols: 12,
    				sm: 8,
    				md: 8,
    				$$slots: { default: [create_default_slot_3$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				cols: 12,
    				sm: 4,
    				md: 4,
    				$$slots: { default: [create_default_slot_2$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope, routings, activeItem*/ 19) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$8.name,
    		type: "slot",
    		source: "(17:2) <Row>",
    		ctx
    	});

    	return block;
    }

    // (16:2) <Container>
    function create_default_slot$8(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, routings, activeItem*/ 19) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(16:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeItem*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*activeItem*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $fileInfo;
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(2, $fileInfo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Routing", slots, []);
    	let { activeItem } = $$props;
    	let routings = [];
    	const writable_props = ["activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Routing> was created with unknown prop '${key}'`);
    	});

    	function select_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.routing, value)) {
    			activeItem.routing = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		ADMStore,
    		fileInfo,
    		Select,
    		Container,
    		Row,
    		Col,
    		getLayoutRoutingPairs,
    		activeItem,
    		routings,
    		$fileInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ("routings" in $$props) $$invalidate(1, routings = $$props.routings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeItem, $fileInfo*/ 5) {
    			if (typeof activeItem !== "undefined") {
    				$$invalidate(1, routings = getLayoutRoutingPairs(activeItem.type, $fileInfo.channels));
    			}
    		}
    	};

    	return [activeItem, routings, $fileInfo, select_value_binding];
    }

    class Routing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { activeItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Routing",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeItem*/ ctx[0] === undefined && !("activeItem" in props)) {
    			console.warn("<Routing> was created without expected prop 'activeItem'");
    		}
    	}

    	get activeItem() {
    		throw new Error("<Routing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Routing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Interactivity.svelte generated by Svelte v3.34.0 */

    // (7:0) {#if activeItem}
    function create_if_block$5(ctx) {
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 129) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(7:0) {#if activeItem}",
    		ctx
    	});

    	return block;
    }

    // (11:8) <Switch bind:checked={activeItem.interactivity.onOffInteract}>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("On/Off Interaction");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(11:8) <Switch bind:checked={activeItem.interactivity.onOffInteract}>",
    		ctx
    	});

    	return block;
    }

    // (12:8) <Switch bind:checked={activeItem.interactivity.gainInteract}>
    function create_default_slot_7$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gain Interaction");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$2.name,
    		type: "slot",
    		source: "(12:8) <Switch bind:checked={activeItem.interactivity.gainInteract}>",
    		ctx
    	});

    	return block;
    }

    // (13:8) {#if activeItem.interactivity.gainInteract}
    function create_if_block_2$2(ctx) {
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[3](value);
    	}

    	let slider_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: -60,
    		max: 20,
    		step: 0.5,
    		precision: 1,
    		color: "white",
    		$$slots: { default: [create_default_slot_6$3] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.gainInteractionRange !== void 0) {
    		slider_props.value = /*activeItem*/ ctx[0].interactivity.gainInteractionRange;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, "value", slider_value_binding));

    	const block = {
    		c: function create() {
    			create_component(slider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				slider_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeItem*/ 1) {
    				updating_value = true;
    				slider_changes.value = /*activeItem*/ ctx[0].interactivity.gainInteractionRange;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(13:8) {#if activeItem.interactivity.gainInteract}",
    		ctx
    	});

    	return block;
    }

    // (14:10) <Slider thumb                    persistentThumb                    min={-60}                    max={20}                    step={0.5}                    precision={1}                    bind:value={activeItem.interactivity.gainInteractionRange}                    color="white"           >
    function create_default_slot_6$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gain Interaction Range");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$3.name,
    		type: "slot",
    		source: "(14:10) <Slider thumb                    persistentThumb                    min={-60}                    max={20}                    step={0.5}                    precision={1}                    bind:value={activeItem.interactivity.gainInteractionRange}                    color=\\\"white\\\"           >",
    		ctx
    	});

    	return block;
    }

    // (24:8) <Switch bind:checked={activeItem.interactivity.positionInteract}>
    function create_default_slot_5$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Position Interaction");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$4.name,
    		type: "slot",
    		source: "(24:8) <Switch bind:checked={activeItem.interactivity.positionInteract}>",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#if activeItem.interactivity.positionInteract}
    function create_if_block_1$3(ctx) {
    	let slider0;
    	let updating_value;
    	let t;
    	let slider1;
    	let updating_value_1;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[5](value);
    	}

    	let slider0_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: -180,
    		max: 180,
    		step: 1,
    		color: "white",
    		$$slots: { default: [create_default_slot_4$4] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.azRange !== void 0) {
    		slider0_props.value = /*activeItem*/ ctx[0].interactivity.azRange;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, "value", slider0_value_binding));

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[6](value);
    	}

    	let slider1_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: -90,
    		max: 90,
    		step: 1,
    		color: "white",
    		$$slots: { default: [create_default_slot_3$6] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.elRange !== void 0) {
    		slider1_props.value = /*activeItem*/ ctx[0].interactivity.elRange;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, "value", slider1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(slider0.$$.fragment);
    			t = space();
    			create_component(slider1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(slider1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				slider0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeItem*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*activeItem*/ ctx[0].interactivity.azRange;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				slider1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty & /*activeItem*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*activeItem*/ ctx[0].interactivity.elRange;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(slider1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(25:8) {#if activeItem.interactivity.positionInteract}",
    		ctx
    	});

    	return block;
    }

    // (26:10) <Slider thumb                    persistentThumb                    min={-180}                    max={180}                    step={1}                    bind:value={activeItem.interactivity.azRange}                    color="white"           >
    function create_default_slot_4$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Azimuth Range");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$4.name,
    		type: "slot",
    		source: "(26:10) <Slider thumb                    persistentThumb                    min={-180}                    max={180}                    step={1}                    bind:value={activeItem.interactivity.azRange}                    color=\\\"white\\\"           >",
    		ctx
    	});

    	return block;
    }

    // (34:10) <Slider thumb                    persistentThumb                    min={-90}                    max={90}                    step={1}                    bind:value={activeItem.interactivity.elRange}                    color="white"           >
    function create_default_slot_3$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Elevation Range");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$6.name,
    		type: "slot",
    		source: "(34:10) <Slider thumb                    persistentThumb                    min={-90}                    max={90}                    step={1}                    bind:value={activeItem.interactivity.elRange}                    color=\\\"white\\\"           >",
    		ctx
    	});

    	return block;
    }

    // (10:6) <Col cols={12} sm={12} md={12}>
    function create_default_slot_2$7(ctx) {
    	let switch0;
    	let updating_checked;
    	let t0;
    	let switch1;
    	let updating_checked_1;
    	let t1;
    	let t2;
    	let switch2;
    	let updating_checked_2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	function switch0_checked_binding(value) {
    		/*switch0_checked_binding*/ ctx[1](value);
    	}

    	let switch0_props = {
    		$$slots: { default: [create_default_slot_8$1] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.onOffInteract !== void 0) {
    		switch0_props.checked = /*activeItem*/ ctx[0].interactivity.onOffInteract;
    	}

    	switch0 = new Switch({ props: switch0_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch0, "checked", switch0_checked_binding));

    	function switch1_checked_binding(value) {
    		/*switch1_checked_binding*/ ctx[2](value);
    	}

    	let switch1_props = {
    		$$slots: { default: [create_default_slot_7$2] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.gainInteract !== void 0) {
    		switch1_props.checked = /*activeItem*/ ctx[0].interactivity.gainInteract;
    	}

    	switch1 = new Switch({ props: switch1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch1, "checked", switch1_checked_binding));
    	let if_block0 = /*activeItem*/ ctx[0].interactivity.gainInteract && create_if_block_2$2(ctx);

    	function switch2_checked_binding(value) {
    		/*switch2_checked_binding*/ ctx[4](value);
    	}

    	let switch2_props = {
    		$$slots: { default: [create_default_slot_5$4] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].interactivity.positionInteract !== void 0) {
    		switch2_props.checked = /*activeItem*/ ctx[0].interactivity.positionInteract;
    	}

    	switch2 = new Switch({ props: switch2_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch2, "checked", switch2_checked_binding));
    	let if_block1 = /*activeItem*/ ctx[0].interactivity.positionInteract && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			create_component(switch0.$$.fragment);
    			t0 = space();
    			create_component(switch1.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			create_component(switch2.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(switch0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(switch1, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(switch2, target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				switch0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked && dirty & /*activeItem*/ 1) {
    				updating_checked = true;
    				switch0_changes.checked = /*activeItem*/ ctx[0].interactivity.onOffInteract;
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch0.$set(switch0_changes);
    			const switch1_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				switch1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked_1 && dirty & /*activeItem*/ 1) {
    				updating_checked_1 = true;
    				switch1_changes.checked = /*activeItem*/ ctx[0].interactivity.gainInteract;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			switch1.$set(switch1_changes);

    			if (/*activeItem*/ ctx[0].interactivity.gainInteract) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const switch2_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				switch2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked_2 && dirty & /*activeItem*/ 1) {
    				updating_checked_2 = true;
    				switch2_changes.checked = /*activeItem*/ ctx[0].interactivity.positionInteract;
    				add_flush_callback(() => updating_checked_2 = false);
    			}

    			switch2.$set(switch2_changes);

    			if (/*activeItem*/ ctx[0].interactivity.positionInteract) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch0.$$.fragment, local);
    			transition_in(switch1.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(switch2.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch0.$$.fragment, local);
    			transition_out(switch1.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(switch2.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(switch0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(switch1, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(switch2, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$7.name,
    		type: "slot",
    		source: "(10:6) <Col cols={12} sm={12} md={12}>",
    		ctx
    	});

    	return block;
    }

    // (9:4) <Row>
    function create_default_slot_1$7(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				cols: 12,
    				sm: 12,
    				md: 12,
    				$$slots: { default: [create_default_slot_2$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 129) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(9:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (8:2) <Container>
    function create_default_slot$7(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 129) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(8:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeItem*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*activeItem*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("Interactivity", slots, []);
    	let { activeItem } = $$props;
    	const writable_props = ["activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Interactivity> was created with unknown prop '${key}'`);
    	});

    	function switch0_checked_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.onOffInteract, value)) {
    			activeItem.interactivity.onOffInteract = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function switch1_checked_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.gainInteract, value)) {
    			activeItem.interactivity.gainInteract = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function slider_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.gainInteractionRange, value)) {
    			activeItem.interactivity.gainInteractionRange = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function switch2_checked_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.positionInteract, value)) {
    			activeItem.interactivity.positionInteract = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function slider0_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.azRange, value)) {
    			activeItem.interactivity.azRange = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function slider1_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.interactivity.elRange, value)) {
    			activeItem.interactivity.elRange = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		Container,
    		Row,
    		Col,
    		Slider,
    		Switch,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activeItem,
    		switch0_checked_binding,
    		switch1_checked_binding,
    		slider_value_binding,
    		switch2_checked_binding,
    		slider0_value_binding,
    		slider1_value_binding
    	];
    }

    class Interactivity extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { activeItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Interactivity",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeItem*/ ctx[0] === undefined && !("activeItem" in props)) {
    			console.warn("<Interactivity> was created without expected prop 'activeItem'");
    		}
    	}

    	get activeItem() {
    		throw new Error("<Interactivity>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Interactivity>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Importance.svelte generated by Svelte v3.34.0 */
    const file$5 = "src/components/Importance.svelte";

    // (9:0) {#if activeItem}
    function create_if_block$4(ctx) {
    	let div;
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(container.$$.fragment);
    			add_location(div, file$5, 9, 2, 145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(container, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 5) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(9:0) {#if activeItem}",
    		ctx
    	});

    	return block;
    }

    // (15:10) <Slider thumb persistentThumb min={0} max={10} step={1} bind:value={activeItem.importance} color="white">
    function create_default_slot_3$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Importance");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(15:10) <Slider thumb persistentThumb min={0} max={10} step={1} bind:value={activeItem.importance} color=\\\"white\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:8) <Col cols={12} sm={12} md={12}>
    function create_default_slot_2$6(ctx) {
    	let h5;
    	let t1;
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[1](value);
    	}

    	let slider_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: 0,
    		max: 10,
    		step: 1,
    		color: "white",
    		$$slots: { default: [create_default_slot_3$5] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].importance !== void 0) {
    		slider_props.value = /*activeItem*/ ctx[0].importance;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, "value", slider_value_binding));

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Importance of item";
    			t1 = space();
    			create_component(slider.$$.fragment);
    			add_location(h5, file$5, 13, 10, 229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				slider_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeItem*/ 1) {
    				updating_value = true;
    				slider_changes.value = /*activeItem*/ ctx[0].importance;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$6.name,
    		type: "slot",
    		source: "(13:8) <Col cols={12} sm={12} md={12}>",
    		ctx
    	});

    	return block;
    }

    // (12:6) <Row>
    function create_default_slot_1$6(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				cols: 12,
    				sm: 12,
    				md: 12,
    				$$slots: { default: [create_default_slot_2$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 5) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(12:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (11:4) <Container>
    function create_default_slot$6(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 5) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(11:4) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeItem*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*activeItem*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("Importance", slots, []);
    	let { activeItem } = $$props;
    	const writable_props = ["activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Importance> was created with unknown prop '${key}'`);
    	});

    	function slider_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.importance, value)) {
    			activeItem.importance = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({ Slider, Container, Row, Col, activeItem });

    	$$self.$inject_state = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, slider_value_binding];
    }

    class Importance extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { activeItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Importance",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeItem*/ ctx[0] === undefined && !("activeItem" in props)) {
    			console.warn("<Importance> was created without expected prop 'activeItem'");
    		}
    	}

    	get activeItem() {
    		throw new Error("<Importance>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Importance>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Alert.svelte generated by Svelte v3.34.0 */

    // (18:4) <CardTitle>
    function create_default_slot_5$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$3.name,
    		type: "slot",
    		source: "(18:4) <CardTitle>",
    		ctx
    	});

    	return block;
    }

    // (19:4) <CardText>
    function create_default_slot_4$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*message*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 4) set_data_dev(t, /*message*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(19:4) <CardText>",
    		ctx
    	});

    	return block;
    }

    // (23:6) <Button on:click={close} class="blue white-text">
    function create_default_slot_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Ok");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(23:6) <Button on:click={close} class=\\\"blue white-text\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:4) <CardActions>
    function create_default_slot_2$5(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				class: "blue white-text",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*close*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(22:4) <CardActions>",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Card>
    function create_default_slot_1$5(ctx) {
    	let cardtitle;
    	let t0;
    	let cardtext;
    	let t1;
    	let cardactions;
    	let current;

    	cardtitle = new CardTitle({
    			props: {
    				$$slots: { default: [create_default_slot_5$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cardtext = new CardText({
    			props: {
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cardactions = new CardActions({
    			props: {
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardtitle.$$.fragment);
    			t0 = space();
    			create_component(cardtext.$$.fragment);
    			t1 = space();
    			create_component(cardactions.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardtitle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(cardtext, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cardactions, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cardtitle_changes = {};

    			if (dirty & /*$$scope, title*/ 66) {
    				cardtitle_changes.$$scope = { dirty, ctx };
    			}

    			cardtitle.$set(cardtitle_changes);
    			const cardtext_changes = {};

    			if (dirty & /*$$scope, message*/ 68) {
    				cardtext_changes.$$scope = { dirty, ctx };
    			}

    			cardtext.$set(cardtext_changes);
    			const cardactions_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				cardactions_changes.$$scope = { dirty, ctx };
    			}

    			cardactions.$set(cardactions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardtitle.$$.fragment, local);
    			transition_in(cardtext.$$.fragment, local);
    			transition_in(cardactions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardtitle.$$.fragment, local);
    			transition_out(cardtext.$$.fragment, local);
    			transition_out(cardactions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardtitle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(cardtext, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(cardactions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(17:2) <Card>",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Dialog persistent bind:active>
    function create_default_slot$5(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
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
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, message, title*/ 70) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(16:0) <Dialog persistent bind:active>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let dialog;
    	let updating_active;
    	let current;

    	function dialog_active_binding(value) {
    		/*dialog_active_binding*/ ctx[4](value);
    	}

    	let dialog_props = {
    		persistent: true,
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[0] !== void 0) {
    		dialog_props.active = /*active*/ ctx[0];
    	}

    	dialog = new Dialog({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, "active", dialog_active_binding));

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dialog_changes = {};

    			if (dirty & /*$$scope, message, title*/ 70) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 1) {
    				updating_active = true;
    				dialog_changes.active = /*active*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
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
    	validate_slots("Alert", slots, []);
    	let { active = false } = $$props;
    	let { title = "Warning" } = $$props;
    	let { message = "" } = $$props;

    	function open() {
    		$$invalidate(0, active = true);
    	}

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	const writable_props = ["active", "title", "message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Alert> was created with unknown prop '${key}'`);
    	});

    	function dialog_active_binding(value) {
    		active = value;
    		$$invalidate(0, active);
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Dialog,
    		Card,
    		CardTitle,
    		CardText,
    		CardActions,
    		active,
    		title,
    		message,
    		open,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, title, message, close, dialog_active_binding];
    }

    class Alert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { active: 0, title: 1, message: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Alert",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get active() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Material Design Icons v5.9.55
    var mdiDeleteForever = "M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8.46,11.88L9.87,10.47L12,12.59L14.12,10.47L15.53,11.88L13.41,14L15.53,16.12L14.12,17.53L12,15.41L9.88,17.53L8.47,16.12L10.59,14L8.46,11.88M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z";
    var mdiInformationOutline = "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z";
    var mdiPlusCircle = "M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";

    /* src/components/ObjectParameter.svelte generated by Svelte v3.34.0 */
    const file$4 = "src/components/ObjectParameter.svelte";

    // (23:0) {#if active}
    function create_if_block$3(ctx) {
    	let alert;
    	let updating_active;
    	let t;
    	let container;
    	let current;

    	function alert_active_binding(value) {
    		/*alert_active_binding*/ ctx[4](value);
    	}

    	let alert_props = {
    		title: "Info",
    		message: "Note that all object parameters here will be valid for the whole duration of the wav file!"
    	};

    	if (/*alertActive*/ ctx[2] !== void 0) {
    		alert_props.active = /*alertActive*/ ctx[2];
    	}

    	alert = new Alert({ props: alert_props, $$inline: true });
    	binding_callbacks.push(() => bind(alert, "active", alert_active_binding));

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};

    			if (!updating_active && dirty & /*alertActive*/ 4) {
    				updating_active = true;
    				alert_changes.active = /*alertActive*/ ctx[2];
    				add_flush_callback(() => updating_active = false);
    			}

    			alert.$set(alert_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 513) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(23:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (27:6) <Button fab size="x-small" on:click={() => showInfo()}>
    function create_default_slot_6$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: mdiInformationOutline },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(27:6) <Button fab size=\\\"x-small\\\" on:click={() => showInfo()}>",
    		ctx
    	});

    	return block;
    }

    // (34:8) <Slider thumb persistentThumb min={-180} max={180} bind:value={activeItem.object_parameter.position.azimuth} color="white">
    function create_default_slot_5$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Azimuth");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(34:8) <Slider thumb persistentThumb min={-180} max={180} bind:value={activeItem.object_parameter.position.azimuth} color=\\\"white\\\">",
    		ctx
    	});

    	return block;
    }

    // (35:8) <Slider thumb persistentThumb min={-90} max={90} bind:value={activeItem.object_parameter.position.elevation} color="white">
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Elevation");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(35:8) <Slider thumb persistentThumb min={-90} max={90} bind:value={activeItem.object_parameter.position.elevation} color=\\\"white\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:8) <Slider thumb persistentThumb min={0} max={1} step={0.01} precision={2} bind:value={activeItem.object_parameter.position.distance} color="white">
    function create_default_slot_3$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Distance");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(36:8) <Slider thumb persistentThumb min={0} max={1} step={0.01} precision={2} bind:value={activeItem.object_parameter.position.distance} color=\\\"white\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:6) <Col cols={12} sm={12} md={12}>
    function create_default_slot_2$4(ctx) {
    	let h5;
    	let t1;
    	let slider0;
    	let updating_value;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let slider2;
    	let updating_value_2;
    	let t4;
    	let span;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[6](value);
    	}

    	let slider0_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: -180,
    		max: 180,
    		color: "white",
    		$$slots: { default: [create_default_slot_5$2] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].object_parameter.position.azimuth !== void 0) {
    		slider0_props.value = /*activeItem*/ ctx[0].object_parameter.position.azimuth;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, "value", slider0_value_binding));

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[7](value);
    	}

    	let slider1_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: -90,
    		max: 90,
    		color: "white",
    		$$slots: { default: [create_default_slot_4$2] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].object_parameter.position.elevation !== void 0) {
    		slider1_props.value = /*activeItem*/ ctx[0].object_parameter.position.elevation;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, "value", slider1_value_binding));

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[8](value);
    	}

    	let slider2_props = {
    		thumb: true,
    		persistentThumb: true,
    		min: 0,
    		max: 1,
    		step: 0.01,
    		precision: 2,
    		color: "white",
    		$$slots: { default: [create_default_slot_3$3] },
    		$$scope: { ctx }
    	};

    	if (/*activeItem*/ ctx[0].object_parameter.position.distance !== void 0) {
    		slider2_props.value = /*activeItem*/ ctx[0].object_parameter.position.distance;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, "value", slider2_value_binding));

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Position";
    			t1 = space();
    			create_component(slider0.$$.fragment);
    			t2 = space();
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			create_component(slider2.$$.fragment);
    			t4 = space();
    			span = element("span");
    			add_location(h5, file$4, 32, 8, 876);
    			add_location(span, file$4, 36, 8, 1371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				slider0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeItem*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*activeItem*/ ctx[0].object_parameter.position.azimuth;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				slider1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty & /*activeItem*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*activeItem*/ ctx[0].object_parameter.position.elevation;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				slider2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_2 && dirty & /*activeItem*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*activeItem*/ ctx[0].object_parameter.position.distance;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(32:6) <Col cols={12} sm={12} md={12}>",
    		ctx
    	});

    	return block;
    }

    // (31:4) <Row>
    function create_default_slot_1$4(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				cols: 12,
    				sm: 12,
    				md: 12,
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 513) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(31:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Container>
    function create_default_slot$4(ctx) {
    	let div;
    	let button;
    	let t;
    	let row;
    	let current;

    	button = new Button({
    			props: {
    				fab: true,
    				size: "x-small",
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[5]);

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			t = space();
    			create_component(row.$$.fragment);
    			attr_dev(div, "class", "float-right");
    			add_location(div, file$4, 25, 4, 659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			insert_dev(target, t, anchor);
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const row_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 513) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (detaching) detach_dev(t);
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(25:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("ObjectParameter", slots, []);
    	let { activeItem } = $$props;
    	let active = false;
    	let alertActive = false;

    	const showInfo = () => {
    		$$invalidate(2, alertActive = true);
    	};

    	const writable_props = ["activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ObjectParameter> was created with unknown prop '${key}'`);
    	});

    	function alert_active_binding(value) {
    		alertActive = value;
    		$$invalidate(2, alertActive);
    	}

    	const click_handler = () => showInfo();

    	function slider0_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.object_parameter.position.azimuth, value)) {
    			activeItem.object_parameter.position.azimuth = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function slider1_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.object_parameter.position.elevation, value)) {
    			activeItem.object_parameter.position.elevation = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	function slider2_value_binding(value) {
    		if ($$self.$$.not_equal(activeItem.object_parameter.position.distance, value)) {
    			activeItem.object_parameter.position.distance = value;
    			$$invalidate(0, activeItem);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		Alert,
    		Container,
    		Row,
    		Col,
    		Slider,
    		Button,
    		Icon,
    		mdiInformationOutline,
    		activeItem,
    		active,
    		alertActive,
    		showInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("alertActive" in $$props) $$invalidate(2, alertActive = $$props.alertActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeItem*/ 1) {
    			if (typeof activeItem !== "undefined" && activeItem.type === "Object") {
    				$$invalidate(1, active = true);
    			} else {
    				$$invalidate(1, active = false);
    			}
    		}
    	};

    	return [
    		activeItem,
    		active,
    		alertActive,
    		showInfo,
    		alert_active_binding,
    		click_handler,
    		slider0_value_binding,
    		slider1_value_binding,
    		slider2_value_binding
    	];
    }

    class ObjectParameter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { activeItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ObjectParameter",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeItem*/ ctx[0] === undefined && !("activeItem" in props)) {
    			console.warn("<ObjectParameter> was created without expected prop 'activeItem'");
    		}
    	}

    	get activeItem() {
    		throw new Error("<ObjectParameter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<ObjectParameter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/AudioObject.svelte generated by Svelte v3.34.0 */
    const file$3 = "src/components/AudioObject.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (34:35) 
    function create_if_block_5(ctx) {
    	let tab;
    	let updating_disabled;
    	let current;

    	function tab_disabled_binding_1(value) {
    		/*tab_disabled_binding_1*/ ctx[6](value);
    	}

    	let tab_props = {
    		$$slots: { default: [create_default_slot_3$2] },
    		$$scope: { ctx }
    	};

    	if (/*hideObjectsTab*/ ctx[2] !== void 0) {
    		tab_props.disabled = /*hideObjectsTab*/ ctx[2];
    	}

    	tab = new Tab({ props: tab_props, $$inline: true });
    	binding_callbacks.push(() => bind(tab, "disabled", tab_disabled_binding_1));

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_disabled && dirty & /*hideObjectsTab*/ 4) {
    				updating_disabled = true;
    				tab_changes.disabled = /*hideObjectsTab*/ ctx[2];
    				add_flush_callback(() => updating_disabled = false);
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(34:35) ",
    		ctx
    	});

    	return block;
    }

    // (32:8) {#if tab !== "Object"}
    function create_if_block_4$1(ctx) {
    	let tab;
    	let updating_disabled;
    	let current;

    	function tab_disabled_binding(value) {
    		/*tab_disabled_binding*/ ctx[5](value);
    	}

    	let tab_props = {
    		$$slots: { default: [create_default_slot_2$3] },
    		$$scope: { ctx }
    	};

    	if (/*hideTab*/ ctx[3] !== void 0) {
    		tab_props.disabled = /*hideTab*/ ctx[3];
    	}

    	tab = new Tab({ props: tab_props, $$inline: true });
    	binding_callbacks.push(() => bind(tab, "disabled", tab_disabled_binding));

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_disabled && dirty & /*hideTab*/ 8) {
    				updating_disabled = true;
    				tab_changes.disabled = /*hideTab*/ ctx[3];
    				add_flush_callback(() => updating_disabled = false);
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(32:8) {#if tab !== \\\"Object\\\"}",
    		ctx
    	});

    	return block;
    }

    // (35:10) <Tab bind:disabled={hideObjectsTab}>
    function create_default_slot_3$2(ctx) {
    	let t_value = /*tab*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(35:10) <Tab bind:disabled={hideObjectsTab}>",
    		ctx
    	});

    	return block;
    }

    // (33:10) <Tab bind:disabled={hideTab}>
    function create_default_slot_2$3(ctx) {
    	let t_value = /*tab*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(33:10) <Tab bind:disabled={hideTab}>",
    		ctx
    	});

    	return block;
    }

    // (31:6) {#each tabs as tab}
    function create_each_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4$1, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[8] !== "Object") return 0;
    		if (/*tab*/ ctx[8] === "Object") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(31:6) {#each tabs as tab}",
    		ctx
    	});

    	return block;
    }

    // (30:4) <div slot="tabs">
    function create_tabs_slot$1(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*tabs*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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

    			attr_dev(div, "slot", "tabs");
    			add_location(div, file$3, 29, 4, 834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hideTab, tabs, hideObjectsTab*/ 28) {
    				each_value_1 = /*tabs*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    		id: create_tabs_slot$1.name,
    		type: "slot",
    		source: "(30:4) <div slot=\\\"tabs\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:37) 
    function create_if_block_3$1(ctx) {
    	let objectparameter;
    	let current;

    	objectparameter = new ObjectParameter({
    			props: { activeItem: /*activeItem*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(objectparameter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(objectparameter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const objectparameter_changes = {};
    			if (dirty & /*activeItem*/ 1) objectparameter_changes.activeItem = /*activeItem*/ ctx[0];
    			objectparameter.$set(objectparameter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(objectparameter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(objectparameter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(objectparameter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(48:37) ",
    		ctx
    	});

    	return block;
    }

    // (46:41) 
    function create_if_block_2$1(ctx) {
    	let importance;
    	let current;

    	importance = new Importance({
    			props: { activeItem: /*activeItem*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(importance.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(importance, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const importance_changes = {};
    			if (dirty & /*activeItem*/ 1) importance_changes.activeItem = /*activeItem*/ ctx[0];
    			importance.$set(importance_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(importance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(importance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(importance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(46:41) ",
    		ctx
    	});

    	return block;
    }

    // (44:44) 
    function create_if_block_1$2(ctx) {
    	let interactivity;
    	let current;

    	interactivity = new Interactivity({
    			props: { activeItem: /*activeItem*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(interactivity.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(interactivity, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const interactivity_changes = {};
    			if (dirty & /*activeItem*/ 1) interactivity_changes.activeItem = /*activeItem*/ ctx[0];
    			interactivity.$set(interactivity_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(interactivity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(interactivity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(interactivity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(44:44) ",
    		ctx
    	});

    	return block;
    }

    // (42:10) {#if tab === "Routing"}
    function create_if_block$2(ctx) {
    	let routing;
    	let current;

    	routing = new Routing({
    			props: { activeItem: /*activeItem*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(routing.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(routing, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const routing_changes = {};
    			if (dirty & /*activeItem*/ 1) routing_changes.activeItem = /*activeItem*/ ctx[0];
    			routing.$set(routing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(routing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(routing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(routing, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(42:10) {#if tab === \\\"Routing\\\"}",
    		ctx
    	});

    	return block;
    }

    // (40:6) <TabContent>
    function create_default_slot_1$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_if_block_2$1, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*tab*/ ctx[8] === "Routing") return 0;
    		if (/*tab*/ ctx[8] === "Interactivity") return 1;
    		if (/*tab*/ ctx[8] === "Importance") return 2;
    		if (/*tab*/ ctx[8] === "Object") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(div, file$3, 40, 8, 1144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(40:6) <TabContent>",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#each tabs as tab}
    function create_each_block$2(ctx) {
    	let tabcontent;
    	let current;

    	tabcontent = new TabContent({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabcontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabcontent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabcontent_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 8193) {
    				tabcontent_changes.$$scope = { dirty, ctx };
    			}

    			tabcontent.$set(tabcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(39:4) {#each tabs as tab}",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Tabs fixedTabs bind:value={activeItemSettings}>
    function create_default_slot$3(ctx) {
    	let t;
    	let each_1_anchor;
    	let current;
    	let each_value = /*tabs*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeItem, tabs*/ 17) {
    				each_value = /*tabs*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(29:2) <Tabs fixedTabs bind:value={activeItemSettings}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let tabs_1;
    	let updating_value;
    	let current;

    	function tabs_1_value_binding(value) {
    		/*tabs_1_value_binding*/ ctx[7](value);
    	}

    	let tabs_1_props = {
    		fixedTabs: true,
    		$$slots: {
    			default: [create_default_slot$3],
    			tabs: [create_tabs_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*activeItemSettings*/ ctx[1] !== void 0) {
    		tabs_1_props.value = /*activeItemSettings*/ ctx[1];
    	}

    	tabs_1 = new Tabs({ props: tabs_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs_1, "value", tabs_1_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabs_1.$$.fragment);
    			attr_dev(div, "class", "eps-area audioObjectArea svelte-1x05jf7");
    			add_location(div, file$3, 26, 0, 739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabs_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_1_changes = {};

    			if (dirty & /*$$scope, activeItem, hideTab, hideObjectsTab*/ 8205) {
    				tabs_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeItemSettings*/ 2) {
    				updating_value = true;
    				tabs_1_changes.value = /*activeItemSettings*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			tabs_1.$set(tabs_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabs_1);
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
    	validate_slots("AudioObject", slots, []);
    	let { activeItem } = $$props;
    	let activeItemSettings = 0;
    	let tabs = ["Routing", "Interactivity", "Importance", "Object"];
    	let hideObjectsTab = true;
    	let hideTab = true;
    	const writable_props = ["activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AudioObject> was created with unknown prop '${key}'`);
    	});

    	function tab_disabled_binding(value) {
    		hideTab = value;
    		($$invalidate(3, hideTab), $$invalidate(0, activeItem));
    	}

    	function tab_disabled_binding_1(value) {
    		hideObjectsTab = value;
    		($$invalidate(2, hideObjectsTab), $$invalidate(0, activeItem));
    	}

    	function tabs_1_value_binding(value) {
    		activeItemSettings = value;
    		$$invalidate(1, activeItemSettings);
    	}

    	$$self.$$set = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		Tabs,
    		Tab,
    		TabContent,
    		ADMStore,
    		Routing,
    		Interactivity,
    		Importance,
    		ObjectParameter,
    		activeItem,
    		activeItemSettings,
    		tabs,
    		hideObjectsTab,
    		hideTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ("activeItemSettings" in $$props) $$invalidate(1, activeItemSettings = $$props.activeItemSettings);
    		if ("tabs" in $$props) $$invalidate(4, tabs = $$props.tabs);
    		if ("hideObjectsTab" in $$props) $$invalidate(2, hideObjectsTab = $$props.hideObjectsTab);
    		if ("hideTab" in $$props) $$invalidate(3, hideTab = $$props.hideTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeItem*/ 1) {
    			if (typeof activeItem !== "undefined") {
    				if (activeItem.type === "Object") {
    					$$invalidate(2, hideObjectsTab = false);
    				} else {
    					$$invalidate(2, hideObjectsTab = true);
    				}

    				$$invalidate(3, hideTab = false);
    			} else {
    				$$invalidate(3, hideTab = true);
    			}
    		}
    	};

    	return [
    		activeItem,
    		activeItemSettings,
    		hideObjectsTab,
    		hideTab,
    		tabs,
    		tab_disabled_binding,
    		tab_disabled_binding_1,
    		tabs_1_value_binding
    	];
    }

    class AudioObject extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { activeItem: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AudioObject",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeItem*/ ctx[0] === undefined && !("activeItem" in props)) {
    			console.warn("<AudioObject> was created without expected prop 'activeItem'");
    		}
    	}

    	get activeItem() {
    		throw new Error("<AudioObject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<AudioObject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var data = [
        {"name":"Abkhaz", "local":"Аҧсуа", "1":"ab", "2":"abk", "2T":"abk", "2B":"abk", "3":"abk"},
        {"name":"Afar", "local":"Afaraf", "1":"aa", "2":"aar", "2T":"aar", "2B":"aar", "3":"aar"},
        {"name":"Afrikaans", "local":"Afrikaans", "1":"af", "2":"afr", "2T":"afr", "2B":"afr", "3":"afr"},
        {"name":"Akan", "local":"Akan", "1":"ak", "2":"aka", "2T":"aka", "2B":"aka", "3":"aka"},
        {"name":"Albanian", "local":"Shqip", "1":"sq", "2":"sqi", "2T":"sqi", "2B":"alb", "3":"sqi"},
        {"name":"Amharic", "local":"አማርኛ", "1":"am", "2":"amh", "2T":"amh", "2B":"amh", "3":"amh"},
        {"name":"Arabic", "local":"العربية", "1":"ar", "2":"ara", "2T":"ara", "2B":"ara", "3":"ara"},
        {"name":"Aragonese", "local":"Aragonés", "1":"an", "2":"arg", "2T":"arg", "2B":"arg", "3":"arg"},
        {"name":"Armenian", "local":"Հայերեն", "1":"hy", "2":"hye", "2T":"hye", "2B":"arm", "3":"hye"},
        {"name":"Assamese", "local":"অসমীয়া", "1":"as", "2":"asm", "2T":"asm", "2B":"asm", "3":"asm"},
        {"name":"Avaric", "local":"Авар", "1":"av", "2":"ava", "2T":"ava", "2B":"ava", "3":"ava"},
        {"name":"Avestan", "local":"avesta", "1":"ae", "2":"ave", "2T":"ave", "2B":"ave", "3":"ave"},
        {"name":"Aymara", "local":"Aymar", "1":"ay", "2":"aym", "2T":"aym", "2B":"aym", "3":"aym"},
        {"name":"Azerbaijani", "local":"Azərbaycanca", "1":"az", "2":"aze", "2T":"aze", "2B":"aze", "3":"aze"},
        {"name":"Bambara", "local":"Bamanankan", "1":"bm", "2":"bam", "2T":"bam", "2B":"bam", "3":"bam"},
        {"name":"Bashkir", "local":"Башҡортса", "1":"ba", "2":"bak", "2T":"bak", "2B":"bak", "3":"bak"},
        {"name":"Basque", "local":"Euskara", "1":"eu", "2":"eus", "2T":"eus", "2B":"baq", "3":"eus"},
        {"name":"Belarusian", "local":"Беларуская", "1":"be", "2":"bel", "2T":"bel", "2B":"bel", "3":"bel"},
        {"name":"Bengali", "local":"বাংলা", "1":"bn", "2":"ben", "2T":"ben", "2B":"ben", "3":"ben"},
        {"name":"Bihari", "local":"भोजपुरी", "1":"bh", "2":"bih", "2T":"bih", "2B":"bih", "3":"bih"},
        {"name":"Bislama", "local":"Bislama", "1":"bi", "2":"bis", "2T":"bis", "2B":"bis", "3":"bis"},
        {"name":"Bosnian", "local":"Bosanski", "1":"bs", "2":"bos", "2T":"bos", "2B":"bos", "3":"bos"},
        {"name":"Breton", "local":"Brezhoneg", "1":"br", "2":"bre", "2T":"bre", "2B":"bre", "3":"bre"},
        {"name":"Bulgarian", "local":"Български", "1":"bg", "2":"bul", "2T":"bul", "2B":"bul", "3":"bul"},
        {"name":"Burmese", "local":"မြန်မာဘာသာ", "1":"my", "2":"mya", "2T":"mya", "2B":"bur", "3":"mya"},
        {"name":"Catalan", "local":"Català", "1":"ca", "2":"cat", "2T":"cat", "2B":"cat", "3":"cat"},
        {"name":"Chamorro", "local":"Chamoru", "1":"ch", "2":"cha", "2T":"cha", "2B":"cha", "3":"cha"},
        {"name":"Chechen", "local":"Нохчийн", "1":"ce", "2":"che", "2T":"che", "2B":"che", "3":"che"},
        {"name":"Chichewa", "local":"Chichewa", "1":"ny", "2":"nya", "2T":"nya", "2B":"nya", "3":"nya"},
        {"name":"Chinese", "local":"中文", "1":"zh", "2":"zho", "2T":"zho", "2B":"chi", "3":"zho"},
        {"name":"Chuvash", "local":"Чӑвашла", "1":"cv", "2":"chv", "2T":"chv", "2B":"chv", "3":"chv"},
        {"name":"Cornish", "local":"Kernewek", "1":"kw", "2":"cor", "2T":"cor", "2B":"cor", "3":"cor"},
        {"name":"Corsican", "local":"Corsu", "1":"co", "2":"cos", "2T":"cos", "2B":"cos", "3":"cos"},
        {"name":"Cree", "local":"ᓀᐦᐃᔭᐍᐏᐣ", "1":"cr", "2":"cre", "2T":"cre", "2B":"cre", "3":"cre"},
        {"name":"Croatian", "local":"Hrvatski", "1":"hr", "2":"hrv", "2T":"hrv", "2B":"hrv", "3":"hrv"},
        {"name":"Czech", "local":"Čeština", "1":"cs", "2":"ces", "2T":"ces", "2B":"cze", "3":"ces"},
        {"name":"Danish", "local":"Dansk", "1":"da", "2":"dan", "2T":"dan", "2B":"dan", "3":"dan"},
        {"name":"Divehi", "local":"Divehi", "1":"dv", "2":"div", "2T":"div", "2B":"div", "3":"div"},
        {"name":"Dutch", "local":"Nederlands", "1":"nl", "2":"nld", "2T":"nld", "2B":"dut", "3":"nld"},
        {"name":"Dzongkha", "local":"རྫོང་ཁ", "1":"dz", "2":"dzo", "2T":"dzo", "2B":"dzo", "3":"dzo"},
        {"name":"English", "local":"English", "1":"en", "2":"eng", "2T":"eng", "2B":"eng", "3":"eng"},
        {"name":"Esperanto", "local":"Esperanto", "1":"eo", "2":"epo", "2T":"epo", "2B":"epo", "3":"epo"},
        {"name":"Estonian", "local":"Eesti", "1":"et", "2":"est", "2T":"est", "2B":"est", "3":"est"},
        {"name":"Ewe", "local":"Eʋegbe", "1":"ee", "2":"ewe", "2T":"ewe", "2B":"ewe", "3":"ewe"},
        {"name":"Faroese", "local":"Føroyskt", "1":"fo", "2":"fao", "2T":"fao", "2B":"fao", "3":"fao"},
        {"name":"Fijian", "local":"Na Vosa Vaka-Viti", "1":"fj", "2":"fij", "2T":"fij", "2B":"fij", "3":"fij"},
        {"name":"Finnish", "local":"Suomi", "1":"fi", "2":"fin", "2T":"fin", "2B":"fin", "3":"fin"},
        {"name":"French", "local":"Français", "1":"fr", "2":"fra", "2T":"fra", "2B":"fre", "3":"fra"},
        {"name":"Fula", "local":"Fulfulde", "1":"ff", "2":"ful", "2T":"ful", "2B":"ful", "3":"ful"},
        {"name":"Galician", "local":"Galego", "1":"gl", "2":"glg", "2T":"glg", "2B":"glg", "3":"glg"},
        {"name":"Georgian", "local":"ქართული", "1":"ka", "2":"kat", "2T":"kat", "2B":"geo", "3":"kat"},
        {"name":"German", "local":"Deutsch", "1":"de", "2":"deu", "2T":"deu", "2B":"ger", "3":"deu"},
        {"name":"Greek", "local":"Ελληνικά", "1":"el", "2":"ell", "2T":"ell", "2B":"gre", "3":"ell"},
        {"name":"Guaraní", "local":"Avañe'ẽ", "1":"gn", "2":"grn", "2T":"grn", "2B":"grn", "3":"grn"},
        {"name":"Gujarati", "local":"ગુજરાતી", "1":"gu", "2":"guj", "2T":"guj", "2B":"guj", "3":"guj"},
        {"name":"Haitian", "local":"Kreyòl Ayisyen", "1":"ht", "2":"hat", "2T":"hat", "2B":"hat", "3":"hat"},
        {"name":"Hausa", "local":"هَوُسَ", "1":"ha", "2":"hau", "2T":"hau", "2B":"hau", "3":"hau"},
        {"name":"Hebrew", "local":"עברית", "1":"he", "2":"heb", "2T":"heb", "2B":"heb", "3":"heb"},
        {"name":"Herero", "local":"Otjiherero", "1":"hz", "2":"her", "2T":"her", "2B":"her", "3":"her"},
        {"name":"Hindi", "local":"हिन्दी", "1":"hi", "2":"hin", "2T":"hin", "2B":"hin", "3":"hin"},
        {"name":"Hiri Motu", "local":"Hiri Motu", "1":"ho", "2":"hmo", "2T":"hmo", "2B":"hmo", "3":"hmo"},
        {"name":"Hungarian", "local":"Magyar", "1":"hu", "2":"hun", "2T":"hun", "2B":"hun", "3":"hun"},
        {"name":"Interlingua", "local":"Interlingua", "1":"ia", "2":"ina", "2T":"ina", "2B":"ina", "3":"ina"},
        {"name":"Indonesian", "local":"Bahasa Indonesia", "1":"id", "2":"ind", "2T":"ind", "2B":"ind", "3":"ind"},
        {"name":"Interlingue", "local":"Interlingue", "1":"ie", "2":"ile", "2T":"ile", "2B":"ile", "3":"ile"},
        {"name":"Irish", "local":"Gaeilge", "1":"ga", "2":"gle", "2T":"gle", "2B":"gle", "3":"gle"},
        {"name":"Igbo", "local":"Igbo", "1":"ig", "2":"ibo", "2T":"ibo", "2B":"ibo", "3":"ibo"},
        {"name":"Inupiaq", "local":"Iñupiak", "1":"ik", "2":"ipk", "2T":"ipk", "2B":"ipk", "3":"ipk"},
        {"name":"Ido", "local":"Ido", "1":"io", "2":"ido", "2T":"ido", "2B":"ido", "3":"ido"},
        {"name":"Icelandic", "local":"Íslenska", "1":"is", "2":"isl", "2T":"isl", "2B":"ice", "3":"isl"},
        {"name":"Italian", "local":"Italiano", "1":"it", "2":"ita", "2T":"ita", "2B":"ita", "3":"ita"},
        {"name":"Inuktitut", "local":"ᐃᓄᒃᑎᑐᑦ", "1":"iu", "2":"iku", "2T":"iku", "2B":"iku", "3":"iku"},
        {"name":"Japanese", "local":"日本語", "1":"ja", "2":"jpn", "2T":"jpn", "2B":"jpn", "3":"jpn"},
        {"name":"Javanese", "local":"Basa Jawa", "1":"jv", "2":"jav", "2T":"jav", "2B":"jav", "3":"jav"},
        {"name":"Kalaallisut", "local":"Kalaallisut", "1":"kl", "2":"kal", "2T":"kal", "2B":"kal", "3":"kal"},
        {"name":"Kannada", "local":"ಕನ್ನಡ", "1":"kn", "2":"kan", "2T":"kan", "2B":"kan", "3":"kan"},
        {"name":"Kanuri", "local":"Kanuri", "1":"kr", "2":"kau", "2T":"kau", "2B":"kau", "3":"kau"},
        {"name":"Kashmiri", "local":"كشميري", "1":"ks", "2":"kas", "2T":"kas", "2B":"kas", "3":"kas"},
        {"name":"Kazakh", "local":"Қазақша", "1":"kk", "2":"kaz", "2T":"kaz", "2B":"kaz", "3":"kaz"},
        {"name":"Khmer", "local":"ភាសាខ្មែរ", "1":"km", "2":"khm", "2T":"khm", "2B":"khm", "3":"khm"},
        {"name":"Kikuyu", "local":"Gĩkũyũ", "1":"ki", "2":"kik", "2T":"kik", "2B":"kik", "3":"kik"},
        {"name":"Kinyarwanda", "local":"Kinyarwanda", "1":"rw", "2":"kin", "2T":"kin", "2B":"kin", "3":"kin"},
        {"name":"Kyrgyz", "local":"Кыргызча", "1":"ky", "2":"kir", "2T":"kir", "2B":"kir", "3":"kir"},
        {"name":"Komi", "local":"Коми", "1":"kv", "2":"kom", "2T":"kom", "2B":"kom", "3":"kom"},
        {"name":"Kongo", "local":"Kongo", "1":"kg", "2":"kon", "2T":"kon", "2B":"kon", "3":"kon"},
        {"name":"Korean", "local":"한국어", "1":"ko", "2":"kor", "2T":"kor", "2B":"kor", "3":"kor"},
        {"name":"Kurdish", "local":"Kurdî", "1":"ku", "2":"kur", "2T":"kur", "2B":"kur", "3":"kur"},
        {"name":"Kwanyama", "local":"Kuanyama", "1":"kj", "2":"kua", "2T":"kua", "2B":"kua", "3":"kua"},
        {"name":"Latin", "local":"Latina", "1":"la", "2":"lat", "2T":"lat", "2B":"lat", "3":"lat"},
        {"name":"Luxembourgish", "local":"Lëtzebuergesch", "1":"lb", "2":"ltz", "2T":"ltz", "2B":"ltz", "3":"ltz"},
        {"name":"Ganda", "local":"Luganda", "1":"lg", "2":"lug", "2T":"lug", "2B":"lug", "3":"lug"},
        {"name":"Limburgish", "local":"Limburgs", "1":"li", "2":"lim", "2T":"lim", "2B":"lim", "3":"lim"},
        {"name":"Lingala", "local":"Lingála", "1":"ln", "2":"lin", "2T":"lin", "2B":"lin", "3":"lin"},
        {"name":"Lao", "local":"ພາສາລາວ", "1":"lo", "2":"lao", "2T":"lao", "2B":"lao", "3":"lao"},
        {"name":"Lithuanian", "local":"Lietuvių", "1":"lt", "2":"lit", "2T":"lit", "2B":"lit", "3":"lit"},
        {"name":"Luba-Katanga", "local":"Tshiluba", "1":"lu", "2":"lub", "2T":"lub", "2B":"lub", "3":"lub"},
        {"name":"Latvian", "local":"Latviešu", "1":"lv", "2":"lav", "2T":"lav", "2B":"lav", "3":"lav"},
        {"name":"Manx", "local":"Gaelg", "1":"gv", "2":"glv", "2T":"glv", "2B":"glv", "3":"glv"},
        {"name":"Macedonian", "local":"Македонски", "1":"mk", "2":"mkd", "2T":"mkd", "2B":"mac", "3":"mkd"},
        {"name":"Malagasy", "local":"Malagasy", "1":"mg", "2":"mlg", "2T":"mlg", "2B":"mlg", "3":"mlg"},
        {"name":"Malay", "local":"Bahasa Melayu", "1":"ms", "2":"msa", "2T":"msa", "2B":"may", "3":"msa"},
        {"name":"Malayalam", "local":"മലയാളം", "1":"ml", "2":"mal", "2T":"mal", "2B":"mal", "3":"mal"},
        {"name":"Maltese", "local":"Malti", "1":"mt", "2":"mlt", "2T":"mlt", "2B":"mlt", "3":"mlt"},
        {"name":"Māori", "local":"Māori", "1":"mi", "2":"mri", "2T":"mri", "2B":"mao", "3":"mri"},
        {"name":"Marathi", "local":"मराठी", "1":"mr", "2":"mar", "2T":"mar", "2B":"mar", "3":"mar"},
        {"name":"Marshallese", "local":"Kajin M̧ajeļ", "1":"mh", "2":"mah", "2T":"mah", "2B":"mah", "3":"mah"},
        {"name":"Mongolian", "local":"Монгол", "1":"mn", "2":"mon", "2T":"mon", "2B":"mon", "3":"mon"},
        {"name":"Nauru", "local":"Dorerin Naoero", "1":"na", "2":"nau", "2T":"nau", "2B":"nau", "3":"nau"},
        {"name":"Navajo", "local":"Diné Bizaad", "1":"nv", "2":"nav", "2T":"nav", "2B":"nav", "3":"nav"},
        {"name":"Northern Ndebele", "local":"isiNdebele", "1":"nd", "2":"nde", "2T":"nde", "2B":"nde", "3":"nde"},
        {"name":"Nepali", "local":"नेपाली", "1":"ne", "2":"nep", "2T":"nep", "2B":"nep", "3":"nep"},
        {"name":"Ndonga", "local":"Owambo", "1":"ng", "2":"ndo", "2T":"ndo", "2B":"ndo", "3":"ndo"},
        {"name":"Norwegian Bokmål", "local":"Norsk (Bokmål)", "1":"nb", "2":"nob", "2T":"nob", "2B":"nob", "3":"nob"},
        {"name":"Norwegian Nynorsk", "local":"Norsk (Nynorsk)", "1":"nn", "2":"nno", "2T":"nno", "2B":"nno", "3":"nno"},
        {"name":"Norwegian", "local":"Norsk", "1":"no", "2":"nor", "2T":"nor", "2B":"nor", "3":"nor"},
        {"name":"Nuosu", "local":"ꆈꌠ꒿ Nuosuhxop", "1":"ii", "2":"iii", "2T":"iii", "2B":"iii", "3":"iii"},
        {"name":"Southern Ndebele", "local":"isiNdebele", "1":"nr", "2":"nbl", "2T":"nbl", "2B":"nbl", "3":"nbl"},
        {"name":"Occitan", "local":"Occitan", "1":"oc", "2":"oci", "2T":"oci", "2B":"oci", "3":"oci"},
        {"name":"Ojibwe", "local":"ᐊᓂᔑᓈᐯᒧᐎᓐ", "1":"oj", "2":"oji", "2T":"oji", "2B":"oji", "3":"oji"},
        {"name":"Old Church Slavonic", "local":"Словѣ́ньскъ", "1":"cu", "2":"chu", "2T":"chu", "2B":"chu", "3":"chu"},
        {"name":"Oromo", "local":"Afaan Oromoo", "1":"om", "2":"orm", "2T":"orm", "2B":"orm", "3":"orm"},
        {"name":"Oriya", "local":"ଓଡି଼ଆ", "1":"or", "2":"ori", "2T":"ori", "2B":"ori", "3":"ori"},
        {"name":"Ossetian", "local":"Ирон æвзаг", "1":"os", "2":"oss", "2T":"oss", "2B":"oss", "3":"oss"},
        {"name":"Panjabi", "local":"ਪੰਜਾਬੀ", "1":"pa", "2":"pan", "2T":"pan", "2B":"pan", "3":"pan"},
        {"name":"Pāli", "local":"पाऴि", "1":"pi", "2":"pli", "2T":"pli", "2B":"pli", "3":"pli"},
        {"name":"Persian", "local":"فارسی", "1":"fa", "2":"fas", "2T":"fas", "2B":"per", "3":"fas"},
        {"name":"Polish", "local":"Polski", "1":"pl", "2":"pol", "2T":"pol", "2B":"pol", "3":"pol"},
        {"name":"Pashto", "local":"پښتو", "1":"ps", "2":"pus", "2T":"pus", "2B":"pus", "3":"pus"},
        {"name":"Portuguese", "local":"Português", "1":"pt", "2":"por", "2T":"por", "2B":"por", "3":"por"},
        {"name":"Quechua", "local":"Runa Simi", "1":"qu", "2":"que", "2T":"que", "2B":"que", "3":"que"},
        {"name":"Romansh", "local":"Rumantsch", "1":"rm", "2":"roh", "2T":"roh", "2B":"roh", "3":"roh"},
        {"name":"Kirundi", "local":"Kirundi", "1":"rn", "2":"run", "2T":"run", "2B":"run", "3":"run"},
        {"name":"Romanian", "local":"Română", "1":"ro", "2":"ron", "2T":"ron", "2B":"rum", "3":"ron"},
        {"name":"Russian", "local":"Русский", "1":"ru", "2":"rus", "2T":"rus", "2B":"rus", "3":"rus"},
        {"name":"Sanskrit", "local":"संस्कृतम्", "1":"sa", "2":"san", "2T":"san", "2B":"san", "3":"san"},
        {"name":"Sardinian", "local":"Sardu", "1":"sc", "2":"srd", "2T":"srd", "2B":"srd", "3":"srd"},
        {"name":"Sindhi", "local":"سنڌي‎", "1":"sd", "2":"snd", "2T":"snd", "2B":"snd", "3":"snd"},
        {"name":"Northern Sami", "local":"Sámegiella", "1":"se", "2":"sme", "2T":"sme", "2B":"sme", "3":"sme"},
        {"name":"Samoan", "local":"Gagana Sāmoa", "1":"sm", "2":"smo", "2T":"smo", "2B":"smo", "3":"smo"},
        {"name":"Sango", "local":"Sängö", "1":"sg", "2":"sag", "2T":"sag", "2B":"sag", "3":"sag"},
        {"name":"Serbian", "local":"Српски", "1":"sr", "2":"srp", "2T":"srp", "2B":"srp", "3":"srp"},
        {"name":"Gaelic", "local":"Gàidhlig", "1":"gd", "2":"gla", "2T":"gla", "2B":"gla", "3":"gla"},
        {"name":"Shona", "local":"ChiShona", "1":"sn", "2":"sna", "2T":"sna", "2B":"sna", "3":"sna"},
        {"name":"Sinhala", "local":"සිංහල", "1":"si", "2":"sin", "2T":"sin", "2B":"sin", "3":"sin"},
        {"name":"Slovak", "local":"Slovenčina", "1":"sk", "2":"slk", "2T":"slk", "2B":"slo", "3":"slk"},
        {"name":"Slovene", "local":"Slovenščina", "1":"sl", "2":"slv", "2T":"slv", "2B":"slv", "3":"slv"},
        {"name":"Somali", "local":"Soomaaliga", "1":"so", "2":"som", "2T":"som", "2B":"som", "3":"som"},
        {"name":"Southern Sotho", "local":"Sesotho", "1":"st", "2":"sot", "2T":"sot", "2B":"sot", "3":"sot"},
        {"name":"Spanish", "local":"Español", "1":"es", "2":"spa", "2T":"spa", "2B":"spa", "3":"spa"},
        {"name":"Sundanese", "local":"Basa Sunda", "1":"su", "2":"sun", "2T":"sun", "2B":"sun", "3":"sun"},
        {"name":"Swahili", "local":"Kiswahili", "1":"sw", "2":"swa", "2T":"swa", "2B":"swa", "3":"swa"},
        {"name":"Swati", "local":"SiSwati", "1":"ss", "2":"ssw", "2T":"ssw", "2B":"ssw", "3":"ssw"},
        {"name":"Swedish", "local":"Svenska", "1":"sv", "2":"swe", "2T":"swe", "2B":"swe", "3":"swe"},
        {"name":"Tamil", "local":"தமிழ்", "1":"ta", "2":"tam", "2T":"tam", "2B":"tam", "3":"tam"},
        {"name":"Telugu", "local":"తెలుగు", "1":"te", "2":"tel", "2T":"tel", "2B":"tel", "3":"tel"},
        {"name":"Tajik", "local":"Тоҷикӣ", "1":"tg", "2":"tgk", "2T":"tgk", "2B":"tgk", "3":"tgk"},
        {"name":"Thai", "local":"ภาษาไทย", "1":"th", "2":"tha", "2T":"tha", "2B":"tha", "3":"tha"},
        {"name":"Tigrinya", "local":"ትግርኛ", "1":"ti", "2":"tir", "2T":"tir", "2B":"tir", "3":"tir"},
        {"name":"Tibetan Standard", "local":"བོད་ཡིག", "1":"bo", "2":"bod", "2T":"bod", "2B":"tib", "3":"bod"},
        {"name":"Turkmen", "local":"Türkmençe", "1":"tk", "2":"tuk", "2T":"tuk", "2B":"tuk", "3":"tuk"},
        {"name":"Tagalog", "local":"Tagalog", "1":"tl", "2":"tgl", "2T":"tgl", "2B":"tgl", "3":"tgl"},
        {"name":"Tswana", "local":"Setswana", "1":"tn", "2":"tsn", "2T":"tsn", "2B":"tsn", "3":"tsn"},
        {"name":"Tonga", "local":"faka Tonga", "1":"to", "2":"ton", "2T":"ton", "2B":"ton", "3":"ton"},
        {"name":"Turkish", "local":"Türkçe", "1":"tr", "2":"tur", "2T":"tur", "2B":"tur", "3":"tur"},
        {"name":"Tsonga", "local":"Xitsonga", "1":"ts", "2":"tso", "2T":"tso", "2B":"tso", "3":"tso"},
        {"name":"Tatar", "local":"Татарча", "1":"tt", "2":"tat", "2T":"tat", "2B":"tat", "3":"tat"},
        {"name":"Twi", "local":"Twi", "1":"tw", "2":"twi", "2T":"twi", "2B":"twi", "3":"twi"},
        {"name":"Tahitian", "local":"Reo Mā’ohi", "1":"ty", "2":"tah", "2T":"tah", "2B":"tah", "3":"tah"},
        {"name":"Uyghur", "local":"ئۇيغۇرچه", "1":"ug", "2":"uig", "2T":"uig", "2B":"uig", "3":"uig"},
        {"name":"Ukrainian", "local":"Українська", "1":"uk", "2":"ukr", "2T":"ukr", "2B":"ukr", "3":"ukr"},
        {"name":"Urdu", "local":"اردو", "1":"ur", "2":"urd", "2T":"urd", "2B":"urd", "3":"urd"},
        {"name":"Uzbek", "local":"O‘zbek", "1":"uz", "2":"uzb", "2T":"uzb", "2B":"uzb", "3":"uzb"},
        {"name":"Venda", "local":"Tshivenḓa", "1":"ve", "2":"ven", "2T":"ven", "2B":"ven", "3":"ven"},
        {"name":"Vietnamese", "local":"Tiếng Việt", "1":"vi", "2":"vie", "2T":"vie", "2B":"vie", "3":"vie"},
        {"name":"Volapük", "local":"Volapük", "1":"vo", "2":"vol", "2T":"vol", "2B":"vol", "3":"vol"},
        {"name":"Walloon", "local":"Walon", "1":"wa", "2":"wln", "2T":"wln", "2B":"wln", "3":"wln"},
        {"name":"Welsh", "local":"Cymraeg", "1":"cy", "2":"cym", "2T":"cym", "2B":"wel", "3":"cym"},
        {"name":"Wolof", "local":"Wolof", "1":"wo", "2":"wol", "2T":"wol", "2B":"wol", "3":"wol"},
        {"name":"Western Frisian", "local":"Frysk", "1":"fy", "2":"fry", "2T":"fry", "2B":"fry", "3":"fry"},
        {"name":"Xhosa", "local":"isiXhosa", "1":"xh", "2":"xho", "2T":"xho", "2B":"xho", "3":"xho"},
        {"name":"Yiddish", "local":"ייִדיש", "1":"yi", "2":"yid", "2T":"yid", "2B":"yid", "3":"yid"},
        {"name":"Yoruba", "local":"Yorùbá", "1":"yo", "2":"yor", "2T":"yor", "2B":"yor", "3":"yor"},
        {"name":"Zhuang", "local":"Cuengh", "1":"za", "2":"zha", "2T":"zha", "2B":"zha", "3":"zha"},
        {"name":"Zulu", "local":"isiZulu", "1":"zu", "2":"zul", "2T":"zul", "2B":"zul", "3":"zul"}
    ];

    var langs = {
        all:   allLanguages,
        has:   hasLanguage,
        codes: getCodes,
        names: getNames,
        where: findBy
    };

    var langs_1 = langs;

    // allLanguages :: -> Language[]
    function allLanguages() {
        return data;
    }

    // hasLanguage :: String, String -> Boolean
    function hasLanguage(crit, val) {
        return void(0) !== findBy(crit, val);
    }

    // getCodes :: String -> String[]
    function getCodes(type) {
        if (isValidType(type)) {
            return forAll(data, function getCodesIterator(row) {
                return row[type];
            });
        }
    }

    // getNames :: Boolean -> String[]
    function getNames(local) {
        return forAll(data, function getNamesIterator(row) {
            return local ? row.local : row.name;
        });
    }

    // findBy :: String, String -> Language
    function findBy(crit, val) {
        for (var i = 0; i < data.length; i++) {
            if (val === data[i][crit]) {
                return data[i];
            }
        }
    }

    // forAll :: Array, Function -> Array
    function forAll(arr, fn) {
        var out = [], i;
        for (i = 0; i < arr.length; i++) {
            out.push(fn(arr[i], i));
        }

        return out;
    }

    // isValidType :: String -> Boolean
    function isValidType(type) {
        var types = [1, 2, 3, '1', '2', '2B', '2T', '3'];
        return -1 !== types.indexOf(type);
    }

    function mapISO6391(){
      let languages = [];
      for (const lang of langs_1.all()){
        languages.push({value: lang["2B"], name: lang["name"]});
      }
      languages.sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });
      return languages;
    }

    /* src/components/AudioProgramme.svelte generated by Svelte v3.34.0 */
    const file$2 = "src/components/AudioProgramme.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[16] = list;
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (51:6) <TextField dense outlined bind:value={activeAP.name}>
    function create_default_slot_18(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Name");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(51:6) <TextField dense outlined bind:value={activeAP.name}>",
    		ctx
    	});

    	return block;
    }

    // (50:4) <Col cols={4}>
    function create_default_slot_17(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[8](value);
    	}

    	let textfield_props = {
    		dense: true,
    		outlined: true,
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	};

    	if (/*activeAP*/ ctx[0].name !== void 0) {
    		textfield_props.value = /*activeAP*/ ctx[0].name;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				textfield_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeAP*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*activeAP*/ ctx[0].name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(50:4) <Col cols={4}>",
    		ctx
    	});

    	return block;
    }

    // (54:6) <Select solo items={languages} bind:value={activeAP.language} class="darken-1">
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Language");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(54:6) <Select solo items={languages} bind:value={activeAP.language} class=\\\"darken-1\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:4) <Col cols={4} offset={4}>
    function create_default_slot_15(ctx) {
    	let select;
    	let updating_value;
    	let current;

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[9](value);
    	}

    	let select_props = {
    		solo: true,
    		items: /*languages*/ ctx[3],
    		class: "darken-1",
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	};

    	if (/*activeAP*/ ctx[0].language !== void 0) {
    		select_props.value = /*activeAP*/ ctx[0].language;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeAP*/ 1) {
    				updating_value = true;
    				select_changes.value = /*activeAP*/ ctx[0].language;
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(53:4) <Col cols={4} offset={4}>",
    		ctx
    	});

    	return block;
    }

    // (49:2) <Row>
    function create_default_slot_14(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				cols: 4,
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				cols: 4,
    				offset: 4,
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope, activeAP*/ 262145) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope, activeAP*/ 262145) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(49:2) <Row>",
    		ctx
    	});

    	return block;
    }

    // (62:10) <span slot="header">
    function create_header_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Loudness";
    			attr_dev(span, "slot", "header");
    			add_location(span, file$2, 61, 10, 2066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(62:10) <span slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (61:8) <ExpansionPanel>
    function create_default_slot_13(ctx) {
    	let t0;
    	let h4;

    	const block = {
    		c: function create() {
    			t0 = space();
    			h4 = element("h4");
    			h4.textContent = "Loudness Settings";
    			add_location(h4, file$2, 62, 10, 2114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h4, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(61:8) <ExpansionPanel>",
    		ctx
    	});

    	return block;
    }

    // (60:6) <ExpansionPanels class="eps-area">
    function create_default_slot_12(ctx) {
    	let expansionpanel;
    	let current;

    	expansionpanel = new ExpansionPanel({
    			props: {
    				$$slots: {
    					default: [create_default_slot_13],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expansionpanel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanel_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				expansionpanel_changes.$$scope = { dirty, ctx };
    			}

    			expansionpanel.$set(expansionpanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(60:6) <ExpansionPanels class=\\\"eps-area\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Col cols={12} sm={12} md={12}>
    function create_default_slot_11(ctx) {
    	let expansionpanels;
    	let current;

    	expansionpanels = new ExpansionPanels({
    			props: {
    				class: "eps-area",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expansionpanels.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanels_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				expansionpanels_changes.$$scope = { dirty, ctx };
    			}

    			expansionpanels.$set(expansionpanels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanels, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(59:4) <Col cols={12} sm={12} md={12}>",
    		ctx
    	});

    	return block;
    }

    // (58:2) <Row class="mb-6">
    function create_default_slot_10(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				cols: 12,
    				sm: 12,
    				md: 12,
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(58:2) <Row class=\\\"mb-6\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:10) {:else}
    function create_else_block(ctx) {
    	let listitem;
    	let current;

    	listitem = new ListItem({
    			props: {
    				disabled: true,
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(82:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:12) <ListItem disabled>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No Item in Audioprogramme\n            ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(83:12) <ListItem disabled>",
    		ctx
    	});

    	return block;
    }

    // (76:14) <TextField dense outlined class="mt-2 mr-10" bind:value={item.name}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Name");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(76:14) <TextField dense outlined class=\\\"mt-2 mr-10\\\" bind:value={item.name}>",
    		ctx
    	});

    	return block;
    }

    // (78:16) <Chip class={/^\d/.test(item.type) ? "DirectSpeaker" : item.type}>
    function create_default_slot_6$1(ctx) {
    	let t_value = /*item*/ ctx[15].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeAP*/ 1 && t_value !== (t_value = /*item*/ ctx[15].type + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(78:16) <Chip class={/^\\d/.test(item.type) ? \\\"DirectSpeaker\\\" : item.type}>",
    		ctx
    	});

    	return block;
    }

    // (77:14) <span slot="append">
    function create_append_slot(ctx) {
    	let span;
    	let chip;
    	let t;
    	let a;
    	let icon;
    	let current;
    	let mounted;
    	let dispose;

    	chip = new Chip({
    			props: {
    				class: (/^\d/).test(/*item*/ ctx[15].type)
    				? "DirectSpeaker"
    				: /*item*/ ctx[15].type,
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	icon = new Icon({
    			props: { path: mdiDeleteForever },
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[12](/*item*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(chip.$$.fragment);
    			t = space();
    			a = element("a");
    			create_component(icon.$$.fragment);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "hover_delete");
    			add_location(a, file$2, 78, 16, 2954);
    			attr_dev(span, "slot", "append");
    			add_location(span, file$2, 76, 14, 2816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(chip, span, null);
    			append_dev(span, t);
    			append_dev(span, a);
    			mount_component(icon, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const chip_changes = {};

    			if (dirty & /*activeAP*/ 1) chip_changes.class = (/^\d/).test(/*item*/ ctx[15].type)
    			? "DirectSpeaker"
    			: /*item*/ ctx[15].type;

    			if (dirty & /*$$scope, activeAP*/ 262145) {
    				chip_changes.$$scope = { dirty, ctx };
    			}

    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(chip);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_slot.name,
    		type: "slot",
    		source: "(77:14) <span slot=\\\"append\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:12) <ListItem dense on:click={() => handleItemActive(item)}>
    function create_default_slot_5$1(ctx) {
    	let textfield;
    	let updating_value;
    	let t0;
    	let t1;
    	let current;

    	function textfield_value_binding_1(value) {
    		/*textfield_value_binding_1*/ ctx[11](value, /*item*/ ctx[15]);
    	}

    	let textfield_props = {
    		dense: true,
    		outlined: true,
    		class: "mt-2 mr-10",
    		$$slots: { default: [create_default_slot_7$1] },
    		$$scope: { ctx }
    	};

    	if (/*item*/ ctx[15].name !== void 0) {
    		textfield_props.value = /*item*/ ctx[15].name;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const textfield_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				textfield_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*activeAP*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*item*/ ctx[15].name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(75:12) <ListItem dense on:click={() => handleItemActive(item)}>",
    		ctx
    	});

    	return block;
    }

    // (74:10) {#each activeAP.apItems as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let listitem;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[13](/*item*/ ctx[15]);
    	}

    	listitem = new ListItem({
    			props: {
    				dense: true,
    				$$slots: {
    					default: [create_default_slot_5$1],
    					append: [create_append_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem.$on("click", click_handler_1);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(listitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(listitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const listitem_changes = {};

    			if (dirty & /*$$scope, activeAP*/ 262145) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(listitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(74:10) {#each activeAP.apItems as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (71:8) <ListItemGroup mandatory class="font-weight-bold" activeClass="selectedItem">
    function create_default_slot_4$1(ctx) {
    	let select;
    	let updating_value;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;

    	function select_value_binding_1(value) {
    		/*select_value_binding_1*/ ctx[10](value);
    	}

    	let select_props = {
    		solo: true,
    		items: /*audioBlockItems*/ ctx[4],
    		class: "audioProgrammeItemsSelect default-color"
    	};

    	if (/*selectedAudioBlockItem*/ ctx[2] !== void 0) {
    		select_props.value = /*selectedAudioBlockItem*/ ctx[2];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding_1));
    	select.$on("change", /*handleAudioBlockItemSeleced*/ ctx[5]);
    	let each_value = /*activeAP*/ ctx[0].apItems;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[15].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*selectedAudioBlockItem*/ 4) {
    				updating_value = true;
    				select_changes.value = /*selectedAudioBlockItem*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);

    			if (dirty & /*handleItemActive, activeAP, handleDeleteItem, mdiDeleteForever*/ 193) {
    				each_value = /*activeAP*/ ctx[0].apItems;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					transition_in(each_1_else, 1);
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				} else if (each_1_else) {
    					group_outros();

    					transition_out(each_1_else, 1, 1, () => {
    						each_1_else = null;
    					});

    					check_outros();
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    			if (detaching) detach_dev(t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(71:8) <ListItemGroup mandatory class=\\\"font-weight-bold\\\" activeClass=\\\"selectedItem\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:4) <Col cols={12} sm={5} md={5}>
    function create_default_slot_3$1(ctx) {
    	let div;
    	let listitemgroup;
    	let current;

    	listitemgroup = new ListItemGroup({
    			props: {
    				mandatory: true,
    				class: "font-weight-bold",
    				activeClass: "selectedItem",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(listitemgroup.$$.fragment);
    			attr_dev(div, "class", "eps-area audioProgrammeItems svelte-q7gpsk");
    			add_location(div, file$2, 69, 6, 2260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(listitemgroup, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitemgroup_changes = {};

    			if (dirty & /*$$scope, activeAP, selectedAudioBlockItem*/ 262149) {
    				listitemgroup_changes.$$scope = { dirty, ctx };
    			}

    			listitemgroup.$set(listitemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(listitemgroup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(69:4) <Col cols={12} sm={5} md={5}>",
    		ctx
    	});

    	return block;
    }

    // (90:4) <Col cols={12} sm={7} md={7}>
    function create_default_slot_2$2(ctx) {
    	let audioobject;
    	let current;

    	audioobject = new AudioObject({
    			props: { activeItem: /*activeItem*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioobject.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioobject, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioobject_changes = {};
    			if (dirty & /*activeItem*/ 2) audioobject_changes.activeItem = /*activeItem*/ ctx[1];
    			audioobject.$set(audioobject_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioobject.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioobject.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioobject, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(90:4) <Col cols={12} sm={7} md={7}>",
    		ctx
    	});

    	return block;
    }

    // (68:2) <Row>
    function create_default_slot_1$2(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				cols: 12,
    				sm: 5,
    				md: 5,
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				cols: 12,
    				sm: 7,
    				md: 7,
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope, activeAP, selectedAudioBlockItem*/ 262149) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope, activeItem*/ 262146) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(68:2) <Row>",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Container>
    function create_default_slot$2(ctx) {
    	let row0;
    	let t0;
    	let row1;
    	let t1;
    	let row2;
    	let current;

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				class: "mb-6",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row2 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			create_component(row2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, activeAP*/ 262145) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    			const row2_changes = {};

    			if (dirty & /*$$scope, activeItem, activeAP, selectedAudioBlockItem*/ 262151) {
    				row2_changes.$$scope = { dirty, ctx };
    			}

    			row2.$set(row2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(48:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let container;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(container.$$.fragment);
    			attr_dev(div, "class", "audioProgramme svelte-q7gpsk");
    			add_location(div, file$2, 46, 0, 1622);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(container, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope, activeItem, activeAP, selectedAudioBlockItem*/ 262151) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const addItemStr = "Add Item";

    function instance$2($$self, $$props, $$invalidate) {
    	let $fileInfo;
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(14, $fileInfo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AudioProgramme", slots, []);
    	let { activeAP } = $$props;
    	let activeItem;
    	const languages = mapISO6391();
    	const audioBlockItems = getValidLayouts($fileInfo.channels);
    	let selectedAudioBlockItem = addItemStr; // Do not change unless you know what you do!

    	const handleAudioBlockItemSeleced = e => {
    		if (e.detail !== undefined && typeof e.detail === "string" && e.detail !== addItemStr) {
    			ADMStore.addItem(activeAP, e.detail);

    			// Otherwise, the Select component would always display the selected value which would be odd in our case
    			$$invalidate(2, selectedAudioBlockItem = addItemStr);
    		} // if (activeAP.apItems.length === 1){
    		//   console.log("Only one item in list. Activate first!");
    	}; //   handleItemActive(activeAP.apItems[0]);
    	// }

    	const handleItemActive = item => {
    		$$invalidate(1, activeItem = item);
    	};

    	const handleDeleteItem = id => {
    		ADMStore.update(adm => {
    			let ap = adm.find(ap => ap.id === activeAP.id);
    			let apItems = ap.apItems.filter(item => item.id != id);
    			ap.apItems = apItems;
    			return adm;
    		});

    		if (typeof activeItem !== "undefined" && id === activeItem.id) {
    			$$invalidate(1, activeItem = undefined);
    		}
    	};

    	const writable_props = ["activeAP"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AudioProgramme> was created with unknown prop '${key}'`);
    	});

    	function textfield_value_binding(value) {
    		if ($$self.$$.not_equal(activeAP.name, value)) {
    			activeAP.name = value;
    			$$invalidate(0, activeAP);
    		}
    	}

    	function select_value_binding(value) {
    		if ($$self.$$.not_equal(activeAP.language, value)) {
    			activeAP.language = value;
    			$$invalidate(0, activeAP);
    		}
    	}

    	function select_value_binding_1(value) {
    		selectedAudioBlockItem = value;
    		$$invalidate(2, selectedAudioBlockItem);
    	}

    	function textfield_value_binding_1(value, item) {
    		if ($$self.$$.not_equal(item.name, value)) {
    			item.name = value;
    			$$invalidate(0, activeAP);
    		}
    	}

    	const click_handler = item => handleDeleteItem(item.id);
    	const click_handler_1 = item => handleItemActive(item);

    	$$self.$$set = $$props => {
    		if ("activeAP" in $$props) $$invalidate(0, activeAP = $$props.activeAP);
    	};

    	$$self.$capture_state = () => ({
    		ADMStore,
    		fileInfo,
    		ID,
    		AudioObject,
    		Select,
    		Container,
    		Row,
    		Col,
    		TextField,
    		ListItemGroup,
    		ListItem,
    		ExpansionPanels,
    		ExpansionPanel,
    		Chip,
    		Icon,
    		mdiDeleteForever,
    		getValidLayouts,
    		mapISO6391,
    		activeAP,
    		activeItem,
    		languages,
    		audioBlockItems,
    		addItemStr,
    		selectedAudioBlockItem,
    		handleAudioBlockItemSeleced,
    		handleItemActive,
    		handleDeleteItem,
    		$fileInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeAP" in $$props) $$invalidate(0, activeAP = $$props.activeAP);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    		if ("selectedAudioBlockItem" in $$props) $$invalidate(2, selectedAudioBlockItem = $$props.selectedAudioBlockItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activeAP,
    		activeItem,
    		selectedAudioBlockItem,
    		languages,
    		audioBlockItems,
    		handleAudioBlockItemSeleced,
    		handleItemActive,
    		handleDeleteItem,
    		textfield_value_binding,
    		select_value_binding,
    		select_value_binding_1,
    		textfield_value_binding_1,
    		click_handler,
    		click_handler_1
    	];
    }

    class AudioProgramme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { activeAP: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AudioProgramme",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeAP*/ ctx[0] === undefined && !("activeAP" in props)) {
    			console.warn("<AudioProgramme> was created without expected prop 'activeAP'");
    		}
    	}

    	get activeAP() {
    		throw new Error("<AudioProgramme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeAP(value) {
    		throw new Error("<AudioProgramme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FileUpload.svelte generated by Svelte v3.34.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/components/FileUpload.svelte";

    // (76:0) {#if $fileInfo.channels === 0}
    function create_if_block$1(ctx) {
    	let alert;
    	let updating_active;
    	let updating_message;
    	let updating_title;
    	let t;
    	let div;
    	let card;
    	let current;

    	function alert_active_binding(value) {
    		/*alert_active_binding*/ ctx[7](value);
    	}

    	function alert_message_binding(value) {
    		/*alert_message_binding*/ ctx[8](value);
    	}

    	function alert_title_binding(value) {
    		/*alert_title_binding*/ ctx[9](value);
    	}

    	let alert_props = {};

    	if (/*alertActive*/ ctx[2] !== void 0) {
    		alert_props.active = /*alertActive*/ ctx[2];
    	}

    	if (/*alertMessage*/ ctx[3] !== void 0) {
    		alert_props.message = /*alertMessage*/ ctx[3];
    	}

    	if (/*alertTitle*/ ctx[4] !== void 0) {
    		alert_props.title = /*alertTitle*/ ctx[4];
    	}

    	alert = new Alert({ props: alert_props, $$inline: true });
    	binding_callbacks.push(() => bind(alert, "active", alert_active_binding));
    	binding_callbacks.push(() => bind(alert, "message", alert_message_binding));
    	binding_callbacks.push(() => bind(alert, "title", alert_title_binding));

    	card = new Card({
    			props: {
    				hover: true,
    				style: "max-width:500px;",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(alert.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(card.$$.fragment);
    			attr_dev(div, "class", "d-flex justify-center mt-4 mb-4");
    			add_location(div, file$1, 77, 0, 2028);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alert, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(card, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};

    			if (!updating_active && dirty & /*alertActive*/ 4) {
    				updating_active = true;
    				alert_changes.active = /*alertActive*/ ctx[2];
    				add_flush_callback(() => updating_active = false);
    			}

    			if (!updating_message && dirty & /*alertMessage*/ 8) {
    				updating_message = true;
    				alert_changes.message = /*alertMessage*/ ctx[3];
    				add_flush_callback(() => updating_message = false);
    			}

    			if (!updating_title && dirty & /*alertTitle*/ 16) {
    				updating_title = true;
    				alert_changes.title = /*alertTitle*/ ctx[4];
    				add_flush_callback(() => updating_title = false);
    			}

    			alert.$set(alert_changes);
    			const card_changes = {};

    			if (dirty & /*$$scope, showProgress, wavFile*/ 16387) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(76:0) {#if $fileInfo.channels === 0}",
    		ctx
    	});

    	return block;
    }

    // (84:4) <CardText>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Currently, only plain WAV files are supported. When a BW64 file inlcuding an \"axml\" chunk is uploaded, the axml chunk will be ignored for now.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(84:4) <CardText>",
    		ctx
    	});

    	return block;
    }

    // (87:4) <CardActions>
    function create_default_slot_1$1(ctx) {
    	let form;
    	let label;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label = element("label");
    			label.textContent = "Upload File";
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "for", "file-upload");
    			attr_dev(label, "class", "d-flex s-btn primary-color size-default justify-center");
    			add_location(label, file$1, 88, 8, 2490);
    			attr_dev(input, "id", "file-upload");
    			attr_dev(input, "accept", "audio/wav");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "file");
    			attr_dev(input, "class", "svelte-nn3gqf");
    			add_location(input, file$1, 90, 8, 2616);
    			attr_dev(form, "method", "post");
    			attr_dev(form, "enctype", "multipart/form-data");
    			add_location(form, file$1, 87, 6, 2431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(87:4) <CardActions>",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if showProgress}
    function create_if_block_1$1(ctx) {
    	let progresslinear;
    	let current;

    	progresslinear = new ProgressLinear({
    			props: { height: "16px", indeterminate: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progresslinear.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresslinear, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresslinear.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresslinear.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresslinear, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(100:4) {#if showProgress}",
    		ctx
    	});

    	return block;
    }

    // (79:2) <Card hover style="max-width:500px;">
    function create_default_slot$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let br;
    	let t2;
    	let cardtext;
    	let t3;
    	let cardactions;
    	let t4;
    	let if_block_anchor;
    	let current;

    	cardtext = new CardText({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cardactions = new CardActions({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*showProgress*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Upload WAV File";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			create_component(cardtext.$$.fragment);
    			t3 = space();
    			create_component(cardactions.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "text-h5 mb-2");
    			add_location(span, file$1, 80, 6, 2153);
    			add_location(br, file$1, 81, 6, 2209);
    			attr_dev(div, "class", "pl-4 pr-4 pt-3");
    			add_location(div, file$1, 79, 4, 2118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, br);
    			insert_dev(target, t2, anchor);
    			mount_component(cardtext, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(cardactions, target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cardtext_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				cardtext_changes.$$scope = { dirty, ctx };
    			}

    			cardtext.$set(cardtext_changes);
    			const cardactions_changes = {};

    			if (dirty & /*$$scope, wavFile*/ 16385) {
    				cardactions_changes.$$scope = { dirty, ctx };
    			}

    			cardactions.$set(cardactions_changes);

    			if (/*showProgress*/ ctx[1]) {
    				if (if_block) {
    					if (dirty & /*showProgress*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(cardtext.$$.fragment, local);
    			transition_in(cardactions.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardtext.$$.fragment, local);
    			transition_out(cardactions.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			destroy_component(cardtext, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(cardactions, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(79:2) <Card hover style=\\\"max-width:500px;\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$fileInfo*/ ctx[5].channels === 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$fileInfo*/ ctx[5].channels === 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$fileInfo*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function json(response) {
    	return response.json();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $fileInfo;
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(5, $fileInfo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FileUpload", slots, []);
    	let wavFile;
    	let lastFile = "";
    	let showProgress = false;
    	let alertActive = false;
    	let alertMessage;
    	let alertTitle;
    	let uploadProgress = [];
    	let progressBar = document.getElementById("progress-bar");

    	function uploadFile(file) {
    		let url = "/";
    		let formData = new FormData();
    		formData.append("file", file);

    		fetch(url, {
    			method: "POST",
    			body: formData,
    			redirect: "follow"
    		}).then(function (response) {
    			if (!response.ok) {
    				$$invalidate(3, alertMessage = "Error during WAV upload: " + response.statusText);
    				$$invalidate(4, alertTitle = "Upload Error");
    				$$invalidate(2, alertActive = true);
    			}

    			return response;
    		}).then(json).then(e => {
    			console.log("Received: ", e);

    			fileInfo.update(info => {
    				info.filename = e.filename;
    				info.path = e.path;
    				info.channels = e.wav_info["Channels"];
    				return info;
    			});

    			ADMStore.addAP();
    		}).catch(e => {
    			console.log("Received Error: ", e);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<FileUpload> was created with unknown prop '${key}'`);
    	});

    	function alert_active_binding(value) {
    		alertActive = value;
    		$$invalidate(2, alertActive);
    	}

    	function alert_message_binding(value) {
    		alertMessage = value;
    		$$invalidate(3, alertMessage);
    	}

    	function alert_title_binding(value) {
    		alertTitle = value;
    		$$invalidate(4, alertTitle);
    	}

    	function input_change_handler() {
    		wavFile = this.files;
    		$$invalidate(0, wavFile);
    	}

    	$$self.$capture_state = () => ({
    		Card,
    		CardText,
    		CardActions,
    		ProgressLinear,
    		ADMStore,
    		fileInfo,
    		Alert,
    		wavFile,
    		lastFile,
    		showProgress,
    		alertActive,
    		alertMessage,
    		alertTitle,
    		uploadProgress,
    		progressBar,
    		json,
    		uploadFile,
    		$fileInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("wavFile" in $$props) $$invalidate(0, wavFile = $$props.wavFile);
    		if ("lastFile" in $$props) $$invalidate(6, lastFile = $$props.lastFile);
    		if ("showProgress" in $$props) $$invalidate(1, showProgress = $$props.showProgress);
    		if ("alertActive" in $$props) $$invalidate(2, alertActive = $$props.alertActive);
    		if ("alertMessage" in $$props) $$invalidate(3, alertMessage = $$props.alertMessage);
    		if ("alertTitle" in $$props) $$invalidate(4, alertTitle = $$props.alertTitle);
    		if ("uploadProgress" in $$props) uploadProgress = $$props.uploadProgress;
    		if ("progressBar" in $$props) progressBar = $$props.progressBar;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wavFile, lastFile*/ 65) {
    			if (wavFile) {
    				// binding to "files" attribute is triggered twice for some reasons, so catching it here
    				if (lastFile !== wavFile) {
    					// Note that `files` is of type `FileList`, not an Array:
    					// https://developer.mozilla.org/en-US/docs/Web/API/FileList
    					console.log(wavFile);

    					let files = [...wavFile];
    					$$invalidate(1, showProgress = true);
    					uploadFile(files[0]);
    					$$invalidate(6, lastFile = wavFile);
    				}
    			}
    		}
    	};

    	return [
    		wavFile,
    		showProgress,
    		alertActive,
    		alertMessage,
    		alertTitle,
    		$fileInfo,
    		lastFile,
    		alert_active_binding,
    		alert_message_binding,
    		alert_title_binding,
    		input_change_handler
    	];
    }

    class FileUpload extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileUpload",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.34.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (108:4) {#if $fileInfo.channels > 0}
    function create_if_block_4(ctx) {
    	let tabs;
    	let updating_value;
    	let current;

    	function tabs_value_binding(value) {
    		/*tabs_value_binding*/ ctx[19](value);
    	}

    	let tabs_props = {
    		$$slots: {
    			default: [create_default_slot_4],
    			tabs: [create_tabs_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*tabValue*/ ctx[0] !== void 0) {
    		tabs_props.value = /*tabValue*/ ctx[0];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, "value", tabs_value_binding));

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope, $ADMStore*/ 134217760) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*tabValue*/ 1) {
    				updating_value = true;
    				tabs_changes.value = /*tabValue*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(108:4) {#if $fileInfo.channels > 0}",
    		ctx
    	});

    	return block;
    }

    // (111:10) <Button on:click={handleAddAP} size="large" class="primary-color mr-2">
    function create_default_slot_7(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: mdiPlusCircle },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
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
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(111:10) <Button on:click={handleAddAP} size=\\\"large\\\" class=\\\"primary-color mr-2\\\">",
    		ctx
    	});

    	return block;
    }

    // (115:12) <Tab on:click={() => handleAPSelected(ap)}>
    function create_default_slot_6(ctx) {
    	let t0_value = /*ap*/ ctx[22].name + "";
    	let t0;
    	let t1;
    	let a;
    	let icon;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { path: mdiDeleteForever },
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[16](/*ap*/ ctx[22]);
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			a = element("a");
    			create_component(icon.$$.fragment);
    			t2 = space();
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "hover_delete");
    			add_location(a, file, 116, 14, 3615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    			mount_component(icon, a, null);
    			insert_dev(target, t2, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$ADMStore*/ 32) && t0_value !== (t0_value = /*ap*/ ctx[22].name + "")) set_data_dev(t0, t0_value);
    		},
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    			destroy_component(icon);
    			if (detaching) detach_dev(t2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(115:12) <Tab on:click={() => handleAPSelected(ap)}>",
    		ctx
    	});

    	return block;
    }

    // (114:10) {#each $ADMStore as ap (ap.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let tab;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[17](/*ap*/ ctx[22]);
    	}

    	tab = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab.$on("click", click_handler_1);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tab.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tab_changes = {};

    			if (dirty & /*$$scope, $ADMStore*/ 134217760) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(114:10) {#each $ADMStore as ap (ap.id)}",
    		ctx
    	});

    	return block;
    }

    // (110:8) <div slot="tabs">
    function create_tabs_slot(ctx) {
    	let div;
    	let button;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	button = new Button({
    			props: {
    				size: "large",
    				class: "primary-color mr-2",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleAddAP*/ ctx[10]);
    	let each_value_1 = /*$ADMStore*/ ctx[5];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*ap*/ ctx[22].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "tabs");
    			add_location(div, file, 109, 8, 3317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*handleAPSelected, $ADMStore, handleDeleteAP, mdiDeleteForever*/ 800) {
    				each_value_1 = /*$ADMStore*/ ctx[5];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tabs_slot.name,
    		type: "slot",
    		source: "(110:8) <div slot=\\\"tabs\\\">",
    		ctx
    	});

    	return block;
    }

    // (122:10) <TabContent>
    function create_default_slot_5(ctx) {
    	let audioprogramme;
    	let updating_activeAP;
    	let t;
    	let current;

    	function audioprogramme_activeAP_binding(value) {
    		/*audioprogramme_activeAP_binding*/ ctx[18](value, /*ap*/ ctx[22], /*each_value*/ ctx[23], /*ap_index*/ ctx[24]);
    	}

    	let audioprogramme_props = {};

    	if (/*ap*/ ctx[22] !== void 0) {
    		audioprogramme_props.activeAP = /*ap*/ ctx[22];
    	}

    	audioprogramme = new AudioProgramme({
    			props: audioprogramme_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(audioprogramme, "activeAP", audioprogramme_activeAP_binding));

    	const block = {
    		c: function create() {
    			create_component(audioprogramme.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioprogramme, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const audioprogramme_changes = {};

    			if (!updating_activeAP && dirty & /*$ADMStore*/ 32) {
    				updating_activeAP = true;
    				audioprogramme_changes.activeAP = /*ap*/ ctx[22];
    				add_flush_callback(() => updating_activeAP = false);
    			}

    			audioprogramme.$set(audioprogramme_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioprogramme.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioprogramme.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioprogramme, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(122:10) <TabContent>",
    		ctx
    	});

    	return block;
    }

    // (121:8) {#each $ADMStore as ap (ap.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let tabcontent;
    	let current;

    	tabcontent = new TabContent({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tabcontent.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tabcontent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tabcontent_changes = {};

    			if (dirty & /*$$scope, $ADMStore*/ 134217760) {
    				tabcontent_changes.$$scope = { dirty, ctx };
    			}

    			tabcontent.$set(tabcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tabcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(121:8) {#each $ADMStore as ap (ap.id)}",
    		ctx
    	});

    	return block;
    }

    // (109:6) <Tabs bind:value={tabValue} >
    function create_default_slot_4(ctx) {
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$ADMStore*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*ap*/ ctx[22].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$ADMStore*/ 32) {
    				each_value = /*$ADMStore*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(109:6) <Tabs bind:value={tabValue} >",
    		ctx
    	});

    	return block;
    }

    // (104:2) <MaterialApp theme='dark'>
    function create_default_slot_3(ctx) {
    	let fileupload;
    	let t0;
    	let alert;
    	let updating_active;
    	let updating_message;
    	let updating_title;
    	let t1;
    	let if_block_anchor;
    	let current;
    	fileupload = new FileUpload({ $$inline: true });

    	function alert_active_binding(value) {
    		/*alert_active_binding*/ ctx[13](value);
    	}

    	function alert_message_binding(value) {
    		/*alert_message_binding*/ ctx[14](value);
    	}

    	function alert_title_binding(value) {
    		/*alert_title_binding*/ ctx[15](value);
    	}

    	let alert_props = {};

    	if (/*alertActive*/ ctx[1] !== void 0) {
    		alert_props.active = /*alertActive*/ ctx[1];
    	}

    	if (/*alertMessage*/ ctx[2] !== void 0) {
    		alert_props.message = /*alertMessage*/ ctx[2];
    	}

    	if (/*alertTitle*/ ctx[3] !== void 0) {
    		alert_props.title = /*alertTitle*/ ctx[3];
    	}

    	alert = new Alert({ props: alert_props, $$inline: true });
    	binding_callbacks.push(() => bind(alert, "active", alert_active_binding));
    	binding_callbacks.push(() => bind(alert, "message", alert_message_binding));
    	binding_callbacks.push(() => bind(alert, "title", alert_title_binding));
    	let if_block = /*$fileInfo*/ ctx[6].channels > 0 && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			create_component(fileupload.$$.fragment);
    			t0 = space();
    			create_component(alert.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(fileupload, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(alert, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_changes = {};

    			if (!updating_active && dirty & /*alertActive*/ 2) {
    				updating_active = true;
    				alert_changes.active = /*alertActive*/ ctx[1];
    				add_flush_callback(() => updating_active = false);
    			}

    			if (!updating_message && dirty & /*alertMessage*/ 4) {
    				updating_message = true;
    				alert_changes.message = /*alertMessage*/ ctx[2];
    				add_flush_callback(() => updating_message = false);
    			}

    			if (!updating_title && dirty & /*alertTitle*/ 8) {
    				updating_title = true;
    				alert_changes.title = /*alertTitle*/ ctx[3];
    				add_flush_callback(() => updating_title = false);
    			}

    			alert.$set(alert_changes);

    			if (/*$fileInfo*/ ctx[6].channels > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$fileInfo*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(fileupload.$$.fragment, local);
    			transition_in(alert.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileupload.$$.fragment, local);
    			transition_out(alert.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fileupload, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(alert, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(104:2) <MaterialApp theme='dark'>",
    		ctx
    	});

    	return block;
    }

    // (131:2) {#if !isProd}
    function create_if_block_3(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				class: "red white-text",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*logStore*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(131:2) {#if !isProd}",
    		ctx
    	});

    	return block;
    }

    // (132:4) <Button on:click={logStore} class="red white-text">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Log Store to Console");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(132:4) <Button on:click={logStore} class=\\\"red white-text\\\">",
    		ctx
    	});

    	return block;
    }

    // (134:2) {#if $fileInfo.channels > 0 && $ADMStore.length > 0}
    function create_if_block_2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				class: "blue white-text",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(134:2) {#if $fileInfo.channels > 0 && $ADMStore.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (135:4) <Button on:click={() => exportADM()} class="blue white-text">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export ADM");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(135:4) <Button on:click={() => exportADM()} class=\\\"blue white-text\\\">",
    		ctx
    	});

    	return block;
    }

    // (137:2) {#if $fileInfo.bw64_file}
    function create_if_block_1(ctx) {
    	let a;
    	let button;
    	let a_href_value;
    	let a_download_value;
    	let current;

    	button = new Button({
    			props: {
    				class: "green white-text",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", a_href_value = /*$fileInfo*/ ctx[6].bw64_file);
    			attr_dev(a, "download", a_download_value = /*$fileInfo*/ ctx[6].bw64_file.split("/").slice(-1)[0]);
    			set_style(a, "text-decoration", "none");
    			add_location(a, file, 137, 4, 4278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (!current || dirty & /*$fileInfo*/ 64 && a_href_value !== (a_href_value = /*$fileInfo*/ ctx[6].bw64_file)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*$fileInfo*/ 64 && a_download_value !== (a_download_value = /*$fileInfo*/ ctx[6].bw64_file.split("/").slice(-1)[0])) {
    				attr_dev(a, "download", a_download_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(137:2) {#if $fileInfo.bw64_file}",
    		ctx
    	});

    	return block;
    }

    // (138:120) <Button class="green white-text">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Download BW64 File");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(138:120) <Button class=\\\"green white-text\\\">",
    		ctx
    	});

    	return block;
    }

    // (141:2) {#if !isProd}
    function create_if_block(ctx) {
    	let textarea;
    	let current;

    	textarea = new Textarea({
    			props: {
    				readonly: true,
    				class: "storeArea",
    				value: /*stringifiedADMStore*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textarea.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textarea, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textarea_changes = {};
    			if (dirty & /*stringifiedADMStore*/ 16) textarea_changes.value = /*stringifiedADMStore*/ ctx[4];
    			textarea.$set(textarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textarea, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(141:2) {#if !isProd}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let materialapp;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: "dark",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = !/*isProd*/ ctx[7] && create_if_block_3(ctx);
    	let if_block1 = /*$fileInfo*/ ctx[6].channels > 0 && /*$ADMStore*/ ctx[5].length > 0 && create_if_block_2(ctx);
    	let if_block2 = /*$fileInfo*/ ctx[6].bw64_file && create_if_block_1(ctx);
    	let if_block3 = !/*isProd*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(materialapp.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div, "class", "materialApp svelte-p59vd7");
    			add_location(div, file, 102, 2, 2924);
    			attr_dev(main, "class", "svelte-p59vd7");
    			add_location(main, file, 101, 1, 2915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(materialapp, div, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t3);
    			if (if_block3) if_block3.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, tabValue, $ADMStore, $fileInfo, alertActive, alertMessage, alertTitle*/ 134217839) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    			if (!/*isProd*/ ctx[7]) if_block0.p(ctx, dirty);

    			if (/*$fileInfo*/ ctx[6].channels > 0 && /*$ADMStore*/ ctx[5].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$fileInfo, $ADMStore*/ 96) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$fileInfo*/ ctx[6].bw64_file) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$fileInfo*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!/*isProd*/ ctx[7]) if_block3.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(materialapp);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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
    	let $ADMStore;
    	let $fileInfo;
    	validate_store(ADMStore, "ADMStore");
    	component_subscribe($$self, ADMStore, $$value => $$invalidate(5, $ADMStore = $$value));
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(6, $fileInfo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const isProd = {"env":{"isProd":false}}.env.isProd;
    	let tabValue;
    	let selectedAP;
    	let alertActive = false;
    	let alertMessage;
    	let alertTitle;
    	let stringifiedADMStore;
    	

    	const handleDeleteAP = id => {
    		if ($ADMStore.length > 1) {
    			ADMStore.update(adm => {
    				return adm.filter(ap => ap.id != id);
    			});

    			if (typeof selectedAP !== "undefined" && selectedAP.id === id) {
    				$$invalidate(0, tabValue = 0);
    			}
    		} else {
    			$$invalidate(1, alertActive = true);
    			$$invalidate(2, alertMessage = "There must be at least one Audio Programme!");
    		}
    	};

    	const handleAPSelected = ap => {
    		selectedAP = ap;
    		console.log(ap);
    	};

    	const handleAddAP = e => {
    		console.log("Add AP!");
    		ADMStore.addAP();
    	};

    	const logStore = () => {
    		console.log($ADMStore);
    		console.log($fileInfo);
    		$$invalidate(4, stringifiedADMStore = JSON.stringify($ADMStore, undefined, 4));
    	};

    	const exportADM = () => {
    		// make deep copy of our store to avoid saving our modifications in case something happens during export / writing
    		let adm = JSON.parse(JSON.stringify($ADMStore));

    		for (const ap of adm) {
    			if (ap.apItems.length > 0) {
    				for (const item of ap.apItems) {
    					let res = getRangeFromDisplayedName(item.routing);

    					if (res !== false) {
    						item.routing = res;
    					} else {
    						$$invalidate(2, alertMessage = "Please enter valid channel routing for item \"" + item.name + "\" in AudioProgramme \"" + ap.name + "\"!");
    						$$invalidate(3, alertTitle = "Error");
    						$$invalidate(1, alertActive = true);
    						return;
    					}
    				}
    			} else {
    				$$invalidate(2, alertMessage = "Please add at least one item for AudioProgramme \"" + ap.name + "\"!");
    				$$invalidate(3, alertTitle = "Error");
    				$$invalidate(1, alertActive = true);
    				return;
    			}
    		}

    		let url = "/set_bw64_config";
    		var out_path = $fileInfo.path.substr(0, $fileInfo.path.lastIndexOf(".")) + "_bw64.wav";
    		let formData = new FormData();
    		formData.append("adm_dict", JSON.stringify(adm));
    		formData.append("in_wav_path", $fileInfo.path);
    		formData.append("out_bwav_path", out_path);

    		fetch(url, {
    			method: "POST",
    			body: formData,
    			redirect: "follow"
    		}).then(response => response.json()).then(e => {
    			fileInfo.update(info => {
    				info.bw64_file = e.bw64_file;
    				return info;
    			});
    		}).catch(e => {
    			console.log(e); // <- Add `progressDone` call here
    			$$invalidate(2, alertMessage = "Error during ADM Export: " + e);
    			$$invalidate(3, alertTitle = "Export Error");
    			$$invalidate(1, alertActive = true);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function alert_active_binding(value) {
    		alertActive = value;
    		$$invalidate(1, alertActive);
    	}

    	function alert_message_binding(value) {
    		alertMessage = value;
    		$$invalidate(2, alertMessage);
    	}

    	function alert_title_binding(value) {
    		alertTitle = value;
    		$$invalidate(3, alertTitle);
    	}

    	const click_handler = ap => handleDeleteAP(ap.id);
    	const click_handler_1 = ap => handleAPSelected(ap);

    	function audioprogramme_activeAP_binding(value, ap, each_value, ap_index) {
    		each_value[ap_index] = value;
    		ADMStore.set($ADMStore);
    	}

    	function tabs_value_binding(value) {
    		tabValue = value;
    		$$invalidate(0, tabValue);
    	}

    	const click_handler_2 = () => exportADM();

    	$$self.$capture_state = () => ({
    		AudioProgramme,
    		FileUpload,
    		Alert,
    		ADMStore,
    		fileInfo,
    		getRangeFromDisplayedName,
    		MaterialApp,
    		Tabs,
    		Tab,
    		TabContent,
    		Button,
    		Icon,
    		Textarea,
    		mdiDeleteForever,
    		mdiPlusCircle,
    		isProd,
    		tabValue,
    		selectedAP,
    		alertActive,
    		alertMessage,
    		alertTitle,
    		stringifiedADMStore,
    		handleDeleteAP,
    		handleAPSelected,
    		handleAddAP,
    		logStore,
    		exportADM,
    		$ADMStore,
    		$fileInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabValue" in $$props) $$invalidate(0, tabValue = $$props.tabValue);
    		if ("selectedAP" in $$props) selectedAP = $$props.selectedAP;
    		if ("alertActive" in $$props) $$invalidate(1, alertActive = $$props.alertActive);
    		if ("alertMessage" in $$props) $$invalidate(2, alertMessage = $$props.alertMessage);
    		if ("alertTitle" in $$props) $$invalidate(3, alertTitle = $$props.alertTitle);
    		if ("stringifiedADMStore" in $$props) $$invalidate(4, stringifiedADMStore = $$props.stringifiedADMStore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tabValue,
    		alertActive,
    		alertMessage,
    		alertTitle,
    		stringifiedADMStore,
    		$ADMStore,
    		$fileInfo,
    		isProd,
    		handleDeleteAP,
    		handleAPSelected,
    		handleAddAP,
    		logStore,
    		exportADM,
    		alert_active_binding,
    		alert_message_binding,
    		alert_title_binding,
    		click_handler,
    		click_handler_1,
    		audioprogramme_activeAP_binding,
    		tabs_value_binding,
    		click_handler_2
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
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
