#!/bin/bash

sam deploy --guided --parameter-overrides UserPoolArn=arn:aws:cognito-idp:us-east-1:420213966676:userpool/us-east-1_zirmrjAqM UserPoolId=us-east-1_zirmrjAqM UserPoolTokenClient=4tmcrc0p5rao55dhuf7nh1mg4c
