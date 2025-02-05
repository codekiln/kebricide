autowatch = 1
inlets = 1
outlets = 1

const config = {
  outputLogs: true,
}

import { logFactory } from './utils'
const log = logFactory(config)

const INLET_FOO = 0
const OUTLET_FOO = 0

setinletassist(INLET_FOO, 'Description of Inlet')
setoutletassist(OUTLET_FOO, 'Description of Outlet')

log('reloaded')

const state = {
  trackIds: [] as number[],
}

function getTracks() {
  const api = new LiveAPI(() => {}, 'live_set')
  const trackCount = api.getcount('tracks')
  //log('TRACK COUNT: ' + trackCount)
  const tracks: LiveAPI[] = []

  for (let index = 0; index < trackCount; index++) {
    api.path = 'live_set tracks ' + index
    const trackApi = new LiveAPI(() => {}, api.path)
    tracks.push(trackApi)
  }

  return tracks
}

function initialize() {
  const tracks = getTracks()
  
  tracks.forEach((track, index) => {
    const name = track.get('name')
    log(`Track ${index}: ${name}`)
  })
}

initialize()

// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
const module = {}
export = {}
