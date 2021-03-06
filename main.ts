let i: number;
let MAXDATA = 1200
let globalIDX = 0
radio.setTransmitPower(7)
radio.setGroup(88)
input.temperature()
// prepare sensor
let sensordata = control.createBuffer(MAXDATA)
// SENSOR DATA - 8 bit per reading
for (i = 0; i < sensordata.length; i++) {
    sensordata[i] = 0
}
let tstamps = control.createBuffer(MAXDATA * 4)
//  TIMESTAMPS - 32 bit per reading
for (i = 0; i < tstamps.length; i++) {
    tstamps[i] = 0
}
function getDataAtPos(pos: number) {
    
    return sensordata[pos]
}

function getStampAtPos(pos: number) {
    
    let tpos = 4 * pos
    let tmstmp = tstamps[tpos] + tstamps[tpos + 1] * 256 + tstamps[tpos + 2] * 65536 + tstamps[tpos + 3] * 16777216
    return tmstmp
}

function strrepl(s: number, old: string, new_: string): string {
    let ss = "" + s
    let so = "" + old
    let sn = "" + new_
    let snew = ""
    for (let i = 0; i < ss.length; i++) {
        if (ss.charAt(i) == so) {
            snew = snew + sn
        } else {
            snew = snew + ss.charAt(i)
        }
        
    }
    return snew
}

function putDataAtPos(pos: number, tstamp: number, data: number) {
    
    let tpos = 4 * pos
    tstamps[tpos] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 1] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 2] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 3] = tstamp
    sensordata[pos] = data
    let tmstmp = tstamps[tpos] + tstamps[tpos + 1] * 256 + tstamps[tpos + 2] * 65536 + tstamps[tpos + 3] * 16777216
    data = sensordata[pos]
}

//  basic.pause(1050)
//  putDataAtPos(0, input.running_time()/1000,66)
//  dt = getDataAtPos(0)
//  st = getStampAtPos(0)
// print("Timestamp="+str(st)+" data="+str(dt))
//  basic.pause(1050)
//  putDataAtPos(1, input.running_time()/1000,77)
//  dt = getDataAtPos(1)
//  st = getStampAtPos(1)
//  print("Timestamp="+str(st)+" data="+str(dt))
function on_button_pressed_a() {
    
    console.log("-------------------")
    let stmp = getStampAtPos(0)
    let buff = control.createBuffer(5)
    for (let i = 0; i < globalIDX; i++) {
        buff[0] = sensordata[i]
        buff[1] = tstamps[4 * i]
        buff[2] = tstamps[4 * i + 1]
        buff[3] = tstamps[4 * i + 2]
        buff[4] = tstamps[4 * i + 3]
        radio.sendBuffer(buff)
        console.log("" + stmp + ", " + ("" + buff[0]))
        stmp = getStampAtPos(i)
        basic.pause(50)
    }
}

input.onButtonPressed(Button.A, on_button_pressed_a)
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    basic.showNumber(input.temperature())
})
radio.onReceivedBuffer(function on_received_buffer(rBuffer: Buffer) {
    let dat = Math.map(rBuffer[0], 0, 255, -100, 500) / 10
    let tmstmp = rBuffer[1] + rBuffer[2] * 256 + rBuffer[3] * 65536 + rBuffer[4] * 16777216
    let sdat = strrepl(dat, ".", ",")
    console.log("" + RadioPacketProperty.SerialNumber + ":" + ("" + tmstmp) + "; " + sdat)
})
function getNewData() {
    
    let dat = input.temperature()
    dat = Math.floor(Math.map(dat * 10, -100, 500, 0, 255))
    // convert to byte from -10.0 to 50.0 C
    let tst = input.runningTime() / 1000
    let olddat = getDataAtPos(globalIDX)
    if (olddat != dat) {
        //  write new data only if they change
        globalIDX += 1
        // next empty position
        putDataAtPos(globalIDX, tst, dat)
    }
    
}

// write data
// flash a led
control.setInterval(function onSet_interval_interval() {
    
    led.plot(2, 2)
    // print(str(globalIDX))
    getNewData()
    basic.pause(100)
    led.unplot(2, 2)
}, 60000, control.IntervalMode.Interval)
control.setInterval(function onSet_interval_interval2() {
    // every 15 minutes send the data
    on_button_pressed_a()
}, 60000 * 15, control.IntervalMode.Interval)
