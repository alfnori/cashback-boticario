##!bin/sh
cd ..
docker-compose stop mongo seed
docker-compose build --no-cache seed
docker-compose up seed
