package com.nordicsemi.nrfUARTv2;

/**
 * Created by hezi on 24/03/2015.
 */
public class ServerRequest {
   // private LinkedList<Data> data;
   // private String userid;
    private long timestamp;
    private Sensor sensors;

//    public void setData(LinkedList<Data> data) {
//        this.data = data;
//    }
//
//    public LinkedList<Data> getData() {
//        return data;
//    }
//
//    public void setUserid(String userid) {
//        this.userid = userid;
//    }
//
//    public String getUserid() {
//        return userid;
//    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setSensors(Sensor sensors) {
        this.sensors = sensors;
    }

    public Sensor getSensors() {
        return sensors;
    }
}
