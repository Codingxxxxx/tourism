#!/bin/bash

cd /var/www/kampottic.com/tourism
git pull
npm run build
pm2 restart kampottic.com