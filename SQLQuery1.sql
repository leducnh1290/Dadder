use  master
drop database Dadder
ALTER DATABASE [Dadder] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [Dadder];
use Dadder
select *from Users
select *from Infos

Update Verifieds 
set Status = 1
Where UserId = 2

Delete from Users Where Id = 1