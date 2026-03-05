#!/bin/sh
# wait-for-it.sh
# usage: ./wait-for-it.sh host:port -- command args

HOSTPORT=$1
shift

echo "⏳ Waiting for $HOSTPORT..."
while ! nc -z $(echo $HOSTPORT | cut -d: -f1) $(echo $HOSTPORT | cut -d: -f2); do
  sleep 1
done

echo "✅ $HOSTPORT is up!"
exec "$@"
