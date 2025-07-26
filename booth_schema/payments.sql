CREATE TABLE card_info (
  info_id NUMBER PRIMARY KEY,
  user_id NUMBER,
  method_type VARCHAR2(255),
  last4 CHAR(4),
  expiry CHAR(5),
  balance NUMBER
);

CREATE TABLE transactions (
  trans_id NUMBER PRIMARY KEY,
  info_id NUMBER,
  amount NUMBER,
  status CHAR(1),
  created_at DATE
);

CREATE TABLE purchases (
  purchase_id NUMBER PRIMARY KEY,
  album_id NUMBER,
  trans_id NUMBER,
  created_at DATE,
  user_id NUMBER
);

CREATE TABLE subscription (
  subscription_id NUMBER PRIMARY KEY,
  album_id NUMBER,
  trans_id NUMBER,
  "from" DATE,
  "to" DATE,
  created_at DATE,
  user_id NUMBER
);

CREATE TABLE prices (
  price_id NUMBER PRIMARY KEY,
  album_id NUMBER,
  type CHAR(4),
  "from" DATE,
  "to" DATE,
  amount NUMBER
);

CREATE TABLE platform_fee (
  "from" DATE,
  "to" DATE,
  amount NUMBER,
  PRIMARY KEY ("from", "to")
);



ALTER TABLE card_info
  ADD CONSTRAINT fk_card_info_user FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_card_info FOREIGN KEY (info_id) REFERENCES card_info(info_id);

ALTER TABLE purchases
  ADD CONSTRAINT fk_purchases_album FOREIGN KEY (album_id) REFERENCES albums(album_id);

ALTER TABLE purchases
  ADD CONSTRAINT fk_purchases_transactions FOREIGN KEY (trans_id) REFERENCES transactions(trans_id);

ALTER TABLE subscription
  ADD CONSTRAINT fk_subscription_album FOREIGN KEY (album_id) REFERENCES albums(album_id);

ALTER TABLE subscription
  ADD CONSTRAINT fk_subscription_transactions FOREIGN KEY (trans_id) REFERENCES transactions(trans_id);

ALTER TABLE prices
  ADD CONSTRAINT fk_prices_album FOREIGN KEY (album_id) REFERENCES albums(album_id);


CREATE SEQUENCE card_info_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE transactions_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE purchases_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE subscription_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE prices_seq START WITH 1 INCREMENT BY 1;



