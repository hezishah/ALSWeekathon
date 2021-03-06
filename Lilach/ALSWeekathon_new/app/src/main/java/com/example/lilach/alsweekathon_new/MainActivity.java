/*
 * Copyright (C) 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.example.lilach.alsweekathon_new;




import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.UnsupportedEncodingException;
import java.text.DateFormat;
import java.util.Date;

import java.io.File;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.nordicsemi.nrfUARTv2.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.res.Configuration;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.net.http.AndroidHttpClient;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import com.opencsv.CSVParser;
import com.opencsv.CSVReader;
import java.text.*;
import com.google.gson.Gson;
import java.util.ArrayList;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import org.json.JSONObject;


public class MainActivity extends Activity implements RadioGroup.OnCheckedChangeListener {
    private static final int REQUEST_SELECT_DEVICE = 1;
    private static final int REQUEST_ENABLE_BT = 2;
    private static final int UART_PROFILE_READY = 10;
    public static final String TAG = "nRFUART";
    private static final int UART_PROFILE_CONNECTED = 20;
    private static final int UART_PROFILE_DISCONNECTED = 21;
    private static final int STATE_OFF = 10;


    private static final int PACKET_NUMBER_INDEX = 0;
    private static final int GYROSCOPE_X_INDEX = 1;
    private static final int GYROSCOPE_Y_INDEX = 2;
    private static final int GYROSCOPE_Z_INDEX = 3;
    private static final int ACCELEROMETER_X_INDEX = 4;
    private static final int ACCELEROMETER_Y_INDEX = 5;
    private static final int ACCELEROMETER_Z_INDEX = 6;
    private static final int MAGNETOMETER_X_INDEX = 7;
    private static final int MAGNETOMETER_Y_INDEX = 8;
    private static final int MAGNETOMETER_Z_INDEX = 9;


    TextView mRemoteRssiVal;
    RadioGroup mRg;
    private int mState = UART_PROFILE_DISCONNECTED;
    //private UartService mService = null;
    private BluetoothDevice mDevice = null;
    private BluetoothAdapter mBtAdapter = null;
    private ListView messageListView;
    private ArrayAdapter<String> listAdapter;
    private Button btnConnectDisconnect,btnSend;
    private EditText edtMessage;

    public static void makeRequest(String uri, String json) {
        final String  uri_final = uri;
        final String  json_final = json;
        Thread thread = new Thread(new Runnable(){
            @Override
            public void run() {
                try {
                    //Your code goes here

                    HttpClient httpclient = new DefaultHttpClient();
                    HttpPost httppost = new HttpPost(uri_final);
                    httppost.setHeader("Accept", "application/json");
                    httppost.setHeader("Content-type", "application/json");

                    try {
                        // Add your data

                        httppost.setEntity(new StringEntity(json_final));

                        // Execute HTTP Post Request
                        HttpResponse response = httpclient.execute(httppost);
                        Log.d("response: ", response.getEntity().toString());
                       // return response;

                    } catch (ClientProtocolException e) {
                        // TODO Auto-generated catch block
                        Log.d("exception: " , e.getMessage());
                    } catch (IOException e) {
                        // TODO Auto-generated catch block
                        Log.d("exception: " , e.getMessage());
                    }
                    catch (Exception e)
                    {
                        Log.d("exception: " , e.getMessage());
                    }
                   // return null;
                } catch (Exception e) {
                    e.printStackTrace();
                    Log.d("exception: " , e.getMessage());
                }
            }
        });

        thread.start();



//        //HttpClient httpClient = new DefaultHttpClient();
//       // HttpClient httpclient = HttpClientBuilder.create().build();
//       // MinimalHttpClient httpclient = new HttpClientBuilder().build();
//       // AndroidHttpClient
//        try {
//            HttpPost httpPost = new HttpPost(uri);
//            httpPost.setEntity(new StringEntity(json));
//            httpPost.setHeader("Accept", "application/json");
//            httpPost.setHeader("Content-type", "application/json");
//            return new DefaultHttpClient().execute(httpPost);
//        } catch (UnsupportedEncodingException e) {
//            e.printStackTrace();
//        } catch (ClientProtocolException e) {
//            e.printStackTrace();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return null;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ///////////////////////////////////////////
        try {
            String yourFilePath = Environment.getExternalStorageDirectory() + "/" + "spiralStairs_CalInertialAndMag.csv";
            CSVReader reader = new CSVReader(new FileReader(yourFilePath));

            String [] nextLine;
            //skip the first line - headers
            reader.readNext();
            LinkedList<Signal> signals = new LinkedList<Signal>();

            for(int i= 0; i<3; i++){
                nextLine = reader.readNext();
           // while ((nextLine = reader.readNext()) != null) {
                // nextLine[] is an array of values from the line
                System.out.println(nextLine[0] + nextLine[1] + "etc...");
                Signal signal = new Signal();
                signal.setTimestamp(new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new java.util.Date()));
                signal.setPacketId(Integer.parseInt(nextLine[PACKET_NUMBER_INDEX]));
                signal.setAccelerometer(new XYZValues(Float.parseFloat(nextLine[ACCELEROMETER_X_INDEX]),
                        Float.parseFloat(nextLine[ACCELEROMETER_Y_INDEX]),
                        Float.parseFloat(nextLine[ACCELEROMETER_Z_INDEX])));
                signal.setGyro(new XYZValues(Float.parseFloat(nextLine[GYROSCOPE_X_INDEX]),
                        Float.parseFloat(nextLine[GYROSCOPE_Y_INDEX]),
                        Float.parseFloat(nextLine[GYROSCOPE_Z_INDEX])));


                signals.add(signal);

            }

            serverRequest sr = new serverRequest();
            sr.setSignals(signals);
            sr.setUserid("user");
            sr.setTimestamp("111111");

           //send the data to the server: Json, Post
            Gson gson = new Gson();
            String json = gson.toJson(sr);
            Log.d("aa",json);
            makeRequest("http://alsvm.cloudapp.net:8080/signals/user", json);
           // HttpResponse a = makeRequest("http://alsvm.cloudapp.net:8080/signals/user", json);
           // Log.d("httpResponse", a.toString());


//            List myEntries = reader.readAll();
//            System.out.println("size: " +myEntries.size());
//            System.out.println("first item: "+myEntries.get(0));


        }
        catch (IOException e)
        {
            Log.d("exception: " , e.getMessage());
        }


        //////////////////////////////////////////////

        setContentView(R.layout.main);
        mBtAdapter = BluetoothAdapter.getDefaultAdapter();
        if (mBtAdapter == null) {
            Toast.makeText(this, "Bluetooth is not available", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        messageListView = (ListView) findViewById(R.id.listMessage);
        listAdapter = new ArrayAdapter<String>(this, R.layout.message_detail);
        messageListView.setAdapter(listAdapter);
        messageListView.setDivider(null);
        btnConnectDisconnect=(Button) findViewById(R.id.btn_select);
        btnSend=(Button) findViewById(R.id.sendButton);
        edtMessage = (EditText) findViewById(R.id.sendText);
       /// service_init();



        // Handler Disconnect & Connect button
        btnConnectDisconnect.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!mBtAdapter.isEnabled()) {
                    Log.i(TAG, "onClick - BT not enabled yet");
                    Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                    startActivityForResult(enableIntent, REQUEST_ENABLE_BT);
                }
                else {
                	if (btnConnectDisconnect.getText().equals("Connect")){

                		//Connect button pressed, open DeviceListActivity class, with popup windows that scan for devices

            			Intent newIntent = new Intent(MainActivity.this, DeviceListActivity.class);
            			startActivityForResult(newIntent, REQUEST_SELECT_DEVICE);
        			} else {
        				//Disconnect button pressed
//        				if (mDevice!=null)
//        				{
//        					//mService.disconnect();
//
//        				}
        			}
                }
            }
        });
        // Handler Send button
        btnSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            	EditText editText = (EditText) findViewById(R.id.sendText);
            	String message = editText.getText().toString();
            	byte[] value;
				try {
					//send data to service
					value = message.getBytes("UTF-8");
					//mService.writeRXCharacteristic(value);
					//Update the log with time stamp
					String currentDateTimeString = DateFormat.getTimeInstance().format(new Date());
					listAdapter.add("["+currentDateTimeString+"] TX: "+ message);
               	 	messageListView.smoothScrollToPosition(listAdapter.getCount() - 1);
               	 	edtMessage.setText("");
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

            }
        });

        // Set initial UI state

    }


//    //UART service connected/disconnected
//    private ServiceConnection mServiceConnection = new ServiceConnection() {
//        public void onServiceConnected(ComponentName className, IBinder rawBinder) {
//        		mService = ((UartService.LocalBinder) rawBinder).getService();
//        		Log.d(TAG, "onServiceConnected mService= " + mService);
//        		if (!mService.initialize()) {
//                    Log.e(TAG, "Unable to initialize Bluetooth");
//                    finish();
//                }
//
//        }
//
//        public void onServiceDisconnected(ComponentName classname) {
//       ////     mService.disconnect(mDevice);
//        		mService = null;
//        }
//    };

    private Handler mHandler = new Handler() {
        @Override
        
        //Handler events that received from UART service 
        public void handleMessage(Message msg) {
  
        }
    };

    private final BroadcastReceiver UARTStatusChangeReceiver = new BroadcastReceiver() {

        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            final Intent mIntent = intent;
           //*********************//
