#!/bin/sh

# drop all tables
rm data.db
sqlite3 data.db "VACUUM;"

# recreate the schema
source .env/bin/activate
python create_tables.py

# load test data
curl -X PUT http://localhost:5000/user/ -d @test-data/create_user.json --header "Content-Type: application/json"
# this should fail...
curl -X PUT http://localhost:5000/user/ -d @test-data/create_user.json --header "Content-Type: application/json"
curl -X PUT http://localhost:5000/user/ -d @test-data/create_user.json \
  --header "Content-Type: application/json" \
  --header "x-remote-user: rjk"


# create the family
curl -X PUT http://localhost:5000/family/ -d @test-data/create_family.json --header "Content-Type: application/json"