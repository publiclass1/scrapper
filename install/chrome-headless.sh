#! /bin/sh
clear

apt install -y libxss1 libappindicator1 libindicator7

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

dpkg -i google-chrome*.deb
apt install -y -f
rm google-chrome*.deb