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

export function warn() {
  for(var i=0; i < arguments.length; i++) {
    var s = String(arguments[i]);
    error(s.indexOf("[object ") >= 0 ? JSON.stringify(arguments[i]) : s);
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