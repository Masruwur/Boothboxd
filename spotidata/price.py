import random
from register import register_album_price,connect,disconnect

def generate_album_prices(albums):
    price_list = []

    for album in albums:
        buy_price = round(random.uniform(5.99, 19.99), 2)
        sub_price = round(buy_price * random.uniform(0.05, 0.15), 2)
        price_list.append({
            "album_name": album,
            "prcs": buy_price,
            "subs": sub_price
        })
    
    return price_list


connection,cursor = connect()

query = """
          select album_name from albums
        """

cursor.execute(query)
result = cursor.fetchall()
albumNames = []
for res in result:
    albumNames.append(res[0])


album_data = generate_album_prices(albumNames)



for album_info in album_data:
    if register_album_price(cursor,album_info):
        print(f"{album_info['album_name']} price registerd")
        connection.commit()

disconnect(cursor,connection)




