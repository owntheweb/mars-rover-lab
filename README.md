# Drive a Homemade Rover Over the Internet

Mars Rover Lab streams photos and other sensor data from its Raspberry Pi components to a satellite server where that content can be streamed to the world via the "Mars Rover Mission Control" interface.

# WORK-IN-PROGRESS

This project is still being developed on several fronts. It's not ready for prime time yet. ;)

# The Satellite (web socket server)

[details coming soon]

# Mars Mission Control Client

[details coming soon]

# The Rover

## Ingredients

* Raspberry Pi (I'm using a Pi 2, but may switch to an A+ for size/power reasons, should still process everything ok)
* Pi camera
* 8 iBeacons
* WiFi USB dongle [find the brand I used]
* Bluetooth USB dongle [find the brand I used]
* [accelerometer/compass, details to follow]
* [fill in the rest of this list when the rover prototype is ready]

## Assemble the Rover

There are a few cool people in town putting together a very affordable tank-inspired rover body now. Standby for details.

## Install Raspbian to Disk (Debian Wheezy) via Mac

Download Raspbian .zip at https://www.raspberrypi.org/downloads/ and unzip.

Install (installation guides at: https://www.raspberrypi.org/documentation/installation/installing-images/README.md)

Insert the disk that will be used the Pi (via USB or disk port [update with proper names]) In terminal:
diskutil list

```
/dev/disk0
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                  Apple_HFS Macintosh HD            249.0 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
   4:       Microsoft Basic Data 
```

Then insert disk to format and compare:
diskutil list

```
/dev/disk0
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                  Apple_HFS Macintosh HD            249.0 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
   4:       Microsoft Basic Data                         130.1 GB   disk0s4
/dev/disk2
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *15.6 GB    disk2
   1:             Windows_FAT_32 boot                    58.7 MB    disk2s1
   2:                      Linux                         7.8 GB     disk2s2
```

disk2 is the inserted disk in this case.

Unmount that disk (change “2” to inserted disk!):
diskutil unmountDisk /dev/disk2

Burn image to disk (change “2” to inserted disk, and update .img name/location):
sudo dd bs=1m if=~/Downloads/2015-05-05-raspbian-wheezy.img of=/dev/disk2

Wait a very long time. Go make some coffee. Eat a snack (or even dinner). Go for a walk. Start watching a fascinating documentary. Don’t interrupt the process. ;)

Tip: If you want to see what it’s doing, enter control+t in the terminal. It will give a quick line like “load: 2.73  cmd: dd 3344 uninterruptible 0.00u 5.27s”, then follow up after a short while with something like this:

```
115+0 records in
114+0 records out
478150656 bytes transferred in 10703.183951 secs (44674 bytes/sec)
```

Just let it run. 

When finished, eject the disk from Mac (it will get mounted as “boot”), and insert it into the Pi. Plug in the HDMI, Ethernet Internet cable (wireless USB won’t help yet), a USB keyboard, turn on the TV, then turn on the Pi by plugging in its power cord.

## Configure Raspbian with rasp-config

When the Pi boots for the first time, you should see a blue screen with options. Choose “1 Expand Filesystem” by pressing return. Press return again to choose “OK”. 

Tip:
If you ever need to revisit this screen later or accidentally exit, the command to launch raspi-config is:

`sudo raspi-config`

The default password is `raspberry` if asked and you didn’t set a new one already. 

**IMPORTANT:** Be sure to set a new password for security purposes!
Arrow down to “2 Change User Password” and hit return. Hit return again to choose “OK”, then type in a good password. Press return and enter your password again. Hit return, then return again to choose “OK”.

The Mars rover lab will make use of the camera. Let’s enable it.

Arrow down and choose “5 Enable Camera”.

Arrow right and press return to choose “Enable”.

Were going to give the Pi a unique name that IT people will like to see on the network, letting them know a “rover lab” has connected and also which one if there are multiple rolling around.

Choose “8 Advanced Options”.

Choose “A2 Hostname”, then return again to choose “OK”.

Replace “raspberrypi” with “mars-rover-lab-1” and press return.

We’ll soon access the Pi remotely via terminal on another computer instead of plugging the Pi into a TV to access terminal or the desktop system (TV not much use when the Pi is on ‘Mars’, right?). This will happen using SSH and Wi-Fi. Let’s setup SSH to start.

Choose “8 Advanced Options”.

Choose “A4 SSH”, then return again to choose “Enable”. When setup is completed, press return again to choose “OK”.

The Pi will make use of sensors plugged into the I2C pins. Let’s enable access to those pins.

Choose “8 Advanced Options”.

Choose “A7 I2C”.

Arrow left to choose “Yes” and hit return. Hit return again to choose “OK”, then return again to choose “Yes”, which load the I2C kernel module by default when booting. Press return again to choose “OK”.

While we’re in raspi-config, let’s go ahead and setup audio. I won’t cover audio usage on the rover, but if we did want the rover eventually to make noise on Mars, we’ll want to force audio to use the headphone jack. The martians or the observers traveling from Earth might enjoy a rover talking to them later on!

Choose “8 Advanced Options”.

Choose “A9 Audio”.

Choose “1 Force 3.5mm (‘headphone’) jack

Finish everything up and reboot by right-arrowing to “Finish” at the bottom of the screen. This will make the changes happen!

## Create and Install an RSA Key for SSH Authentication 

Stop re-entering/transferring the text password every time you login to the Pi remotely by signing in with an RSA key instead. It's better security and also very convenient to "just connect".

On a Mac (make sure you are logged out of the Pi first):

```
ssh-keygen -t rsa
#[enter] leave passphrase empty
#[enter again]
scp ~/.ssh/id_rsa.pub pi@THE.PI.IP:~
```

Then we'll SSH into the Pi (will still require password at this point):

```
ssh pi@THE.PI.IP
cd $HOME
mkdir .ssh
touch .ssh/authorized_keys
cat id_rsa.pub >> .ssh/authorized_keys
rm id_rsa.pub
exit
```

Login again and a password should not be requested (yay!):

`ssh pi@THE.PI.IP`

SSH Tip:
It can be difficult to figure out where the Pi is located on the network if the Pi is not plugged into a TV (running headless). This tool will help identify the Pi’s IP address if needed: [find that tool link and make it part of the instructions, not a tip!]

## Update/Upgrade Raspian

Now we’ll login and update everything, to make sure we’re making the most of what Linux/Raspian has to offer. When you see the login prompt, enter “pi” as you username. The password is what you set earlier.

apt-get is the program that installs new software to Raspbian and to also upgrade the operating system using packages available on the internet. Let’s update apt-get and upgrade to the latest packages available for security and functional awesomeness.

`sudo apt-get update`

`sudo apt-get upgrade`

Type Y to approve extra file space needed. Wait as it does it’s thing. It could take a few minutes (or very little time)

## Configure Wi-Fi access

The rover will be connecting to our "satellite" via WiFi. With the Pi still connected to an Ethernet cable, edit the wireless configuration file:

`sudo nano /etc/wpa_supplicant/wpa_supplicant.conf`

While there may be different requirements depending on the type of wireless network and its settings, here's a sample file that worked for me. It includes two separate networks, allowing the rover to operate from home and also at work. For more configuration options, [see this](http://manpages.ubuntu.com/manpages/precise/man5/wpa_supplicant.conf.5.html).

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
ssid=“MY_HOME_WIRELESS_NAME”
psk=“MY_HOME_WIRELESS_PASSWORD”
proto=RSN
key_mgmt=WPA-PSK
pairwise=CCMP
auth_alg=OPEN
}

