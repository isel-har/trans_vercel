#!/bin/sh

npm run build

exec npm start -- --port 8443
