import boto3
from dotenv import load_dotenv
import os

load_dotenv() # loads your .env file

s3 = boto3.client('s3', 
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_S3_REGION')
)

try:
    buckets = s3.list_buckets()
    print("Success! Your Ubuntu machine can see these buckets:", 
          [b['Name'] for b in buckets['Buckets']])
except Exception as e:
    print(f"Connection failed: {e}")