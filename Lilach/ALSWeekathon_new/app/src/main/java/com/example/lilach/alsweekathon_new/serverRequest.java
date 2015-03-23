package com.example.lilach.alsweekathon_new;

import java.util.LinkedList;

/**
 * Created by Lilach on 23-Mar-15.
 */
public class serverRequest {
    private LinkedList<Signal> signals;
   private String userid;
    private String timestamp;

    public void setSignals(LinkedList<Signal> signals) {
        this.signals = signals;
    }

    public LinkedList<Signal> getSignals() {
        return signals;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }

    public String getUserid() {
        return userid;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getTimestamp() {
        return timestamp;
    }
}
