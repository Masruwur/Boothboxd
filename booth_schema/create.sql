-- Connect to the pluggable database as a privileged user (like SYSTEM)
-- You must first connect to XEPDB1:

ALTER SESSION SET CONTAINER = XEPDB1;

-- Now create the user
CREATE USER booth_owner IDENTIFIED BY boothboxd;

-- Grant required privileges
GRANT CONNECT, RESOURCE TO booth_owner;

-- Optionally, grant quota on tablespace (if needed)
ALTER USER booth_owner DEFAULT TABLESPACE users;
ALTER USER booth_owner QUOTA UNLIMITED ON users;
GRANT DBA TO booth_owner;