network={
ssid=“MY_OPTIONAL_OTHER_WIRELESS_NAME”
psk=“MY_OPTIONAL_OTHER_WIRELESS_PASSWORD”
proto=RSN
key_mgmt=WPA-PSK
pairwise=CCMP
auth_alg=OPEN
}
```

Reboot and test.

`sudo reboot & exit`

While the Ethernet cable is still connected and the Pi sufficiently rebooted, login again and test the wireless connection. You should see an IP address if everything was configured and connected correctly.

`ssh pi@THE.PI.IP`

then

`ifconfig`

You should see a "wlan0" section. The "inet addr" should have an IP address next to it. That's the one your looking for. If all is set, you could `exit` via terminal, disconnect your Ethernet cable, then reconnect using the wireless IP.

Another "quick" alternative to pull just the ip address (just harder to remember than 'ifconfig'):

```
export WIRELESSIP=$(sudo /sbin/ifconfig wlan0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1 }')
echo $WIRELESSIP
```

[Elaborate more regarding setting static IPs and/or how to find the rover on a wireless network later on.]

## Install Bluetooth Capabilities

Install iBeacon (uses Bluetooth Low Energy BLE) dependencies so that to rover can triangulate its position in the room and also detect distances from points of interest. (used by roverbeacon->bleacon->bleno node modules installed further down)

`sudo apt-get install bluetooth bluez-utils libbluetooth-dev`

##Install Node.js and Git

Node.js is server-side JavaScript that makes the magic happen with our app in this project.

`sudo apt-get install nodejs npm`

Install Git, which we'll use to pull node.js scripts from this and other node.js projects.

`sudo apt-get install git`

Get the node.js rover scripts from the GitHub repository by "cloning" it.

`git clone https://github.com/owntheweb/mars-rover-lab`

