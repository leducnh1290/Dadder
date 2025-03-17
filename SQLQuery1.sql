use  master
drop database Dadder
ALTER DATABASE [Dadder] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [Dadder];
use Dadder
select *from Users
select *from Interests
select *from Photos


select *from Infos where UserId = 1
select *from Verifieds


Update Verifieds 
set Status = 1
Where UserId = 4

Delete from Users Where Id = 1