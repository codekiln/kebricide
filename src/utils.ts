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