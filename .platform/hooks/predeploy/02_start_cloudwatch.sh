#!/bin/bash
echo "running 02_start_cloudwatch hook"

# store elastic beanstalk environment name
EB_ENV="$(/opt/elasticbeanstalk/bin/get-config container -k environment_name)"

# create cloudwatch agent config file
cat <<EOT > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 30,
    "run_as_user": "root"
  },
  "metrics": {
    "append_dimensions": {
      "AutoScalingGroupName": "\${aws:AutoScalingGroupName}",
      "ImageId": "\${aws:ImageId}",
      "InstanceId": "\${aws:InstanceId}",
      "InstanceType": "\${aws:InstanceType}"
    },
    "metrics_collected": {
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"],
        "ignore_file_system_types": ["sysfs", "devtmpfs", "tmpfs"],
        "append_dimensions": {
          "Environment": "$EB_ENV"
        }
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60,
        "append_dimensions": {
          "Environment": "$EB_ENV"
        }
      },
      "swap": {
        "measurement": ["swap_used_percent"],
        "metrics_collection_interval": 60,
        "append_dimensions": {
          "Environment": "$EB_ENV"
        }
      }
    },
    "aggregation_dimensions" : [["Environment"]]
  }
}
EOT

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a append-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
