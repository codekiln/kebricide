autowatch = 1


export function logFactory({ outputLogs = true }) {
  function log(...args: any[]) {
    for (let i = 0; i < args.length; i++) {
      const s = String(args[i]);
      post(s.indexOf('[object ') >= 0 ? JSON.stringify(args[i]) : s);
    }
    post('\n');
  }

  if (!outputLogs) {
    // No-op if we don't want to output logs
    return () => {};
  }

  return log;
}

export function warn(...args: any[]) {
  for(let i=0; i < args.length; i++) {
    const s = String(args[i]);
    error(s.indexOf("[object ") >= 0 ? JSON.stringify(args[i]) : s);
  }
  error("\n");
}

export function logReload(logger: (...args: any[]) => void) {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
  logger("------------------------------------------------------------------")
  logger("Reloaded on", timeString); // Example output: "js: Reloaded on  06:13:37"
  logger("------------------------------------------------------------------")
}

/**
 * Creates a wrapper around a LiveAPI instance that adds error handling and logging.
 * This wrapper intercepts all common LiveAPI methods (get, set, call, goto) and 
 * provides detailed error messages if they fail.
 * 
 * @param liveApi - The LiveAPI instance to wrap
 * @returns A wrapped version of the LiveAPI instance with enhanced error handling
 */
export function createLiveApiWrapper(liveApi: LiveAPI) {
  // Store original methods we want to wrap
  const originalMethods = {
    get: liveApi.get.bind(liveApi),
    set: liveApi.set.bind(liveApi),
    call: liveApi.call.bind(liveApi),
    goto: liveApi.goto.bind(liveApi)
  };

  return {
    get(property: string) {
      try {
        return originalMethods.get(property);
      } catch (e) {
        warn(`LiveAPI get() failed for property "${property}" at path: ${liveApi.path}`);
        throw e;
      }
    },

    set(property: string, value: any) {
      try {
        return originalMethods.set(property, value);
      } catch (e) {
        warn(`LiveAPI set() failed for property "${property}" with value ${value} at path: ${liveApi.path}`);
        throw e;
      }
    },

    call(func: string, ...args: any[]) {
      try {
        return originalMethods.call(func, ...args); 
      } catch (e) {
        warn(`LiveAPI call() failed for function "${func}" with args ${args} at path: ${liveApi.path}`);
        throw e;
      }
    },

    goto(path: string) {
      try {
        return originalMethods.goto(path);
      } catch (e) {
        warn(`LiveAPI goto() failed for path "${path}"`);
        throw e;
      }
    },

    // Pass through other properties
    get path() { return liveApi.path; },
    get id() { return liveApi.id; }
    // Add other properties as needed
  };
}

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

export class MaxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Use error() directly for Max console error reporting
    error("----------------------------------------\n")
    error(`${this.name}:\n`)
    error(`${message}\n`)
    error("----------------------------------------\n")
  }
}

// Update InvalidLiveApiPathError to extend from MaxError
export class InvalidLiveApiPathError extends MaxError {
  constructor(
    public readonly path: string,
    public readonly liveApi: LiveAPI
  ) {
    // Include more details about the invalid LiveAPI object
    super(`Invalid Live API path: ${path}\nInfo: ${liveApi.info}\nID: ${liveApi.id}`)
  }
}

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
export function isInvalidLiveApiPath(api: LiveAPI): boolean {
  return Number(api.id) === 0 || String(api.info) === "No object"
}

/**
 * Creates a LiveAPI object at the given path and verifies it exists.
 * @param path The path to create the LiveAPI object at
 * @param callback Optional callback function for the LiveAPI constructor
 * @returns A valid LiveAPI object
 * @throws InvalidLiveApiPathError if the path doesn't exist
 */
export function createValidatedLiveApi(
  path: string,
  callback: () => void = () => {}
): LiveAPI {
  const api = new LiveAPI(callback, path)
  if (isInvalidLiveApiPath(api)) {
    warn('----------------------------------------')
    warn('Invalid Live API Path Error:')
    warn(`Path: ${path}`)
    warn(`Info: ${api.info}`)
    warn(`ID: ${api.id}`)
    warn('----------------------------------------')
    throw new Error(`Invalid Live API path: ${path}`)
  }
  return api
}

/**
 * Creates a validated and wrapped LiveAPI object at the given path.
 * @param path The path to create the LiveAPI object at
 * @param callback Optional callback function for the LiveAPI constructor
 * @returns A wrapped, valid LiveAPI object
 * @throws InvalidLiveApiPathError if the path doesn't exist
 */
export function createValidatedLiveApiWrapper(
  path: string,
  callback: () => void = () => {}
) {
  const api = createValidatedLiveApi(path, callback)
  return createLiveApiWrapper(api)
}

// Example additional error types
export class LiveApiPropertyError extends MaxError {
  constructor(
    public readonly property: string,
    public readonly path: string
  ) {
    super(`Failed to get property "${property}" at path: ${path}`)
  }
}

export class LiveApiMethodError extends MaxError {
  constructor(
    public readonly method: string,
    public readonly args: any[],
    public readonly path: string
  ) {
    super(`Failed to call method "${method}" with args [${args.join(', ')}] at path: ${path}`)
  }
}