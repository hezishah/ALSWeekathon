# ALS Server

## Setup VM
On Azure Portal: 
   Create an Azure Windows Server VM (service name: alsvm)
   install node.js
   install mongodb
   create a folder c:\mongodb\data
   change the mongodb data folder to c:\mongodb\data by running the following command:
       "c:\Program Files\MongoDB\Server\3.1\bin\mongod.exe" -dbpath c:\mongodb\data 

## First Time Deployment
On Azure Portal: Add a public HTTP endpoint on port 8080 
Use Remote Desktop Connection to connect to alsvm.cloudapp.net:55617 and do the following:
   Create folder c:\ALSWeekathon\Server
   Copy latest code from Github under that folder
   On command line run: 'node index.js' and verify that the server is running locally by opening http://localhost:8080/ping. This should return OK.
   Now you need to open port 8080 on Windows Firewall (see http://azure.microsoft.com/en-us/documentation/articles/virtual-machines-install-mongodb-windows-server/)
   To make sure it all works, go to http://alsvm.cloudapp.net:8080/ping. This should result in an 'OK' response 
   Run mongodb service: "c:\Program Files\MongoDB\Server\3.1\bin\mongod.exe" 
   
## Re-deployment
The server is currently deployed on an Azure VM: http://alsvm.cloudapp.net:8080 (for user name and password, ask Limor)
The service code is located on c:\ALSWeekathon\Server
Update the code with the recent code from Github
restart the nodejs service 

