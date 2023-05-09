#!/bin/bash

# Update package lists and install nvm
sudo yum update -y
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Install latest version of node
nvm install latest
nvm use latest

# Install yarn
npm install -g yarn

# Install git
sudo yum install git

# Install chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo yum install ./google-chrome-stable_current_x86_64.rpm
sudo ln -s /usr/bin/google-chrome-stable /usr/bin/chromium

# Install pm2 process manager
yarn global add pm2

# Clone the Git repository that contains your Node.js script
git clone https://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@github.com/Kobby08/nz-database-web-scrapper-.git

# Change into the cloned directory
cd nz-database-web-scrapper || return

# Install project dependencies
yarn

# Start your Node.js script using pm2
pm2 start index.ts

# Set pm2 to start your script on server startup
pm2 startup
