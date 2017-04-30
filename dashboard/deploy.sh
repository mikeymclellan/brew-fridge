#!/usr/bin/env bash
aws s3 cp $source_file s3://$target_bucket/$target_path
aws s3api put-object-acl — bucket $target_bucket — key $target_path — grant-read uri=http://acs.amazonaws.com/groups/global/AuthenticatedUsers