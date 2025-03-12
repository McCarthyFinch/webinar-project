#!/bin/bash
# Update system packages
sudo yum update -y

# Install Postgresql
sudo dnf update -y
sudo dnf install postgresql15.x86_64 postgresql15-server -y
sudo postgresql-setup --initdb -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
