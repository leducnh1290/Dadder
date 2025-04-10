use  master
drop database Dadder
ALTER DATABASE [Dadder] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
ALTER DATABASE [DbProduct] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
drop database DBProduct
DROP DATABASE [Dadder];
use Dadder
select *from Users
select *from Settings
select *from Messages

select *from Likes
select *from Blocks
select *from Messages

select *from Reports
select *from Notifs

select *from Infos
select *from Visits
select *from Users

delete from Visits where id = 3

use

SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Likes';

Delete from Likes Where Id = 41
select *from Notifs
select *from Connections
INSERT INTO Likes (LikerId, LikedId)
VALUES (3, 1);
delete from Messages Where Id = 3
INSERT INTO Messages (SenderId, ReceiverId, Content, Time) 
VALUES (1, 3, N'Xin chào Lê Ð?c Anh nhé!', GETDATE());



select *from Interests
select *from Photos


select *from Infos where UserId = 1
select *from Verifieds
select *from Connections


use DBProduct

select * from AspNetUsers
select * from AspNetRoles
select * from OrderItems
select * from Orders


delete from orders where Id = 5
UPDATE AspNetUserRoles
SET RoleId = '1cc23cbe-0b12-4460-a2f6-4a806a008e8a'
WHERE UserId = 'ad018785-c9b5-4de5-9767-d913aae60468';

INSERT INTO AspNetUserRoles (UserId, RoleId)
VALUES ('ad018785-c9b5-4de5-9767-d913aae60468', '84ce2f1a-7dbc-45e1-9afc-a85c2cb2309c');


Update Verifieds 
set Status = 1
Where UserId = 4

Delete from Users Where Id = 1

use ProductApi
select * from Categories
select * from Products