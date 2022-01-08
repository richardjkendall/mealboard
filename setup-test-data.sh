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
curl -X PUT http://localhost:5000/family/ -d @test-data/create_family_2.json --header "Content-Type: application/json"

# add user rjk to family as edit user
curl -X PUT http://localhost:5000/family/1/other_users/2 -d @test-data/create_user2family.json --header "Content-Type: application/json"

# get users
#curl http://localhost:5000/user/
#curl http://localhost:5000/user/ --header "x-remote-user: rjk"

curl -X PUT http://localhost:5000/family/1/board -d @test-data/create_board.json --header "Content-Type: application/json"

curl -X PUT http://localhost:5000/family/1/board -d @test-data/create_board_2.json --header "Content-Type: application/json"
curl -X PATCH http://localhost:5000/family/1/board/2 -d @test-data/update_board.json --header "Content-Type: application/json"

# this should fail
curl -X PATCH http://localhost:5000/family/1/board/2 -d @test-data/update_board.json \
  --header "Content-Type: application/json" \
  --header "x-remote-user: rjk"

curl -X PUT http://localhost:5000/family/1/board/1/week -d @test-data/create_week_1.json --header "Content-Type: application/json"

# this should fail
curl -X PUT http://localhost:5000/family/1/board/2/week -d @test-data/create_week_1.json \
  --header "Content-Type: application/json" \
  --header "x-remote-user: rjk"

curl -X PUT http://localhost:5000/family/1/meal -d @test-data/create_meal.json --header "Content-Type: application/json"
curl -X PUT http://localhost:5000/family/1/board/1/week/1/meal -d @test-data/create_week_to_meal.json --header "Content-Type: application/json"