#!/bin/bash
export REACT_APP_API_URL="http://0.0.0.0:$SERVER_PORT"
export REACT_APP_NETWORK_GATEWAY=$NETWORK_GATEWAY
REACT_APP_API_URL=$REACT_APP_API_URL REACT_APP_NETWORK_GATEWAY=$NETWORK_GATEWAY npm run build