import os

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST') or exit("Missing environment variable: MYSQL_HOST")
    MYSQL_PORT = int(os.getenv('MYSQL_PORT') or exit("Missing environment variable: MYSQL_PORT"))
    MYSQL_USER = os.getenv('MYSQL_USER') or exit("Missing environment variable: MYSQL_USER")
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD') or exit("Missing environment variable: MYSQL_PASSWORD")
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE') or exit("Missing environment variable: MYSQL_DATABASE")
    SECRET_KEY = os.getenv('SECRET_KEY') or exit("Missing environment variable: SECRET_KEY")