//            if (action.equals(UartService.ACTION_GATT_CONNECTED)) {
//            	 runOnUiThread(new Runnable() {
//                     public void run() {
//                         	String currentDateTimeString = DateFormat.getTimeInstance().format(new Date());
//                             Log.d(TAG, "UART_CONNECT_MSG");
//                             btnConnectDisconnect.setText("Disconnect");
//                             edtMessage.setEnabled(true);
//                             btnSend.setEnabled(true);
//                             ((TextView) findViewById(R.id.deviceName)).setText(mDevice.getName()+ " - ready");
//                             listAdapter.add("["+currentDateTimeString+"] Connected to: "+ mDevice.getName());
//                        	 	messageListView.smoothScrollToPosition(listAdapter.getCount() - 1);
//                             mState = UART_PROFILE_CONNECTED;
//                     }
//            	 });
//            }
           
          //*********************//
//            if (action.equals(UartService.ACTION_GATT_DISCONNECTED)) {
//            	 runOnUiThread(new Runnable() {
//                     public void run() {
//                    	 	 String currentDateTimeString = DateFormat.getTimeInstance().format(new Date());
//                             Log.d(TAG, "UART_DISCONNECT_MSG");
//                             btnConnectDisconnect.setText("Connect");
//                             edtMessage.setEnabled(false);
//                             btnSend.setEnabled(false);
//                             ((TextView) findViewById(R.id.deviceName)).setText("Not Connected");
//                             listAdapter.add("["+currentDateTimeString+"] Disconnected to: "+ mDevice.getName());
//                             mState = UART_PROFILE_DISCONNECTED;
//                             //mService.close();
//                            //setUiState();
//
//                     }
//                 });
//            }
//
          
          //*********************//
