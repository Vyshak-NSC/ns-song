#!/bin/bash
# setup.sh - Install yt-dlp

# Update apt repositories and install dependencies
apt-get update
apt-get install -y python3-pip

# Install yt-dlp using pip
pip3 install -U yt-dlp
