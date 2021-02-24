CREATE DATABASE unishop CHARSET=utf8;
use unishop;

#创建一个商品详情图片轮播表
CREATE TABLE shopimg(
   id INT,
   title VARCHAR(255),
   img_url VARCHAR(255)
);
INSERT INTO shopimg VALUES(1,'1','xm/1.jpg');
INSERT INTO shopimg VALUES(2,'2','xm/2.jpg');
INSERT INTO shopimg VALUES(3,'3','xm/3.jpg');

CREATE TABLE shopuser(
   id INT,
   uname VARCHAR(255),
   upwd VARCHAR(255)
);
INSERT INTO shopuser VALUES(1,'tom',md5('123'));
INSERT INTO shopuser VALUES(1,'ran',md5('123'));


CREATE TABLE shopuserinfo(
   id INT primary KEY AUTO_INCREMENT,
   uid INT,
   nick VARCHAR(32),
   phone VARCHAR(32),
   address VARCHAR(255)
);
INSERT INTO shopuserinfo VALUES(null,1,'tt','123','ab');
INSERT INTO shopuserinfo VALUES(null,1,'aa','123','cd');
