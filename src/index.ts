autowatch = 1
inlets = 1
outlets = 1

const config = {
  outputLogs: true,
}

import { logFactory, logReload, createValidatedLiveApi, warn } from './utils'
const logger = logFactory(config)

const INLET_FOO = 0
const OUTLET_FOO = 0

setinletassist(INLET_FOO, 'Description of Inlet')
setoutletassist(OUTLET_FOO, 'Description of Outlet')

logReload(logger)

// const state = {
//   trackIds: [] as number[],
// }

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

function getClips(track: LiveAPI): LiveAPI[] {
  const clips: LiveAPI[] = []
  const clipCount = track.getcount('arrangement_clips')
  const basePath = track.unquotedpath
  
  logger(`Checking ${clipCount} arrangement clips`)
  
  for (let clipIndex = 0; clipIndex < clipCount; clipIndex++) {
    const clipPath = `${basePath} arrangement_clips ${clipIndex}`
    
    try {
      const clip = createValidatedLiveApi(clipPath)
      logger(`Found clip ${clipIndex}:`)
      logger(`- name: ${clip.get('name')}`)
      logger(`- length: ${clip.get('length')}`)
      clips.push(clip)
    } catch (error) {
      warn(`Error accessing clip ${clipIndex}: ${error.message}`)
      // Continue to next iteration
    }
  }

  return clips
}

function initialize() {
  logger('initialize')
  const tracks = getTracks()
  
  tracks.forEach((track, index) => {
    const name = track.get('name')
    logger(`Track ${index}: ${name}`)
    
    const clips = getClips(track)
    logger(`Track ${index} has ${clips.length} clips`)
  })
}

function compile() {
  logger('COMPILE')
  initialize()
}

function bang() {
  logger('BANG')
  initialize()
}
logger('RELOADED END')

// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
const module = {}
export = {}