//            if (action.equals(UartService.ACTION_GATT_SERVICES_DISCOVERED)) {
//             	 mService.enableTXNotification();
//            }
          //*********************//
//            if (action.equals(UartService.ACTION_DATA_AVAILABLE)) {
//
//                 final byte[] txValue = intent.getByteArrayExtra(UartService.EXTRA_DATA);
//                 runOnUiThread(new Runnable() {
//                     public void run() {
//                         try {
//                         	String text = new String(txValue, "UTF-8");
//                         	String currentDateTimeString = DateFormat.getTimeInstance().format(new Date());
//                        	 	listAdapter.add("["+currentDateTimeString+"] RX: "+text);
//                        	 	messageListView.smoothScrollToPosition(listAdapter.getCount() - 1);
//
//                         } catch (Exception e) {
//                             Log.e(TAG, e.toString());
//                         }
//                     }
//                 });
//             }
           //*********************//
//            if (action.equals(UartService.DEVICE_DOES_NOT_SUPPORT_UART)){
//            	showMessage("Device doesn't support UART. Disconnecting");
//            	mService.disconnect();
//            }
            
            
        }
    };

//    private void service_init() {
//        Intent bindIntent = new Intent(this, UartService.class);
//        bindService(bindIntent, mServiceConnection, Context.BIND_AUTO_CREATE);
//
//        LocalBroadcastManager.getInstance(this).registerReceiver(UARTStatusChangeReceiver, makeGattUpdateIntentFilter());
//    }
//    private static IntentFilter makeGattUpdateIntentFilter() {
//        final IntentFilter intentFilter = new IntentFilter();
//        intentFilter.addAction(UartService.ACTION_GATT_CONNECTED);
//        intentFilter.addAction(UartService.ACTION_GATT_DISCONNECTED);
//        intentFilter.addAction(UartService.ACTION_GATT_SERVICES_DISCOVERED);
//        intentFilter.addAction(UartService.ACTION_DATA_AVAILABLE);
//        intentFilter.addAction(UartService.DEVICE_DOES_NOT_SUPPORT_UART);
//        return intentFilter;
//    }
    @Override
    public void onStart() {
        super.onStart();
    }

    @Override
    public void onDestroy() {
    	 super.onDestroy();
        Log.d(TAG, "onDestroy()");
        
        try {
        	LocalBroadcastManager.getInstance(this).unregisterReceiver(UARTStatusChangeReceiver);
        } catch (Exception ignore) {
            Log.e(TAG, ignore.toString());
        } 
       // unbindService(mServiceConnection);
       // mService.stopSelf();
      //  mService= null;

    }

    @Override
    protected void onStop() {
        Log.d(TAG, "onStop");
        super.onStop();
    }

    @Override
    protected void onPause() {
        Log.d(TAG, "onPause");
        super.onPause();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "onRestart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "onResume");
        if (!mBtAdapter.isEnabled()) {
            Log.i(TAG, "onResume - BT not enabled yet");
            Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableIntent, REQUEST_ENABLE_BT);
        }
 
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {

        case REQUEST_SELECT_DEVICE:
        	//When the DeviceListActivity return, with the selected device address
            if (resultCode == Activity.RESULT_OK && data != null) {
                String deviceAddress = data.getStringExtra(BluetoothDevice.EXTRA_DEVICE);
                mDevice = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(deviceAddress);
               
               // Log.d(TAG, "... onActivityResultdevice.address==" + mDevice + "mserviceValue" + mService);
                ((TextView) findViewById(R.id.deviceName)).setText(mDevice.getName()+ " - connecting");
              //  mService.connect(deviceAddress);
                            

            }
            break;
        case REQUEST_ENABLE_BT:
            // When the request to enable Bluetooth returns
            if (resultCode == Activity.RESULT_OK) {
                Toast.makeText(this, "Bluetooth has turned on ", Toast.LENGTH_SHORT).show();

            } else {
                // User did not enable Bluetooth or an error occurred
                Log.d(TAG, "BT not enabled");
                Toast.makeText(this, "Problem in BT Turning ON ", Toast.LENGTH_SHORT).show();
                finish();
            }
            break;
        default:
            Log.e(TAG, "wrong request code");
            break;
        }
    }

    @Override
    public void onCheckedChanged(RadioGroup group, int checkedId) {
       
    }

    
    private void showMessage(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
  
    }

    @Override
    public void onBackPressed() {
        if (mState == UART_PROFILE_CONNECTED) {
            Intent startMain = new Intent(Intent.ACTION_MAIN);
            startMain.addCategory(Intent.CATEGORY_HOME);
            startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(startMain);
            showMessage("nRFUART's running in background.\n             Disconnect to exit");
        }
        else {
            new AlertDialog.Builder(this)
            .setIcon(android.R.drawable.ic_dialog_alert)
            .setTitle(R.string.popup_title)
            .setMessage(R.string.popup_message)
            .setPositiveButton(R.string.popup_yes, new DialogInterface.OnClickListener()
                {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
   	                finish();
                }
            })
            .setNegativeButton(R.string.popup_no, null)
            .show();
        }
    }
}
