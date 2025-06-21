import oracledb
def connect():
    try:
        username = "booth_owner"
        password = "boothboxd"
        dsn = "localhost/XEPDB1"

        connection = oracledb.connect(user=username,password=password,dsn=dsn)
        cursor = connection.cursor()
        return connection,cursor
    except oracledb.Error as e:
        print(e)
        return None

def disconnect(cursor,connection):
    cursor.close()
    connection.close()

