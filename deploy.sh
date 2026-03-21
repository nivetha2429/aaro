#!/bin/bash
set -e
cd /Users/nivetha/Desktop/Aaro
VPS="root@213.210.37.120"
REMOTE="/home/aarogroups"

echo "🔨 Building frontend..."
npm run build

echo "📤 Uploading dist..."
scp -r dist/ $VPS:$REMOTE/

echo "📤 Uploading server files..."
scp server/server.js server/package.json server/seedAdmin.js $VPS:$REMOTE/server/
scp -r server/middleware/ $VPS:$REMOTE/server/
scp -r server/routes/ $VPS:$REMOTE/server/
scp -r server/models/ $VPS:$REMOTE/server/
scp -r server/config/ $VPS:$REMOTE/server/
scp -r server/lib/ $VPS:$REMOTE/server/

echo "🔄 Installing deps & restarting on VPS..."
ssh $VPS "cd $REMOTE/server && npm install --production && cd .. && pm2 restart aarogroups && pm2 save"

echo "✅ Deployed! Live at https://aarogroups.com"
