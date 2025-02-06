"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiveApiWrapper = exports.logReload = exports.warn = exports.logFactory = void 0;
function logFactory(_a) {
    var _b = _a.outputLogs, outputLogs = _b === void 0 ? true : _b;
    function log() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            var s = String(args[i]);
            post(s.indexOf('[object ') >= 0 ? JSON.stringify(args[i]) : s);
        }
        post('\n');
    }
    if (!outputLogs) {
        // No-op if we don't want to output logs
        return function () { };
    }
    return log;
}
exports.logFactory = logFactory;
function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    for (var i = 0; i < args.length; i++) {
        var s = String(args[i]);
        error(s.indexOf("[object ") >= 0 ? JSON.stringify(args[i]) : s);
    }
    error("\n");
}
exports.warn = warn;
function logReload(logger) {
    var now = new Date();
    var timeString = now.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
    logger("------------------------------------------------------------------");
    logger("Reloaded on", timeString); // Example output: "js: Reloaded on  06:13:37"
    logger("------------------------------------------------------------------");
}
exports.logReload = logReload;
function createLiveApiWrapper(liveApi) {
    // Store original methods we want to wrap
    var originalMethods = {
        get: liveApi.get.bind(liveApi),
        set: liveApi.set.bind(liveApi),
        call: liveApi.call.bind(liveApi),
        goto: liveApi.goto.bind(liveApi)
    };
    return {
        get: function (property) {
            try {
                return originalMethods.get(property);
            }
            catch (e) {
                warn("LiveAPI get() failed for property \"".concat(property, "\" at path: ").concat(liveApi.path));
                throw e;
            }
        },
        set: function (property, value) {
            try {
                return originalMethods.set(property, value);
            }
            catch (e) {
                warn("LiveAPI set() failed for property \"".concat(property, "\" with value ").concat(value, " at path: ").concat(liveApi.path));
                throw e;
            }
        },
        call: function (func) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            try {
                return originalMethods.call.apply(originalMethods, __spreadArray([func], args, false));
            }
            catch (e) {
                warn("LiveAPI call() failed for function \"".concat(func, "\" with args ").concat(args, " at path: ").concat(liveApi.path));
                throw e;
            }
        },
        goto: function (path) {
            try {
                return originalMethods.goto(path);
            }
            catch (e) {
                warn("LiveAPI goto() failed for path \"".concat(path, "\""));
                throw e;
            }
        },
        // Pass through other properties
        get path() { return liveApi.path; },
        get id() { return liveApi.id; }
        // Add other properties as needed
    };
}
exports.createLiveApiWrapper = createLiveApiWrapper;
// Usage example:
/*
const api = new LiveAPI();
const wrappedApi = createLiveApiWrapper(api);

// Now use wrappedApi instead of api directly
try {
  wrappedApi.goto('live_set');
  const value = wrappedApi.get('some_property');
} catch (e) {
  // Error will include more context
}
*/ 
