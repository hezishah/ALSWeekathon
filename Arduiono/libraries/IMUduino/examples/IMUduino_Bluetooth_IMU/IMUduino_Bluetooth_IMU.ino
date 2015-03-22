/**  ..... FreeIMU library ....
 * Example program for using the FreeIMU connected to an Arduino Leonardo.
 * The program reads sensor data from the FreeIMU, computes the yaw, pitch
 * and roll using the FreeIMU library sensor fusion and use them to move the
 * mouse cursor. The mouse is emulated by the Arduino Leonardo using the Mouse
 * library.
 * 
 * @author Fabio Varesano - fvaresano@yahoo.it
*/

//   ..... Adafruit nRF8001 libary ....
/*********************************************************************
This is an example for our nRF8001 Bluetooth Low Energy Breakout

  Pick one up today in the adafruit shop!
  ------> http://www.adafruit.com/products/1697

Adafruit invests time and resources providing this open source code, 
please support Adafruit and open-source hardware by purchasing 
products from Adafruit!

Written by Kevin Townsend/KTOWN  for Adafruit Industries.
MIT license, check LICENSE for more information
All text above, and the splash screen below must be included in any redistribution
*********************************************************************/

#include <HMC58X3.h>
#include <MS561101BA.h>
#include <I2Cdev.h>
#include <MPU60X0.h>
#include <EEPROM.h>

//#define DEBUG
#include "DebugUtils.h"
#include "IMUduino.h"
#include <Wire.h>
#include <SPI.h>

// Adafruit nRF8001 Library
#include "Adafruit_BLE_UART.h"

// Connect CLK/MISO/MOSI to hardware SPI
// e.g. On UNO & compatible: CLK = 13, MISO = 12, MOSI = 11
//      On Leo & compatible: CLK = 15, MISO = 14, MOSI = 16
#define ADAFRUITBLE_REQ 10
#define ADAFRUITBLE_RDY 7     // This should be an interrupt pin, on Uno thats #2 or #3
#define ADAFRUITBLE_RST 9

Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(ADAFRUITBLE_REQ, ADAFRUITBLE_RDY, ADAFRUITBLE_RST);

aci_evt_opcode_t laststatus = ACI_EVT_DISCONNECTED;
aci_evt_opcode_t status = laststatus;

int raw_values[11];
char str[512];
float val[9];

int i = 0;
String strSection;
char sendbuffersize;
uint8_t sendbuffer[20];

int mode = 0; // 0 = accel (default), 1 = gyro, 2 = mag, 3 = baro (temp and baro)

// Set the FreeIMU object
IMUduino my3IMU = IMUduino();


void setup() {
////  Mouse.begin();
  
  Serial.begin(9600);
  while(!Serial);
  Wire.begin();
  
  Serial.println(F("IMUduino Print echo demo"));
  
  delay(500);
  my3IMU.init(true);
  BTLEserial.begin();
}


void loop() {
  
  btleLoop();
  if (status == ACI_EVT_CONNECTED) {
    
    my3IMU.getRawValues(raw_values);
    
    // Send raw IMU values to our app!
    sprintf(str, "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]", 
      raw_values[0], 
      raw_values[1], 
      raw_values[2], 
      raw_values[3], 
      raw_values[4], 
      raw_values[5], 
      raw_values[6], 
      raw_values[7], 
      raw_values[8], 
      raw_values[9], 
      raw_values[10]
    );
    
    // Our btleWrite() method handles spliting chars into 20-byte chunks
    btleWrite(str);
    delay(150);
  }
}

/**************************************************************************/
/*!
    Constantly checks for new events on the nRF8001
*/
/**************************************************************************/

void btleLoop() {
  // Tell the nRF8001 to do whatever it should be working on.
  BTLEserial.pollACI();

  // Ask what is our current status
  status = BTLEserial.getState();
  // If the status changed....
  if (status != laststatus) {
    // print it out!
    if (status == ACI_EVT_DEVICE_STARTED) {
        Serial.println(F("* Advertising started"));
    }
    if (status == ACI_EVT_CONNECTED) {
        Serial.println(F("* Connected!"));
    }
    if (status == ACI_EVT_DISCONNECTED) {
        Serial.println(F("* Disconnected or advertising timed out"));
    }
    // OK set the last status change to this one
    laststatus = status;
  }

  if (status == ACI_EVT_CONNECTED) {
    // Lets see if there's any data for us!
    if (BTLEserial.available()) {
      Serial.print("* "); Serial.print(BTLEserial.available()); Serial.println(F(" bytes available from BTLE"));
    }
    // OK while we still have something to read, get a character and print it out
    while (BTLEserial.available()) {
      char c = BTLEserial.read();
      Serial.print(c);
    }

    // Next up, see if we have any data to get from the Serial console

    if (Serial.available()) {
      // Read a line from Serial
      Serial.setTimeout(100); // 100 millisecond timeout
      String s = Serial.readString();
      
      btleWrite(s);
    }
  }
}

void btleWrite(String s) {
  // We need to convert the line to bytes, no more than 20 at this time
    int len = s.length();
    
    for (i = 0; i < len; i+= 20) {
      if (i > 0) {
        btleLoop(); // We need to let our BTLE serial object poll, otherwise our Arduino sketch freezes up after about 3 to 6 write() calls.
      }
      strSection = s.substring(i, i + 20);
      
      strSection.getBytes(sendbuffer, 20);
      
      sendbuffersize = min(20, strSection.length());
      
      // write the data
      BTLEserial.write(sendbuffer, sendbuffersize);

      sendbuffersize = NULL;
      strSection = "";
      
    }
    i = 0;
    
}

byte * float2str(float arg) {
  // get access to the float as a byte-array:
  byte * data = (byte *) &arg;
  return data;
}
