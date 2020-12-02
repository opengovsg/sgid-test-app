#!/bin/bash
# create cloudwatch agent config file
echo "running 02_start_cloudwatch hook"
cat <<EOT >> /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 30,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "append_dimensions": {
      "AutoScalingGroupName": "${aws:AutoScalingGroupName}",
      "ImageId": "${aws:ImageId}",
      "InstanceId": "${aws:InstanceId}",
      "InstanceType": "${aws:InstanceType}"
    },
    "metrics_collected": {
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 30,
        "resources": ["*"],
        "ignore_file_system_types": ["sysfs", "devtmpfs"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 30
      }
    }
  }
}

EOT

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a append-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
