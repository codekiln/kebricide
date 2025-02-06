"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.LiveApiMethodError = exports.LiveApiPropertyError = exports.createValidatedLiveApiWrapper = exports.createValidatedLiveApi = exports.isInvalidLiveApiPath = exports.InvalidLiveApiPathError = exports.MaxError = exports.createLiveApiWrapper = exports.logReload = exports.warn = exports.logFactory = void 0;
autowatch = 1;
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
/**
 * Creates a wrapper around a LiveAPI instance that adds error handling and logging.
 * This wrapper intercepts all common LiveAPI methods (get, set, call, goto) and
 * provides detailed error messages if they fail.
 *
 * @param liveApi - The LiveAPI instance to wrap
 * @returns A wrapped version of the LiveAPI instance with enhanced error handling
 */
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
var MaxError = /** @class */ (function (_super) {
    __extends(MaxError, _super);
    function MaxError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        // Use error() directly for Max console error reporting
        error("----------------------------------------\n");
        error("".concat(_this.name, ":\n"));
        error("".concat(message, "\n"));
        error("----------------------------------------\n");
        return _this;
    }
    return MaxError;
}(Error));
exports.MaxError = MaxError;
// Update InvalidLiveApiPathError to extend from MaxError
var InvalidLiveApiPathError = /** @class */ (function (_super) {
    __extends(InvalidLiveApiPathError, _super);
    function InvalidLiveApiPathError(path, liveApi) {
        var _this = 
        // Include more details about the invalid LiveAPI object
        _super.call(this, "Invalid Live API path: ".concat(path, "\nInfo: ").concat(liveApi.info, "\nID: ").concat(liveApi.id)) || this;
        _this.path = path;
        _this.liveApi = liveApi;
        return _this;
    }
    return InvalidLiveApiPathError;
}(MaxError));
exports.InvalidLiveApiPathError = InvalidLiveApiPathError;
/**
 * Checks if a LiveAPI object is invalid or doesn't exist.
 *
 * In Max's JS environment, a LiveAPI object is considered invalid if:
 * - Its id property is "0" (returned as a string primitive)
 * - Its info property is "No object" (returned as a string primitive)
 *
 * @param api The LiveAPI object to validate
 * @returns true if the LiveAPI object is invalid/doesn't exist, false otherwise
 *
 * @example
 * const api = new LiveAPI(() => {}, 'live_set')
 * if (isInvalidLiveApiPath(api)) {
 *   warn('Invalid or nonexistent Live API path')
 * }
 */
function isInvalidLiveApiPath(api) {
    return Number(api.id) === 0 || String(api.info) === "No object";
}
exports.isInvalidLiveApiPath = isInvalidLiveApiPath;
/**
 * Creates a LiveAPI object at the given path and verifies it exists.
 * @param path The path to create the LiveAPI object at
 * @param callback Optional callback function for the LiveAPI constructor
 * @returns A valid LiveAPI object
 * @throws InvalidLiveApiPathError if the path doesn't exist
 */
function createValidatedLiveApi(path, callback) {
    if (callback === void 0) { callback = function () { }; }
    var api = new LiveAPI(callback, path);
    if (isInvalidLiveApiPath(api)) {
        warn('----------------------------------------');
        warn('Invalid Live API Path Error:');
        warn("Path: ".concat(path));
        warn("Info: ".concat(api.info));
        warn("ID: ".concat(api.id));
        warn('----------------------------------------');
        throw new Error("Invalid Live API path: ".concat(path));
    }
    return api;
}
exports.createValidatedLiveApi = createValidatedLiveApi;
/**
 * Creates a validated and wrapped LiveAPI object at the given path.
 * @param path The path to create the LiveAPI object at
 * @param callback Optional callback function for the LiveAPI constructor
 * @returns A wrapped, valid LiveAPI object
 * @throws InvalidLiveApiPathError if the path doesn't exist
 */
function createValidatedLiveApiWrapper(path, callback) {
    if (callback === void 0) { callback = function () { }; }
    var api = createValidatedLiveApi(path, callback);
    return createLiveApiWrapper(api);
}
exports.createValidatedLiveApiWrapper = createValidatedLiveApiWrapper;
// Example additional error types
var LiveApiPropertyError = /** @class */ (function (_super) {
    __extends(LiveApiPropertyError, _super);
    function LiveApiPropertyError(property, path) {
        var _this = _super.call(this, "Failed to get property \"".concat(property, "\" at path: ").concat(path)) || this;
        _this.property = property;
        _this.path = path;
        return _this;
    }
    return LiveApiPropertyError;
}(MaxError));
exports.LiveApiPropertyError = LiveApiPropertyError;
var LiveApiMethodError = /** @class */ (function (_super) {
    __extends(LiveApiMethodError, _super);
    function LiveApiMethodError(method, args, path) {
        var _this = _super.call(this, "Failed to call method \"".concat(method, "\" with args [").concat(args.join(', '), "] at path: ").concat(path)) || this;
        _this.method = method;
        _this.args = args;
        _this.path = path;
        return _this;
    }
    return LiveApiMethodError;
}(MaxError));
exports.LiveApiMethodError = LiveApiMethodError;
