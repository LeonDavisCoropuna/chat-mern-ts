#!/bin/bash

URL="http://localhost:5000/api/auth/signup"
PASSWORD="123456"

declare -a names=(
  "Leon Davis"
  "Elon Musk"
  "Taylor Swift"
  "Cristiano Ronaldo"
  "Emma Watson"
  "Lionel Messi"
  "Ariana Grande"
  "Keanu Reeves"
  "Billie Eilish"
  "Robert Downey Jr."
)

for i in {1..10}
do
  fullname="${names[$((i-1))]}"
  username="ldavis$i"

  echo "📨 Creando usuario: $fullname ($username)"

  curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{
      \"fullname\": \"$fullname\",
      \"username\": \"$username\",
      \"password\": \"$PASSWORD\",
      \"confirmPassword\": \"$PASSWORD\",
      \"gender\": \"male\"
    }"

  echo -e "\n✅ Usuario $username creado\n"
done
