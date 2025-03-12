output "ec2_public_ip" {
  value = aws_instance.webinar_ec2.public_ip
  description = "Public IP of the EC2 instance"
}
output "ec2_private_ip" {
  value = aws_instance.webinar_ec2.private_ip
  description = "Private IP of the EC2 instance"
  
}