Note to self (nothing to see here):
Consider a "sparse checkout" or break this project up into smaller projects. We don't need the rover AND satellite files on the rover... unless someone wants to turn the rover into a website as well. That's a possibility but will also eat up processing, bandwidth and power usage?

## Install and configure required node.js modules via npm.

cd ~/mars-rover-lab/rover
npm install node-gyp express socket.io socket.io-stream bleacon lateration

## Configure Rover Script Settings

Allow roverbeacon->bleacon->bleno modules (installed in the command just above) to have access to run iBeacon scanning commands, not as a root user.

```
sudo apt-get install libcap2-bin
find -path '*noble*Release/hci-ble' -exec sudo setcap cap_net_raw+eip '{}' \;
find -path '*bleno*Release/hci-ble' -exec sudo setcap cap_net_raw+eip '{}' \;
```

Configure rover client to connect to the satellite server:

`nano ~/mars-rover-lab/rover/client.js`

[Elaborate on how to configure the script here]

## Test Run the Rover

Test to see if the rover client will run.

`node ~/mars-rover-lab/rover/client.js`

[more details here]

## Set Rover Client to Run Automatically Once Booted

[how to auto-login here, sandby]

[how to run a script once logged in via .bash_profile here, standby]

## To Be Continued...

This is a work-in-progress and there is still much to be done. Further instructions are to be continued...

# Thank You

**Special thanks goes to several people!** I will begin to fill this in very shortly.

![Space Foundation](http://www.spacefoundation.org/m/vcards/images/sfLogo.png)

This project is co-sponsored by the [Space Foundation](http://www.spacefoundation.org).

In addition to personal time spent on this project, extra special thanks goes to the Space Foundation team, supplying iBeacon hardware, a Raspberry Pi, WiFi dongle, and a little piece of "Mars" to play in. The Space Foundation is utilizing new technologies in a continued effort to further reach out and enhance student, teacher and visitor experiences at the [Space Foundation Discovery Center](http://www.spacefoundation.org/museum). Just imagine if our Teacher Liaisons in India could hold remote Mars missions with their students in our Mars Yard based in the United States!

You too can help the Space Foundation achieve their mission to inspire, enable and propel, by contributing to this project. :D