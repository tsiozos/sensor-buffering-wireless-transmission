MAXDATA = 1200
sensordata = bytearray(MAXDATA)  #SENSOR DATA - 8 bit per reading
tstamps = bytearray(MAXDATA*4)   # TIMESTAMPS - 32 bit per reading

def getDataAtPos(pos):
    global sensordata
    return sensordata[pos]

def getStampAtPos(pos):
    global tstamps
    tpos = 4*pos
    tmstmp = tstamps[tpos]+\
                tstamps[tpos+1]*256+\
                tstamps[tpos+2]*65536+\
                tstamps[tpos+3]*16777216
    return tmstmp


def putDataAtPos(pos, tstamp, data):
    global sensordata, tstamps
    tpos = 4*pos
    tstamps[tpos]=tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+1]= tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+2]= tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+3]= tstamp
    sensordata[pos]=data

    tmstmp = tstamps[tpos]+\
                tstamps[tpos+1]*256+\
                tstamps[tpos+2]*65536+\
                tstamps[tpos+3]*16777216
    data = sensordata[pos]

basic.pause(1050)
putDataAtPos(0, input.running_time()/1000,66)
dt = getDataAtPos(0)
st = getStampAtPos(0)
print("Timestamp="+str(st)+" data="+str(dt))

basic.pause(1050)
putDataAtPos(1, input.running_time()/1000,77)
dt = getDataAtPos(1)
st = getStampAtPos(1)
print("Timestamp="+str(st)+" data="+str(dt))
