package com.nordicsemi.nrfUARTv2;

import java.util.LinkedList;

/**
 * Created by hezi on 24/03/2015.
 */
public class ServerRequest {
   // private LinkedList<Data> data;
   // private String userid;
    private long timestamp;
    private LinkedList<Sensor> sensors;

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

    public void setSensors(LinkedList<Sensor> sensors) {
        this.sensors = sensors;
    }

    public LinkedList<Sensor> getSensors() {
        return sensors;
    }
}
