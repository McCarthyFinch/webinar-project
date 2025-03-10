provider "aws" {
  region = "us-east-1"
}

# Create a Security Group
resource "aws_security_group" "smart_notes_sg" {
  name        = "smart_notes_sg"
  description = "Allow SSH and HTTP traffic"
  vpc_id      = "vpc-02c4d5d5080574780"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.60.0.0/16"]  # Change this to your IP for security
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.60.0.0/16"]
  }
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.60.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create an EC2 instance
resource "aws_instance" "smart_notes_ec2" {
  ami                    = "ami-0c614dee691cbbf37" # Amazon Linux 2023 AMI
  instance_type          = "t3.large"
  key_name               = "poc-jenkins" # Change to your SSH key
  vpc_security_group_ids = [aws_security_group.smart_notes_sg.id]
  subnet_id = "subnet-0d728b2163ac46bec" # Change to your subnet
  user_data              = file("ec2-user-data.sh")
  iam_instance_profile   = "poc-jenkins-terraform-ssm-profile1"
  tags = {
    Name = "SmartNotes-EC2"
  }
}
