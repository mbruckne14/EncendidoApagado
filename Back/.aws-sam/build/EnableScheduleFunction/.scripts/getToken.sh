#!/bin/bash
echo "username $3"
echo "password $4"
echo "client_id $2"

AUTH_CHALLENGE_SESSION=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=$3,PASSWORD=$4 --client-id $2 --query "Session" --output text) 


aws  cognito-idp admin-respond-to-auth-challenge --user-pool-id $1 --client-id $2 --challenge-responses "NEW_PASSWORD=Testing1,USERNAME=alejandro.quintero@clouxter.com" --challenge-name NEW_PASSWORD_REQUIRED --session $AUTH_CHALLENGE_SESSION
