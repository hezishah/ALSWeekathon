package com.nordicsemi.nrfUARTv2;

import java.util.LinkedList;
/**
 * Created by hezi on 24/03/2015.
 */
public class Sensor {

    private String name;
    private LinkedList<Data> data;

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setData(LinkedList<Data> data) {
        this.data = data;
    }

    public LinkedList<Data> getData() {
        return data;
    }
}
