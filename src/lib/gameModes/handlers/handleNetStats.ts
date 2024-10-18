import { type DataStats } from '../../stats'
import { msPretty } from '../../stats'

export function initNetworkStats(
  angularVelocityGraph: DataStats,
  ammoGraph: DataStats,
  dataTest: DataStats,
  soSize: DataStats,
  shotSize: DataStats,
  speedbuf: DataStats,
  hpbuf: DataStats,
  packetSizeBuf: DataStats,
  rxByteDataBuf: DataStats,
  ppsbuf: DataStats,
  renderObjBuf: DataStats,
  timebuf: DataStats,
  downloadBuf: DataStats,
  batbuf: DataStats,
) {
  angularVelocityGraph.baseUnit = 'mdeg/f'
  angularVelocityGraph.label = 'Angular Vel.'
  ammoGraph.label = 'Ammo'
  ammoGraph.baseUnit = ''

  dataTest.baseUnit = 'B'
  dataTest.label = 'Reduced So Size'

  soSize.baseUnit = 'B'
  soSize.label = 'SpaceObject Size'

  shotSize.baseUnit = 'B'
  shotSize.label = 'Shot size'

  speedbuf.baseUnit = 'm/s'
  speedbuf.accUnit = 'm'
  speedbuf.label = 'Speed'
  // speedbuf.maxSize = 500

  hpbuf.baseUnit = 'hp'
  hpbuf.label = 'Hp'
  // hpbuf.maxSize = 1000

  // symbuf.maxSize = 500
  packetSizeBuf.baseUnit = 'B'
  packetSizeBuf.label = 'Packet'

  rxByteDataBuf.baseUnit = 'B'
  rxByteDataBuf.label = 'Data downloaded'
  // rxByteDataBuf.maxSize = 1000

  ppsbuf.baseUnit = 'pps'
  ppsbuf.label = 'Packets/sec'
  // ppsbuf.maxSize = 1000

  // renderObjBuf.maxSize = 2000
  renderObjBuf.baseUnit = 'obj'
  renderObjBuf.label = 'Obj/frame'

  timebuf.baseUnit = 's'
  timebuf.prettyPrint = msPretty
  timebuf.maxSize = 60
  timebuf.label = 'Time'

  downloadBuf.label = 'Download'
  downloadBuf.baseUnit = 'bit/s'
  downloadBuf.accUnit = 'bit'
  downloadBuf.maxSize = 60

  batbuf.label = 'Battery'
  batbuf.baseUnit = '%'
}
